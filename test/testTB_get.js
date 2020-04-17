/*
TB.get.objectID
TB.get.objectIDandKeys
TB.get.allObjectsIDbyType
TB.get.allObjectsIDandKeysByType
*/

var TB = require("../index.js")
const config = require('dotenv').config();

async function main() {
    // let options = {
    //     TB_HOST:'84.201.141.244',
    //     TB_PORT:'8080',
    //     TB_USERNAME:'kp@2050.digital',
    //     TB_PASSWORD:'aPb79AsA',
    //     POSTGRES_HOST:"84.201.141.244",
    //     POSTGRES_PORT:"5432",
    //     POSTGRES_USERNAME: "postgres",
    //     POSTGRES_PASSWORD:"postgres123456"
    // }
    // get params from env
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
        "attributes": {
            "attr1": "val1",
            "attr2": "val2",
        }
    }

    await TB.createConnection(options)

    // var keys = ["errors", 'hardware', 'inspectionType', 'label', 'locoType','measureID', 'milage','name','ts','warnings','worker']
    /*
        var objectID = await TB.get.objectID("e5k",'asset')
        var objectIDandKeys = await TB.get.objectIDandKeys("Замер №1",'entity_view', null)
        var allObjectsIDbyType = await TB.get.allObjectsIDbyType("Локомотив","asset")
        var allObjectsIDandKeysByType = await TB.get.allObjectsIDandKeysByType("Замер","entity_view",keys)
        */
    //var related = await TB.get.relations("Замер №20&e5k:018-1", 'entity_view', 'to',1)

    // var related = await TB.get.relations("Замер №20", 'entity_view', 'to',3) 


    // last param set to get complex object info
    /*{
        id: "0b507930-78d2-11ea-a1c7-d1e730c27b32", 
        name: "some_name", 
        type: "device_type",
        deviceToken: "access_token",
    }*/

    // if it not set, response will be TB id
    try {
        const result = await TB.get.objectID(options.entityName, options.entityType, true);
        console.log(result);
    } catch (err) {
        console.error("Error: ", err);
    }

    // set last option to true
    // if your tb type is device
    // to get device token
    try {
        const result = await TB.get.allObjectsIDbyType("123", "device", true);
        console.log('get id by type resp: ', result);
    } catch(err){
        console.error("Error: ", err);
    }
}

main()