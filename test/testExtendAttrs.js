var TB = require("../index.js")
// const postgres_api = require('../postgres');
const config = require('dotenv').config();

async function main() {
    let options = {
        "parent_id": "82c16090-fbe3-11e9-a033-2dde0dc34203",
        "child_id": "aaba34b0-6d07-11ea-94de-3ddf86487a77",
        "child_type": "DEVICE",
        POSTGRES_HOST: config.parsed.PG_HOST,
        POSTGRES_PORT: config.parsed.PG_PORT,
        POSTGRES_USERNAME: config.parsed.PG_USERNAME,
        POSTGRES_PASSWORD: config.parsed.PG_PASSWORD,
        POSTGRES_DATABASE: config.parsed.PG_DATABASE,  

    }
   await TB.createConnection(options);
   await TB.extendChildAttrs(options);
}

main()