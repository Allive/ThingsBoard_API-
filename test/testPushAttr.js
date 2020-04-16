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
        "entityType": "DEVICE",
        "entityName": "test-dev123321",
        "ts": Date.now(),
        "telemetry": {
            "someKey": "123",
            "anotherKey": "421",
        },
        "attributes":{
            "attr1": "val1",
            "attr2": "val2",
        }
    }

    await TB.createConnection(options);
    const result = await TB.push.pushAttributes(options.entityName, options.entityType, options.attributes, options.telemetry, options.ts, options);
    
    if (!result){
        console.log("Error during pushing attributes");
        return;
    }

    console.log("Successfully pushed attributes");
}

main()