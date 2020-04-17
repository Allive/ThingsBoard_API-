const fetch = require('node-fetch');
const axios = require('axios');

async function getObjectID(name, type, tokenFlag = false) {
  if (name == null || type == null)
    return false;

  let entityName = encodeURI(name);
  entityName = entityName.replace("&", "%26");
  switch (type.toUpperCase()) {
    case "DEVICE":
      var url = 'http://' + TB_HOST + ':' + TB_PORT + "/api/tenant/devices?deviceName=" + name;
      break;
    case "ASSET":
      var url = 'http://' + TB_HOST + ':' + TB_PORT + "/api/tenant/assets?assetName=" + name;
      break;
    case "ENTITY_VIEW":
      var url = 'http://' + TB_HOST + ':' + TB_PORT + "/api/tenant/entityViews?entityViewName=" + name;
      break;
  }

  let response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-Authorization': 'Bearer ' + process.env.TB_TOKEN
    }
  });

  let ans = await response.json()
  if (typeof ans.id != 'undefined') {
    // if we don't want to get token,
    // return only id
    if (!tokenFlag) {
      return ans.id.id
    }

    if ((tokenFlag) && (type.toUpperCase() === "DEVICE")) {
       const token = await getDeviceToken(ans.id.id);

       if (!token){
         // error during get token
         return false;
       }
       // return complete obj
       return {
         "id": ans.id.id,
         "name": ans.name,
         "type": ans.id.entityType,
         "device_token": token,
       };
    }

  }
  else {
    return false
  }

}

async function getAllObjectKeys(id, type) {
  if (id == null || type == null || typeof type == 'undefined' || typeof name == 'undefined')
    return false
  var url = 'http://' + TB_HOST + ':' + TB_PORT + "/api/plugins/telemetry/" + type.toUpperCase() + "/" + id + "/keys/attributes"

  let getObjectKeys = await fetch(url, {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      'X-Authorization': 'Bearer ' + process.env.TB_TOKEN
    }
  });
  var ans = await getObjectKeys.json();
  return ans
}
/**
* If keys - null - trying to get all attributes
* @param {String} name
* @param {String} type
* @param {String} keys
*/
async function objectIDandKeys(name, type, keys) {
  if (id == null || type == null || typeof type == 'undefined' || typeof name == 'undefined')
    return false
  var id = await getObjectID(name, type);

  if (keys == null)
    keys = await getAllObjectKeys(id, type)


  var url = 'http://' + TB_HOST + ':' + TB_PORT + "/api/plugins/telemetry/" + type.toUpperCase() + "/" + id + "/values/attributes?keys=" + keys

  let getObjectAttrs = await fetch(url, {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      'X-Authorization': 'Bearer ' + process.env.TB_TOKEN
    }
  });
  var ans = await getObjectAttrs.json();
  var result = {
    id: id,
    name: name,
    type: type,
  }
  for (let i = 0; i < ans.length; i++) {
    result[ans[i].key] = ans[i].value
  }
  return result
}


async function getObjectKeys(id, type, keys) {
  if (keys == null)
    keys = await getAllObjectKeys(id, type)

  var url = 'http://' + TB_HOST + ':' + TB_PORT + "/api/plugins/telemetry/" + type.toUpperCase() + "/" + id + "/values/attributes?keys=" + keys

  let getObjectAttrs = await fetch(url, {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      'X-Authorization': 'Bearer ' + process.env.TB_TOKEN
    }
  });
  var ans = await getObjectAttrs.json();
  var result = {
    id: id,
    type: type,
  }
  for (let i = 0; i < ans.length; i++) {
    result[ans[i].key] = ans[i].value
  }
  return result
}


async function allObjectsIDbyType(type, entity_type) {

  switch (entity_type.toUpperCase()) {
    case 'ASSET':
      var url = 'http://' + TB_HOST + ':' + TB_PORT + "/api/tenant/assets?limit=999999999&textSearch=&type=" + encodeURI(type)
      break;
    case 'DEVICE':
      var url = 'http://' + TB_HOST + ':' + TB_PORT + "/api/tenant/devices?limit=999999999&textSearch=&type=" + encodeURI(type)
      break;
    case 'ENTITY_VIEW':
      var url = 'http://' + TB_HOST + ':' + TB_PORT + "/api/tenant/entityViews?limit=999999999&textSearch=&type=" + encodeURI(type)
      break;
  }

  let getAllObjectsID = await fetch(url, {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      'X-Authorization': 'Bearer ' + process.env.TB_TOKEN
    }
  });
  var ans = await getAllObjectsID.json();
  ans = ans.data
  var result = []
  for (let i = 0; i < ans.length; i++) {
    result.push({
      id: ans[i].id.id,
      name: ans[i].name,
      type: ans[i].type,
    }
    )
  }
  return result
}

