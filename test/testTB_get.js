/*
TB.get.objectID
TB.get.objectIDandKeys
TB.get.allObjectsIDbyType
TB.get.allObjectsIDandKeysByType
*/

var TB = require("../index.js")
async function main(){
    let options = {
        TB_HOST:'84.201.141.244',
        TB_PORT:'8080',
        TB_USERNAME:'kp@2050.digital',
        TB_PASSWORD:'aPb79AsA',
        POSTGRES_HOST:"84.201.141.244",
        POSTGRES_PORT:"5432",
        POSTGRES_USERNAME: "postgres",
        POSTGRES_PASSWORD:"postgres123456"
    }
    await TB.createConnection(options)
    var keys = ["errors", 'hardware', 'inspectionType', 'label', 'locoType','measureID', 'milage','name','ts','warnings','worker']
/*
    var objectID = await TB.get.objectID("e5k",'asset')
    var objectIDandKeys = await TB.get.objectIDandKeys("Замер №1",'entity_view', null)
    var allObjectsIDbyType = await TB.get.allObjectsIDbyType("Локомотив","asset")
    var allObjectsIDandKeysByType = await TB.get.allObjectsIDandKeysByType("Замер","entity_view",keys)
    */
   //var related = await TB.get.relations("Замер №20&e5k:018-1", 'entity_view', 'to',1)
   
    var related = await TB.get.relations("Замер №20", 'entity_view', 'to',3) 

}

main()