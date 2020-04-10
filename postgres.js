const postgres = require("postgres")

sqlConfig = {};

async function createPostgresConnection(){
    sqlConfig =
    {
        timeout        :   1, // get idle connection
        evict       :   2000, // it actualy removes the idle connection
        host        :   process.env.POSTGRES_HOST,         // Postgres ip address or domain name
        port        :   process.env.POSTGRES_PORT,       // Postgres server port
        database    :   'thingsboard',         // Name of database to connect to
        username    :   process.env.POSTGRES_USERNAME,         // Username of database user
        password    :   process.env.POSTGRES_PASSWORD,   
    }
    return 
}

function toUUID(id){
    id = id.substring(7, 15) + "-" + 
            id.substring(3, 7) + "-1" + 
            id.substring(0, 3) + "-" + 
            id.substring(15, 19) + "-" + 
            id.substring(19);
    return id;
}


async function getAllObjectsIDbyType(type,entity_type){
    const sql = postgres('postgres://username:password@host:port/database', sqlConfig)
    
    const data = await sql`
        SELECT name,entity_type,id from ${sql(entity_type)}
        WHERE type = ${type} ORDER BY id DESC `

    for(let i=0; i<data.length; i++){
        data[i].id = toUUID(data[i].id)
    }
    
    return data
}

async function getAllObjectsIDandKeysByType(type,entity_type,keys){
    const sql = postgres('postgres://username:password@host:port/database', sqlConfig)
    
    const data = await sql`
        SELECT name,entity_type,id from ${sql(entity_type)}
        WHERE type = ${type} ORDER BY id DESC `

    var entities = []
    for(let i=0; i<data.length; i++){
        entities.push(data[i].id)
    }
    var result
    if(keys != null ){
        result = await sql`
            SELECT entity_id, entity_type, long_v, str_v, attribute_key from public.attribute_kv
            WHERE  entity_id in (${entities}) and 
                attribute_key in (${keys})
            ORDER by entity_id DESC
            `;
    }
    else{
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
    for(let i=0; i<result.length; i++){
        if(result[i]["attribute_key"] == 'ts')
            result[i]["long_v"] = new Date(result[i]["long_v"] - timezoneOffset*60*1000)
        
        
        if (i === result.length -1){
            obj[result[i]["attribute_key"]] = result[i]["long_v"] || result[i]["str_v"];
            obj["entity_id"] = result[i]["entity_id"].toString();
            obj["entity_type"] = result[i]["entity_type"].toString();
            target.push(obj);
            break;
        }
        
        if (result[i]["entity_id"].toString() === result[i+1]["entity_id"].toString()){
            
            
            obj[result[i]["attribute_key"]] = result[i]["long_v"] || result[i]["str_v"];
            if(result[i]["long_v"] === 0)
                obj[result[i]["attribute_key"]] = 0;   
        }
        
        if (result[i]["entity_id"].toString() !== result[i+1]["entity_id"].toString()){
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
    createPostgresConnection:   createPostgresConnection,
    get:{
        allObjectsIDbyType:         getAllObjectsIDbyType,
        allObjectsIDandKeysByType:  getAllObjectsIDandKeysByType,
    }
}