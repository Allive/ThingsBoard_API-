const fetch = require('node-fetch');
const get = require('./get.js')

/**
 * @param {String} type Such as Mobile, PC, not asset/device
 * @param {String} entity_type asset/device/entity_vew
 * @param {String} attributes If exist - push to new object
 * @param {String} parentName for entity_view - required, for other - "inheritance"
 * @param {String} parentType for entity_view - required(asset,device), for other - "inheritance"
 * @param {String} parentKeys for entity_view - required(server_scope keys only), for other - "inheritance"(override) if null - try to get all parent's keys
 * @param {String} parentRelation boolean - calls createRelation
 */
async function createEntity(name, type, attributes, entity_type, parentName, parentType, parentKeys, parentRelation) {
    if (parentKeys != null && !Array.isArray(parentKeys)) {
        if (parentKeys.indexOf(',') != -1)
            parentKeys = parentKeys.split(',')
        else
            parentKeys = [parentKeys]
    }

    var parentAttributes = await get.objectIDandKeys(parentName, parentType)
    for (let key in parentAttributes) {
        if (key == 'id' || key == 'name' || key == 'type')
            continue;
        attributes[key] = parentAttributes[key]
    }
    switch (entity_type.toUpperCase()) {
        case "DEVICE":
            var url = "http://" + TB_HOST + ':' + TB_PORT + "/api/device";
            break;
        case "ASSET":
            var url = "http://" + TB_HOST + ':' + TB_PORT + "/api/asset";
            break;
        case "ENTITY_VIEW":
            let ans = await createEntityView(name, type, attributes, parentName, parentType, parentKeys, parentRelation)
            return ans

    }
    let body = {
        "name": name,
        "type": type
    }
    let post = await fetch(url, {
        method: 'post',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'X-Authorization': 'Bearer ' + process.env.TB_TOKEN
        }
    });
    var ans = await post.json();
    if (typeof ans.id == 'undefined')
        return false
    else if (attributes == null && (!parentRelation || parentRelation == null))
        return ans.id.id
    //Далее идём только если нужно пушить аттрибуты или создавать отношение 
    var id = ans.id.id
    var statusRelation = false
    var statusAttributes = false
    if (parentRelation)
        statusRelation = await createRelation(name, entity_type, parentName, parentType)
    if (attributes != null || parentKeys != null) {
        statusAttributes = await pushAttributes(name, entity_type, attributes)
    }

    let answer =
    {
        id: id,
        statusAttributes: statusAttributes,
        statusRelation: statusRelation
    }
    return answer
}


/**
 * @param {String} type Such as Mobile, PC, not asset/device
 * @param {String} attributes If exist - push to new object
 * @param {String} parentName for entity_view - required, for other - "inheritance"
 * @param {String} parentType for entity_view - required(asset,device), for other - "inheritance"
 * @param {String} parentKeys for entity_view - required(server_scope keys only), for other - "inheritance"(override) if null - try to get all parent's keys
 * @param {String} parentRelation boolean - calls createRelation
 */
async function createEntityView(name, type, attributes, parentName, parentType, parentKeys, parentRelation) {
    var parentType = parentType.toUpperCase()
    var url = "http://" + TB_HOST + ':' + TB_PORT + "/api/entityView";
    var body = {
        keys: {
            timeseries: [],
            attributes: {
                ss: parentKeys, //Какие аттрибуты берем
                cs: [],
                sh: []
            }
        },
        endTimeMs: 0,
        startTimeMs: 0,
        name: name,//Имя представления
        type: type, //Тип представления
        entityId: {
            entityType: parentType, //от какого типа берем аттрибуты ASSET/DEVICE
            id: await get.objectID(parentName, parentType) //От кого берем аттрибуты
        }
    }
    let post = await fetch(url, {
        method: 'post',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'X-Authorization': 'Bearer ' + process.env.TB_TOKEN
        }
    });
    var ans = await post.json();
    if (typeof ans.id == 'undefined')
        return false
    else if (attributes == null && (!parentRelation || parentRelation == null))
        return ans.id.id
    //Далее идём только если нужно пушить аттрибуты или создавать отношение 
    var id = ans.id.id
    var statusRelation = false
    var statusAttributes = false
    if (parentRelation)
        var statusRelation = await createRelation(name, "entity_view", parentName, parentType)
    if (attributes != null)
        var statusAttributes = await pushAttributes(name, 'entity_view', attributes)

    let answer =
    {
        id: id,
        statusAttributes: statusAttributes,
        statusRelation: statusRelation
    }
    return answer
}

async function createRelation(name, entity_type, parentName, parentType) {
    //to - child, from - parent
    var url = "http://" + TB_HOST + ':' + TB_PORT + "/api/relation"
    var body = {

        "to": {
            "entityType": entity_type.toUpperCase(),
            "id": await get.objectID(name, entity_type)
        },
        "from": {
            "entityType": parentType.toUpperCase(),
            "id": await get.objectID(parentName, parentType)
        },
        "type": "Contains"
    }
    let post = await fetch(url, {
        method: 'post',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'X-Authorization': 'Bearer ' + process.env.TB_TOKEN
        }
    });
    var ans = await post.text();
    if (ans == '')
        return true
    else
        return false
}

async function pushAttributesAndTelemetry(name, entity_type, attributes, telemetry, ts) {


    /*
    let id = await get.objectID(name, entity_type)
    var url = "http://" + TB_HOST + ':' + TB_PORT + "/api/plugins/telemetry/" + entity_type.toUpperCase() + "/" + id + "/attributes/SERVER_SCOPE";
    let post = await fetch(url, {
        method: 'post',
        body: JSON.stringify(attributes),
        headers: {
            'Content-Type': 'application/json',
            'X-Authorization': 'Bearer ' + process.env.TB_TOKEN
        }
    });
    var ans = await post.text();
    if (ans == '')
        return true
    else
        return false
        */
}

async function pushTelemetry(options) {
    const entityToken = await postgres_api.get.getEntityToken(options.entityId);

    if (entityToken.length === 0) {
        console.error("Empty entity token!");
        return;
    }

    const url = "http://" + options.TB_HOST + ':' + options.TB_PORT + `/api/v1/${entityToken}/telemetry`;
    const payload = {
        method: 'post',
        url: url,
        data: JSON.stringify({ "ts": options["ts"], "values": options.telemetry }),
        headers: {
            "Content-type": "application/json",
            "Accept": "application/json",
        }
    };

    try {
        const response = await axios(payload);
        if (response.code === 200){
            return true;
        }
    } catch (error) {
        console.error("Error: ", error);
        return false;
    }
}



module.exports = {
    createRelation: createRelation,
    pushAttributes: pushAttributes,
    createEntityView: createEntityView,
    createEntity: createEntity
};