/**
 * If keys - null - trying to get all attributes
 * @param {String} name
 * @param {String} entity_type asset/device/entity_view
 * @param {String} keys
 */
async function allObjectsIDandKeysByType(type, entity_type, keys) {
  var ids = await allObjectsIDbyType(type, entity_type)
  var result = []
  for (let i = 0; i < ids.length; i++) {
    let object = await getObjectKeys(ids[i].id, entity_type, keys)
    object.name = ids[i].name
    result.push(object)
  }
  return result
}

/**
 * @param {String} name
 * @param {String} entity_type asset/device/entity_view
 * @param {String} direction 'to'||'from'. to = childs, from = parents
 * @param {Integer} level int if 0 or null - all levels 
 */
async function getRelations(name, entity_type, direction, level) {
  if (level === 0)
    level = 3
  var id = await getObjectID(name, entity_type)
  if (!id)
    return false
  direction = direction.toLowerCase()
  if (direction == 'to')
    var url = "http://" + TB_HOST + ':' + TB_PORT + "/api/relations/info?fromId=" + id + "&fromType=" + entity_type.toUpperCase();
  else if (direction == 'from')
    var url = "http://" + TB_HOST + ':' + TB_PORT + "/api/relations/info?toId=" + id + "&toType=" + entity_type.toUpperCase();
  else
    return "incorrect direction"

  let getAllRelated = await fetch(url, {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      'X-Authorization': 'Bearer ' + process.env.TB_TOKEN
    }
  });
  //2ceacf40-78d3-11ea-a1c7-d1e730c27b32
  //2ce83730-78d3-11ea-a1c7-d1e730c27b32
  //http://84.201.141.244:8080/api/relations/info?fromId=2ceacf40-78d3-11ea-a1c7-d1e730c27b32&fromType=ENTITY_VIEW
  var ans = await getAllRelated.json();
  var answer = []
  for (let i = 0; i < ans.length; i++) {
    answer.push({
      id: ans[i][direction].id,
      name: ans[i][direction + 'Name'],
      entity_type: ans[i][direction].entityType
    })
  }
  if (level == 1)
    return answer


  /*
    for(let i=0; i< answer.length; i++){
      //answer[i].childs = []
      for (let ii=level; ii>0; ii--){   
      //console.log(answer[i])
      answer[i].childs = await getRelations(answer[i].name,answer[i].entity_type,direction,ii)
      //console.log(answer[i].childs )
    }
  }
*/

  for (let i = 0; i < answer.length; i++) {
    answer[i].childs = await getRelations(answer[i].name, answer[i].entity_type, direction, 1)
  }

  if (level == 2)
    return answer

  for (let i = 0; i < answer.length; i++) {
    for (let ii = 0; ii < answer[i].childs.length; ii++) {
      answer[i].childs[ii].childs = await getRelations(answer[i].childs[ii].name, answer[i].childs[ii].entity_type, direction, 1)
    }
  }
  return answer
}

async function getDeviceToken(deviceId) {
  const tokenUrl = "http://" + process.env.TB_HOST + ':' + process.env.TB_PORT + `/api/device/${deviceId}/credentials`;
  const credentials = {
    "method": 'get',
    "url": tokenUrl,
    "headers": {
      'Content-Type': 'application/json',
      'X-Authorization': 'Bearer ' + process.env.TB_TOKEN
    }
  };

  try {
    const response = await axios(credentials);
    if (response.status === 200) {
      const token = response.data.credentialsId;
      return token;
    }
  } catch (error) {
    console.log("Error: ", error);
    return false;
  }
}

module.exports = {
  objectID: getObjectID,
  objectIDandKeys: objectIDandKeys,
  allObjectsIDbyType: allObjectsIDbyType,
  allObjectsIDandKeysByType: allObjectsIDandKeysByType,
  relations: getRelations,
  getDeviceToken: getDeviceToken,
};
