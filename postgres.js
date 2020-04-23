const postgres = require("postgres")

sqlConfig = {};

async function createPostgresConnection() {
    sqlConfig =
    {
        timeout: 1, // get idle connection
        evict: 2000, // it actualy removes the idle connection
        host: process.env.PG_HOST,         // Postgres ip address or domain name
        port: process.env.PG_PORT,       // Postgres server port
        database: process.env.PG_DATABASE,         // Name of database to connect to
        username: process.env.PG_USERNAME,         // Username of database user
        password: process.env.PG_PASSWORD,
    }

    return
}

function toUUID(id) {
    id = id.substring(7, 15) + "-" +
        id.substring(3, 7) + "-1" +
        id.substring(0, 3) + "-" +
        id.substring(15, 19) + "-" +
        id.substring(19);
    return id;
}

// get postgres id from thingsboard uuid
function toPostgresID(tb_uuid) {
    id = tb_uuid.substring(15, 18) +
        tb_uuid.substring(9, 13) +
        tb_uuid.substring(0, 8) +
        tb_uuid.substring(19, 23) +
        tb_uuid.substring(24, tb_uuid.length)

    return id;
}

// Get access token for device
async function getEntityToken(entityId) {
    const sql = postgres('postgres://username:password@host:port/database', sqlConfig);
    try {
        const pgId = toPostgresID(entityId);
        var entityToken = await sql`SELECT credentials_id FROM device_credentials WHERE device_id = ${pgId}`
    } catch (error) {
        console.error(error);
    }

    return entityToken[0].credentials_id;
}
// Get attributes according to attributeKeys (array of keys)
async function getAttrsAndValuesById(entityId, attributeKeys) {
    const sql = postgres('postgres://username:password@host:port/database', sqlConfig);
    try {
        var outputAttrs = await sql`SELECT entity_type, entity_id, attribute_type, attribute_key, bool_v, str_v, long_v, dbl_v, last_update_ts 
        FROM attribute_kv where entity_id = ${entityId}  
        AND attribute_key in (${attributeKeys})
        ORDER BY attribute_type DESC`;
    } catch (error) {
        console.error(error);
    }

    return outputAttrs;
}

async function insertIntoAttrsKeysVals(dataToWrite) {
    const sql = postgres('postgres://username:password@host:port/database', sqlConfig);
    try {
        var insertResponse = await sql`insert into attribute_kv ${sql(dataToWrite,
            'entity_type', 'entity_id', 'attribute_type', 'attribute_key', 'bool_v', 'str_v', 'long_v', 'dbl_v', 'last_update_ts'
        )}`;
    } catch (error) {
        console.error(error);
    }

    return insertResponse;
}

// Update child attributes keys and values based on parent attributes
async function updateAttrsKeysAndVals(attributeObj) {
    const sql = postgres('postgres://username:password@host:port/database', sqlConfig);
    try {
        var updateResponse = await sql`update attribute_kv set ${
            sql(attributeObj, 'entity_type', 'entity_id', 'attribute_type', 'attribute_key', 'bool_v', 'str_v', 'long_v', 'dbl_v', 'last_update_ts')
            } where entity_id = ${attributeObj["entity_id"]} and attribute_key = ${attributeObj.attribute_key}`;
    } catch (error) {
        console.error(error);
    }

    return updateResponse;
}

async function getAllObjectsIDbyType(type, entity_type) {
    const sql = postgres('postgres://username:password@host:port/database', sqlConfig)

    const data = await sql`
        SELECT * from ${sql(entity_type)}
        WHERE type = ${type} ORDER BY id DESC `

    for (let i = 0; i < data.length; i++) {
        data[i].id = toUUID(data[i].id)
    }

    return data
}

async function getAllObjectsIDandKeysByType(type, entity_type, keys) {
    const sql = postgres('postgres://username:password@host:port/database', sqlConfig)

    const data = await sql`
        SELECT * from ${sql(entity_type)}
        WHERE type = ${type} ORDER BY id DESC `

    var entities = []
    for (let i = 0; i < data.length; i++) {
        entities.push(data[i].id)
    }
    var result
    if (keys != null) {
        result = await sql`
            SELECT entity_id, entity_type, long_v, str_v, attribute_key from public.attribute_kv
            WHERE  entity_id in (${entities}) and 
                attribute_key in (${keys})
            ORDER by entity_id DESC
            `;
    }
    else {
        result = await sql`
        SELECT entity_id, entity_type, long_v, str_v, attribute_key from public.attribute_kv
        WHERE  entity_id in (${entities})
        ORDER by entity_id DESC
        `;
    }
    let target = []
    let obj = {}
    if (typeof timezoneOffset == 'undefined')
        var timezoneOffset = 0
    for (let i = 0; i < result.length; i++) {
        if (result[i]["attribute_key"] == 'ts')
            result[i]["long_v"] = new Date(result[i]["long_v"] - timezoneOffset * 60 * 1000)


        if (i === result.length - 1) {
            obj[result[i]["attribute_key"]] = result[i]["long_v"] || result[i]["str_v"];
            obj["entity_id"] = result[i]["entity_id"].toString();
            obj["entity_type"] = result[i]["entity_type"].toString();
            target.push(obj);
            break;
        }

        if (result[i]["entity_id"].toString() === result[i + 1]["entity_id"].toString()) {


            obj[result[i]["attribute_key"]] = result[i]["long_v"] || result[i]["str_v"];
            if (result[i]["long_v"] === 0)
                obj[result[i]["attribute_key"]] = 0;
        }

        if (result[i]["entity_id"].toString() !== result[i + 1]["entity_id"].toString()) {
            obj[result[i]["attribute_key"]] = result[i]["long_v"] || result[i]["str_v"];
            obj["entity_id"] = toUUID(result[i]["entity_id"].toString());
            obj["entity_type"] = result[i]["entity_type"].toString();
            obj["entity_name"] = data[target.length].name
            target.push(obj)
            obj = {};
        }
    }

    return target
}


module.exports =
{
    createPostgresConnection: createPostgresConnection,
    toPostgresID: toPostgresID,
    insertIntoAttrsKeysVals: insertIntoAttrsKeysVals,
    updateAttrsKeysAndVals: updateAttrsKeysAndVals,
    get: {
        allObjectsIDbyType: getAllObjectsIDbyType,
        allObjectsIDandKeysByType: getAllObjectsIDandKeysByType,
        getAttrsAndValuesById: getAttrsAndValuesById,
        getEntityToken: getEntityToken,
    }
}