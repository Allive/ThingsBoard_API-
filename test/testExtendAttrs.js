var TB = require("../index.js")
const config = require('dotenv').config();

async function main() {
    let options = {
        "parent_id": "82c16090-fbe3-11e9-a033-2dde0dc34203",
        "child_id": "aaba34b0-6d07-11ea-94de-3ddf86487a77",
        "child_type": "DEVICE",
        "attributeKeys": ['entity_type', 'entity_id', 'attribute_type', 'attribute_key', 'bool_v', 'str_v', 'long_v', 'dbl_v', 'last_update_ts'],
        "updateAttrs": false,
        TB_HOST: config.parsed.TB_HOST,
        TB_PORT: config.parsed.TB_PORT,
        TB_USERNAME: config.parsed.TB_USERNAME,
        TB_PASSWORD: config.parsed.TB_PASSWORD,
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