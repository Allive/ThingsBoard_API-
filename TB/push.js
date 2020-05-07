const fetch = require('node-fetch');
const get = require('./get.js')
const axios = require('axios');

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

    if(attributes !== false && parentKeys!==null && parentKeys !== false) {
        var parentAttributes = await get.objectIDandKeys(parentName, parentType)
        for (let key in parentAttributes) {
            if (key == 'id' || key == 'name' || key == 'type')
                continue;
            attributes[key] = parentAttributes[key]
        }
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

// Add OPTIONS for development debug
// in prod environment variables will be used
async function pushAttributes(name, entity_type, attributes, telemetry = null, ts = null, options = null) {

    // if you want to get token and detailed info about entity
    // See how get.objectID()
    const id = await get.objectID(name, entity_type);

    const url = "http://" + TB_HOST + ':' + TB_PORT + "/api/plugins/telemetry/" + entity_type.toUpperCase() + "/" + id + "/attributes/SERVER_SCOPE";
    const post = await fetch(url, {
        method: 'post',
        body: JSON.stringify(attributes),
        headers: {
            'Content-Type': 'application/json',
            'X-Authorization': 'Bearer ' + process.env.TB_TOKEN
        }
    });
    const ans = await post.text();
    if ((telemetry === null || telemetry === undefined) && (ts === null || telemetry === undefined)) {
        if (ans == '')
            return true;
        else
            return false;
    }else {
        const deviceToken = await get.getDeviceToken(id);
        // If error happened, getDeviceToken() return false
        if (!deviceToken) {
            console.error("Error while get device access token!");
            return false;
        }

        const url = "http://" + TB_HOST + ':' + TB_PORT + `/api/v1/${deviceToken}/telemetry`;
        const payload = {
            method: 'post',
            url: url,
            data: JSON.stringify({ "ts": ts || Date.now(), "values": telemetry }),
            headers: {
                "Content-type": "application/json",
                "Accept": "application/json",
            }
        };

        try {
            const response = await axios(payload);
            if (response.status === 200) {
                return true;
            }
        } catch (error) {
            console.error("Error: ", error);
            return false;
        }

        return true;
    }
}

module.exports = {
    createRelation: createRelation,
    pushAttributes: pushAttributes,
    createEntityView: createEntityView,
    createEntity: createEntity
};