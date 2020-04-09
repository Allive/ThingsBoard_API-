var TB = require("./index.js")
async function main(){
    let options = {
        TB_HOST:'84.201.141.244',
        TB_PORT:'8080',
        TB_USERNAME:'kp@2050.digital',
        TB_PASSWORD:'aPb79AsA' 
    }
    await TB.createConnection(options)
    var e5kObj = await TB.get.objectIDandKeys('e5k','asset',null)
    console.log(e5kObj)
    console.log(await TB.get.allObjectsIDandKeysByType('Тип локомотива', 'asset',null))
}

main()