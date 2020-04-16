
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
    let attributes = {
        key1: "value1",
        key2: "value2",
    }

    let parentKeys = ["keyTestParent","keyTestParent2"]
    /*
    console.log(await TB.push.pushAttributes("Полигон тест","asset",{keyTestParent:"qqq",keyTestParent2:"www"}))
    
    console.log(await TB.push.createRelation("Тестовое депо",'asset',"Полигон тест",'asset'))

    console.log(await TB.push.createEntity("Test Device2",'test',attributes,"device","Полигон тест","asset",parentKeys,true))
    
    console.log(await TB.push.createEntity("Test Asset2",'test',attributes,"asset","Полигон тест","asset",parentKeys,true))
    
    console.log(await TB.push.createEntityView("Test EntityView4",'test',attributes,"Полигон тест","asset",parentKeys,true))
    */
    console.log(await TB.push.createEntity("Test DeviceNull_7",'test',attributes,"device",null,null,null,false))
    console.log(await TB.push.createEntity("Test DeviceNull_8",'test',null,"device",null,null,null,false))
    console.log(await TB.push.createEntity("Test DeviceNull_9",'test',attributes,"device","Полигон тест","asset",null,true))
}

main()