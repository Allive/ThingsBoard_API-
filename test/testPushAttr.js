var TB = require("../index.js")
const config = require('dotenv').config();

async function main() {
    let options = {
        POSTGRES_HOST: config.parsed.PG_HOST,
        POSTGRES_PORT: config.parsed.PG_PORT,
        POSTGRES_USERNAME: config.parsed.PG_USERNAME,
        POSTGRES_PASSWORD: config.parsed.PG_PASSWORD,
        POSTGRES_DATABASE: config.parsed.PG_DATABASE,
        TB_HOST: config.parsed.TB_HOST,
        TB_PORT: config.parsed.TB_PORT,
        TB_USERNAME: config.parsed.TB_USERNAME,
        TB_PASSWORD: config.parsed.TB_PASSWORD,
        "entityId": "f6d6d160-7fd0-11ea-8b96-39ec393585a5",
        "ts": Date.now(),
        "telemetry": {
            "someKey": "123",
            "anotherKey": "421",
   },
}


   await TB.createConnection(options);

   await TB.pushTelemetry(options);
   
}

main()