const fetch = require('node-fetch');
const get = require('./get.js')


async function deleteEntity(name,entity_type,flagDeleteChilds){
    let id = await get.objectID(name,entity_type)
    
    var url= "http://" + TB_HOST + ':' + TB_PORT + "/api/"+entity_type.toLowerCase()+"/"+id
    if(entity_type.toLowerCase() == 'entity_view')
        url = "http://" + TB_HOST + ':' + TB_PORT + "/api/entityView/"+id


    let post = await fetch(url,{
        method: 'delete',
        headers: {
            'Content-Type': 'application/json',
            'X-Authorization': 'Bearer ' + process.env.TB_TOKEN
        }
    });

    var ans = await post.text();
    if(ans != '' )
        return false
    else if(ans == '' && (!flagDeleteChilds || flagDeleteChilds == null))
        return true

    var statusDeleteChilds = false
    if(flagDeleteChilds)
        statusDeleteChilds = await deleteChilds(name,entity_type)
    return true
}

async function deleteEntitiesByType(type,entity_type){
    entity_type = entity_type.toLowerCase()
    if(type == null || entity_type!='asset' || entity_type!='device' || entity_type!='entity_view')
        return false

    ids = get.allObjectsIDbyType(type,entity_type)
    for(let i = 0; i < ids.length; i++){
        var result = await deleteEntity(ids[i].name,ids[i].entity_type,false)
    }
    return result
}


async function deleteChilds(name,entity_type){

    var childs = await get.relations(name, entity_type, "to", 0)
    for (let i=0; i < childs.length; i++){
        await deleteEntity(childs[i].name, childs[i].entity_type,false)
    }
    return true
}

module.exports = {
    deleteEntity:           deleteEntity,
    deleteChilds:           deleteChilds,
    deleteEntitiesByType:   deleteEntitiesByType
};