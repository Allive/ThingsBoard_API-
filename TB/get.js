const fetch = require('node-fetch');

async function getObjectID(name,type){
  if(name == null || type == null)
    return false
  var name = encodeURI(name)
  switch(type.toUpperCase()){
    case "DEVICE": 
      var url = 'http://' + TB_HOST + ':' + TB_PORT + "/api/tenant/devices?deviceName="+name;
    break;
    case "ASSET": 
      var url = 'http://' + TB_HOST + ':' + TB_PORT + "/api/tenant/assets?assetName="+name;
    break;
    case "ENTITY_VIEW": 
      var url = 'http://' + TB_HOST + ':' + TB_PORT + "/api/tenant/entityViews?entityViewName="+name;
    break;
  }

    let response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': 'Bearer ' + process.env.TB_TOKEN
      }
    });
    let ans = await response.json()
    if(typeof ans.id != 'undefined')
      return ans.id.id
    else  
      return false
}

async function getAllObjectKeys(id,type){
  if(id == null || type == null || typeof type == 'undefined'|| typeof name == 'undefined')
    return false
  var url = 'http://' + TB_HOST + ':' + TB_PORT + "/api/plugins/telemetry/"+type.toUpperCase()+"/"+id+"/keys/attributes"

  let getObjectKeys = await fetch(url,{
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
 async function objectIDandKeys(name,type,keys){
  if(id == null || type == null || typeof type == 'undefined'|| typeof name == 'undefined')
      return false
  var id = await getObjectID(name,type);

  if(keys == null)
    keys = await getAllObjectKeys(id,type)


  var url = 'http://' + TB_HOST + ':' + TB_PORT + "/api/plugins/telemetry/"+type.toUpperCase()+"/"+id+"/values/attributes?keys="+keys

  let getObjectAttrs = await fetch(url,{
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
  for(let i=0; i< ans.length; i++){
    result[ans[i].key] = ans[i].value
  }
  return result
}


async function getObjectKeys(id,type,keys){
  if(keys == null)
    keys = await getAllObjectKeys(id,type)

  var url = 'http://' + TB_HOST + ':' + TB_PORT + "/api/plugins/telemetry/"+type.toUpperCase()+"/"+id+"/values/attributes?keys="+keys

  let getObjectAttrs = await fetch(url,{
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
  for(let i=0; i< ans.length; i++){
    result[ans[i].key] = ans[i].value
  }
  return result
}


async function allObjectsIDbyType(type,entity_type){
  
  switch(entity_type.toUpperCase()){
    case 'ASSET':
      var url = 'http://' + TB_HOST + ':' + TB_PORT + "/api/tenant/assets?limit=999999999&textSearch=&type="+encodeURI(type)
    break;
    case 'DEVICE':
      var url = 'http://' + TB_HOST + ':' + TB_PORT + "/api/tenant/devices?limit=999999999&textSearch=&type="+encodeURI(type)
    break;
    case 'ENTITY_VIEW':
      var url = 'http://' + TB_HOST + ':' + TB_PORT + "/api/tenant/entityViews?limit=999999999&textSearch=&type="+encodeURI(type)
    break;
  }
  
  let getAllObjectsID = await fetch(url,{
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      'X-Authorization': 'Bearer ' + process.env.TB_TOKEN
    }
    });
    var ans = await getAllObjectsID.json();
    ans = ans.data
    var result =[]
    for(let i=0; i<ans.length;i++){
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
 * @param {String} type
 * @param {String} keys
 */
async function allObjectsIDandKeysByType(type,entity_type,keys){
  var ids = await allObjectsIDbyType(type,entity_type)
  var result = []
  for(let i=0; i<ids.length; i++){
    let object = await getObjectKeys(ids[i].id,entity_type,keys)
    object.name = ids[i].name
    result.push(object)
  }
  return result
}


module.exports = {
    objectID: getObjectID,
    objectIDandKeys: objectIDandKeys,
    allObjectsIDbyType:allObjectsIDbyType,
    allObjectsIDandKeysByType: allObjectsIDandKeysByType,
};
