var TB = require("../index.js")
async function main(){
    let options = {
        TB_HOST:'84.201.141.244',
        TB_PORT:'8080',
        TB_USERNAME:'kp@2050.digital',
        TB_PASSWORD:'aPb79AsA',
        POSTGRES_USERNAME: "postgres",
        POSTGRES_HOST:"84.201.141.244",
        POSTGRES_PASSWORD:"postgres123456"
    }
    await TB.createConnection(options)
    var keys = ["errors", 'hardware', 'inspectionType', 'label', 'locoType','measureID', 'milage','name','ts','warnings','worker']


    var startSQL = new Date()
    var allMeasuresFull_SQL_nullKeys = await TB.postgres.get.allObjectsIDandKeysByType('Замер','entity_view',null)
    var timeSQL_nullKeys = (new Date()-startSQL)/1000;

    var startTB = new Date()
    var allMeasuresFull_TB_nullKeys = await TB.get.allObjectsIDandKeysByType('Замер','entity_view',null)
    var timeTB_nullKeys = (new Date()-startTB)/1000;


    var startSQL = new Date()
    var allMeasuresFull_SQL_allKeys = await TB.postgres.get.allObjectsIDandKeysByType('Замер','entity_view',keys)
    var timeSQL_allKeys = (new Date()-startSQL)/1000;

    var startTB = new Date()
    var allMeasuresFull_TB_allKeys = await TB.get.allObjectsIDandKeysByType('Замер','entity_view',keys)
    var timeTB_allKeys = (new Date()-startTB)/1000;

    var startSQL = new Date()
    var allMeasuresFull_SQL_oneKey = await TB.postgres.get.allObjectsIDandKeysByType('Замер','entity_view',"errors")
    var timeSQL_oneKey = (new Date()-startSQL)/1000;

    var startTB = new Date()
    var allMeasuresFull_TB_oneKey = await TB.get.allObjectsIDandKeysByType('Замер','entity_view',"errors")
    var timeTB_oneKey = (new Date()-startTB)/1000;


}

main()