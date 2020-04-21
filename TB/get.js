const fetch = require('node-fetch');
const axios = require('axios');

// base entity types
const entityTypes = {
  "device": "DEVICE",
  "asset": "ASSET",
  "view": "ENTITY_VIEW",
};

async function getObjectID(name, type, tokenFlag = false, options = null) {
  if (name == null || type == null)
    return false;

  let entityName = encodeURI(name);
  entityName = entityName.replace("&", "%26");

  const TB_HOST = process.env.TB_HOST || options.TB_HOST;
  const TB_PORT = process.env.TB_PORT || options.TB_PORT;

  switch (type.toUpperCase()) {
    case entityTypes.device:
      var url = 'http://' + TB_HOST + ':' + TB_PORT + "/api/tenant/devices?deviceName=" + entityName;
      break;
    case entityTypes.asset:
      var url = 'http://' + TB_HOST + ':' + TB_PORT + "/api/tenant/assets?assetName=" + entityName;
      break;
    case entityTypes.view:
      var url = 'http://' + TB_HOST + ':' + TB_PORT + "/api/tenant/entityViews?entityViewName=" + entityName;
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
    // If token exist and type is device
    if ((tokenFlag) && (type.toUpperCase() === entityTypes.device)) {
      const token = await getDeviceToken(ans.id.id);

      if (!token) {
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
  if (type == null || typeof type == 'undefined' || typeof id == 'undefined' || id === null || id === false)
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
  if (type == null || typeof type == 'undefined' || typeof name == 'undefined')
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


async function allObjectsIDbyType(customType, tbType, tokenFlag = false, options = null) {
  const TB_HOST = process.env.TB_HOST || options.TB_HOST;
  const TB_PORT = process.env.TB_PORT || options.TB_PORT;

  switch (tbType.toUpperCase()) {
    case entityTypes.asset:
      var url = 'http://' + TB_HOST + ':' + TB_PORT + "/api/tenant/assets?limit=999999999&textSearch=&type=" + encodeURI(customType)
      break;
    case entityTypes.device:
      var url = 'http://' + TB_HOST + ':' + TB_PORT + "/api/tenant/devices?limit=999999999&textSearch=&type=" + encodeURI(customType)
      break;
    case entityTypes.view:
      var url = 'http://' + TB_HOST + ':' + TB_PORT + "/api/tenant/entityViews?limit=999999999&textSearch=&type=" + encodeURI(customType)
      break;
    default:
      return { "error": `Not find ids for custom type ${type}, TB type ${entity_type}` }
  }

  const response = await fetch(url, {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      'X-Authorization': 'Bearer ' + process.env.TB_TOKEN
    }
  });
  const ans = await response.json();
  const data = ans.data
  // an array 
  let result = [];
  
  for (let i = 0; i < data.length; i++) {
    result.push({
      id: data[i].id.id,
      name: data[i].name,
      type: data[i].type,
    });
  }
  // Set device token for response if it's device and tokenFlag is true
  if (tokenFlag && tbType.toUpperCase() === entityTypes.device){
    for(let i = 0; i < result.length; i++){
      const token = await getDeviceToken(result[i].id);
      if (!tokenFlag){
        continue
      }

      result[i].deviceToken = token;
    }
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
