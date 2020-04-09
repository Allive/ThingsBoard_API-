const fetch = require('node-fetch');
const axios = require('axios').default
const cron = require('node-cron');
TB_HOST = 'localhost'
TB_PORT = '8080'
TB_USERNAME = 'tenant@thingsboard.org'
TB_PASSWORD = 'tenant'

async function createConnection(options){
    process.env.TB_HOST  = options.TB_HOST;
    process.env.TB_PORT = options.TB_PORT
    process.env.TB_USERNAME = options.TB_USERNAME;
    process.env.TB_PASSWORD = options.TB_PASSWORD;

    TB_HOST  = process.env.TB_HOST;
    TB_PORT = process.env.TB_PORT
    TB_USERNAME = process.env.TB_USERNAME;
    TB_PASSWORD = process.env.TB_PASSWORD;

    
    await token()
}

async function token(){
    var url = 'http://' + process.env.TB_HOST + ':' + process.env.TB_PORT + '/api/auth/login';
  var options = {
      method: 'post',
      url: url,
      data: {
          "username": process.env.TB_USERNAME,
          "password": process.env.TB_PASSWORD
      },
      headers: {
          "Content-type": "application/json",
          "Accept": "application/json"
      }
  };

  var token = await getAndSetToken(options);
  cron.schedule("*/15 * * * *", async ()=>{
      await getAndSetToken(options);
  })
  return token

}

async function getAndSetToken(options) {
  try {
      const response = await axios(options);
      
      if (response.status === 200) {
          process.env.TB_TOKEN = response.data.token;
          return process.env.TB_TOKEN
      }
  } catch (error) {
      console.error(error);
  } 
}



async function getObjectID(name,type){

  switch(type.toUpperCase()){
    case "DEVICE": 
      var url = 'http://' + TB_HOST + ':' + TB_PORT + "/api/tenant/devices?deviceName="+name;
    break;
    case "ASSET": 
      var url = 'http://' + TB_HOST + ':' + TB_PORT + "/api/tenant/assets?assetName="+name;
    break;
    case "ENTITY_VIEW": entity_view
      var url = 'http://' + TB_HOST + ':' + TB_PORT + "/api/tenant/entityViews?entityViewName="+name;
    break;
  }

    let response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': 'Bearer ' + process.env.TB_TOKEN
      }
    });
    ans = await response.json()
    id = ans.id.id
    return id
}

async function objectIDandKeys(name,type,keys){
  var id = await getObjectID(name,type);
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
    console.log(ans)
    for(let i=0; i<ans.length;i++){
      console.log(ans[i])
      result.push({
        id: ans[i].id.id,
        name: ans[i].name,
        type: ans[i].type,
      }
      )
  }
  return result
}

async function allObjectsIDandKeysByType(type,entity_type,keys){
  var ids = await allObjectsIDbyType(type,entity_type)
  result = []
  for(let i=0; i<ids.length; i++){
    let object = await getObjectKeys(ids[i].id,entity_type,keys)
    object.name = ids[i].name
    result.push(object)
  }
  return result
}


module.exports = {get:{
    objectID: getObjectID,
    objectIDandKeys: objectIDandKeys,
    allObjectsIDbyType:allObjectsIDbyType,
    allObjectsIDandKeysByType: allObjectsIDandKeysByType,
    
  },
  token: token,
  createConnection: createConnection
};
