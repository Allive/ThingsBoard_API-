const fetch = require('node-fetch');
const axios = require('axios').default;
const cron = require('node-cron');
postgres_api = require('./postgres.js');
TB_get_api = require('./TB/get.js');
TB_push_api = require('./TB/push.js');
TB_HOST = 'localhost'
TB_PORT = '8080'
TB_USERNAME = 'tenant@thingsboard.org'
TB_PASSWORD = 'tenant'
process.env.POSTGRES_HOST  = 'localhost'
process.env.POSTGRES_PORT = "5432"
process.env.POSTGRES_USERNAME = 'postgres'
process.env.POSTGRES_PASSWORD = 'postgres'

async function createConnection(options){
    process.env.TB_HOST  = options.TB_HOST;
    process.env.TB_PORT = options.TB_PORT
    process.env.TB_USERNAME = options.TB_USERNAME;
    process.env.TB_PASSWORD = options.TB_PASSWORD;
    process.env.POSTGRES_HOST  = options.POSTGRES_HOST;
    process.env.POSTGRES_PORT = options.POSTGRES_PORT
    process.env.POSTGRES_USERNAME = options.POSTGRES_USERNAME;
    process.env.POSTGRES_PASSWORD = options.POSTGRES_PASSWORD;
    TB_HOST  = process.env.TB_HOST;
    TB_PORT = process.env.TB_PORT
    TB_USERNAME = process.env.TB_USERNAME;
    TB_PASSWORD = process.env.TB_PASSWORD;
    await token()
    await postgres_api.createPostgresConnection();
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

module.exports = {
  get:TB_get_api,
  push:TB_push_api,
  postgres: postgres_api,
  token: token,
  createConnection: createConnection
};
