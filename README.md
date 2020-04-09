# Thingboard API
Basic auth and get functions for Thingsboard REST API.
Promise like implementation



## Installation
```bash
npm i thingsboard_api
```

## Usage
```js
var TB = require('thingsboard_api');
var options = {
    TB_HOST:{ip_to_TB},       //default: localhost
    TB_PORT:{port_to_TB},     //default: 8080
    TB_USERNAME:{loginTB},    //default: tenant@thingboard.org
    TB_PASSWORD:{passTB},     //default: tenant 
}

async function main(){
    await TB.createConnection(options) //
    console.log( await TB.get.objectID('entity_name','asset'))
    console.log( await TB.get.objectIDandKeys('entity_name2','device','key1,key2'))
}

main()

```


## List Functions

### createConnection() - Promise connection with TB creating. Starting crone for token update every 15 minutes. Run once at start

List of options:
```
options = {
    TB_HOST:{ip_to_TB},       //default: localhost
    TB_PORT:{port_to_TB},     //default: 8080
    TB_USERNAME:{loginTB},    //default: tenant@thingboard.org
    TB_PASSWORD:{passTB},     //default: tenant 
}
```

Usage
```js
var TB = require('thingsboard_api');
await TB.createConnection(options)
```



### get.objectID() - Promise get ID of an object by its name and type

List of options:
```json
(name, entity_view) //string
```

Usage
```js
var TB = require('thingsboard_api');
var myObjectsID = await TB.get.objectID('myObject', 'asset')
```
Result
```js
"ea791310-78d2-11ea-a1c7-d1e730c27b32"
```

### get.objectIDandKeys() - Promise get ID and attributes of an object by its name,type and keys

List of options:
```json
(name, type, keys) //string. for keys can be array
//If keys == null - Trying to get all attributes!
```

Usage
```js
var TB = require('thingsboard_api');
var myObjectID = await TB.get.objectIDandKeys('myObject', 'asset', 'key1,key2,key3')

let keys = ['key1','key2','key3']
var myObjectIDandAttrs = await TB.get.objectIDandKeys('myObject', 'asset', keys)
```
Result
```js
{
    id: "ea791310-78d2-11ea-a1c7-d1e730c27b32", 
    name: "myObject", 
    type: "asset",
    key1: "value1",
    key2: "value2",
}
```




### get.allObjectsIDbyType() - Promise get all object's ID by its name and "custom type",type

List of options:
```json
(type, entity_type) //string. type - custom type, entity_type - ASSET/DEVICE/ENTITY_VIEW
```

Usage
```js
var TB = require('thingsboard_api');
var allObjectsID = await TB.get.allObjectsIDbyType('device_type', 'device')

```
Result
```js
[
    {
        id: "0b507930-78d2-11ea-a1c7-d1e730c27b32", 
        name: "name1", 
        type: "device_type"
    },

    {
        id: "0b507930-78d2-11ea-a1c7-d1e730c27b32", 
        name: "name2", 
        type: "device_type"
    }
]
```

### get.allObjectsIDandKeysByType() - Promise get all object's ID and attributes by its name and "custom type",type and keys

List of options:
```json
(type, entity_type, keys) //string. type - custom type, entity_type - ASSET/DEVICE/ENTITY_VIEW. For keys - can be array.
//If keys == null - Trying to get all attributes!
```

Usage
```js
var TB = require('thingsboard_api');
let keys = ['key1','key2','key3']
var allObjectsIDandAttrs = await TB.get.allObjectsIDandKeysByType('device_type', 'device',keys)

```

Result
```js
[
    {
        id: "0b507930-78d2-11ea-a1c7-d1e730c27b32", 
        name: "name1", 
        type: "device",
        key1: "value1",
        key2: "value2"
    },

    {
        id: "0b507930-78d2-11ea-a1c7-d1e730c27b32", 
        name: "name2", 
        type: "device",
        key1: "value1",
        key2: "value2"
    }
]
```