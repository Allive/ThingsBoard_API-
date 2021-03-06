const fetch = require('node-fetch');
const axios = require('axios').default;
const cron = require('node-cron');
const postgres_api = require('./postgres.js');
const TB_get_api = require('./TB/get.js');
const funcs = require('./functions');
const TB_push_api = require('./TB/push.js');

async function createConnection(options) {
    process.env.TB_HOST = options.TB_HOST;
    process.env.TB_PORT = options.TB_PORT
    process.env.TB_USERNAME = options.TB_USERNAME;
    process.env.TB_PASSWORD = options.TB_PASSWORD;
    process.env.PG_HOST = options.PG_HOST;
    process.env.PG_DATABASE= options.PG_DATABASE;
    process.env.PG_PORT = options.PG_PORT
    process.env.PG_USERNAME = options.PG_USERNAME;
    process.env.PG_PASSWORD = options.PG_PASSWORD;
    TB_HOST = process.env.TB_HOST;
    TB_PORT = process.env.TB_PORT
    TB_USERNAME = process.env.TB_USERNAME;
    TB_PASSWORD = process.env.TB_PASSWORD;
    await token()
    await postgres_api.createPostgresConnection();
}

async function token() {
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
    cron.schedule("*/15 * * * *", async () => {
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

async function extendChildAttrs(options) {
    const parentId = postgres_api.toPostgresID(options.parent_id);
    const childId = postgres_api.toPostgresID(options.child_id);
    const childType = options.child_type;

    const parentAttrs = await postgres_api.get.getAttrsAndValuesById(parentId, options.attributeKeys);
    const childAttrs = await postgres_api.get.getAttrsAndValuesById(childId, options.attributeKeys);

    const parentAttrsValues = funcs.makeAttrsValuesObj(parentAttrs);
    const childAttrsValues = funcs.makeAttrsValuesObj(childAttrs);

    const parentKeys = Object.keys(parentAttrsValues);

    for (let parentKey of parentKeys) {
        // get attribute_types which are not find in child
        // the write new attribute_keys 
        if (!(childAttrsValues.hasOwnProperty(parentKey))) {
            console.log('child does not have attribute type: ', parentKey);
            let dataToWrite = parentAttrsValues[parentKey];
            // set child entity_id, entity_type for extending attributes of child
            // set null to attributes which not existed before extending of attributes
            dataToWrite = funcs.updateChildAttrsKeysValue(dataToWrite, childId, childType);

            const result = await postgres_api.insertIntoAttrsKeysVals(dataToWrite);

            if (result.count === dataToWrite.length) {
                console.log('successfully write to db!')
            }

            // child and parent have common attributes type SERVER_SCOPE and etc.
            // we need to find attribute_keys which not presented in child
        } else {
            console.log('parent and child have common attribute type ', parentKey);

            let dataToWrite = [];
            const parentData = parentAttrsValues[parentKey];
            const childData = childAttrsValues[parentKey];

            // update attributes or assign new attributes to child
            // depends on options.updateAttrs
            switch (options.updateAttrs) {
                case true:
                    if (parentData.length !== childData.length) {
                        console.error("Different length of parent and child attribute array!");
                        return;
                    }
                    let updatedAttrs = funcs.updateChildAttrsKeysValue(parentData, childId, childType);
                    for (let attr of updatedAttrs) {
                        const resp = await postgres_api.updateAttrsKeysAndVals(attr);
                        console.log('resp ', resp);
                    }
                    break;
                case false:
                default:
                    for (let i = 0; i < parentData.length; i++) {
                        let match = false;
                        for (let j = 0; j < childData.length; j++) {
                            if (parentData[i].attribute_key.toString() === childData[j].attribute_key.toString()) {
                                match = true;
                                break;
                            }
                        }
                        if (!match) {
                            // Change parent properties to child
                            parentData[i].entity_id = childId;
                            parentData[i].entity_type = childType;
                            parentData[i].last_update_ts = Date.now()
                            dataToWrite.push(parentData[i]);
                        }
                    }

                    if (dataToWrite.length === 0) {
                        console.log('Not data to write! ');
                        continue;
                    }

                    console.log('Find attributes to assign to child !');
                    console.log('data to write ', dataToWrite)

                    const result = await postgres_api.insertIntoAttrsKeysVals(dataToWrite);

                    if (result.count === dataToWrite.length) {
                        console.log('successfully write to db!')
                    }
            }
        }
    }
}
module.exports = {
    get: TB_get_api,
    push: TB_push_api,
    postgres: postgres_api,
    token: token,
    createConnection: createConnection,
    extendChildAttrs: extendChildAttrs,
};
