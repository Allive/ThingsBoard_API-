# Thingboard API
Basic auth and get functions for Thingsboard REST API && Thingsboard's Postgres DB.
Promise like implementation



<!-- TOC -->

- [Installation](#Installation)
- [Usage](#Usage)
- [List REST API Functions](#list-rest-api-functions)
    - [GET](#get)
        - [createConnection](#createconnection)
        - [get.objectID](#get-objectid)
        - [get.objectIDandKeys](#get-objectidandkeys)
        - [get.allObjectsIDbyType](#get-allobjectsidbytype)
        - [get.allObjectsIDandKeysByType](#get-allobjectsidandkeysbytype)
    - [PUSH](#push)
        - [push.createRelation](#push-createrelation)
        - [push.pushAttributes](#push-pushattributes)
        - [push.createEntity](#push-createentity)
    - [DELETE](#delete)
        - [delete.deleteEntity](#delete-deleteentity)
        - [delete.deleteChilds](#delete-deletechilds)
        - [delete.deleteEntitiesByType](#delete-deleteentitiesbytype)
- [List Postgres Functions](#list-postgres-functions)
    - [postgres.get.allObjectsIDbyType](#postgres-get-allobjectsidbytype)
    - [postgres.get.allObjectsIDandKeysByType](#postgres-get-allobjectsidandkeysbytype)


<!-- /TOC -->

## Installation
```bash
npm i thingsboard_api
```

## Usage
```js
var TB = require('thingsboard_api');
var options = {
    TB_HOST:            'ip_to_TB',         //default: localhost
    TB_PORT:            'port_to_TB',       //default: 8080
    TB_USERNAME:        'loginTB',          //default: tenant@thingboard.org
    TB_PASSWORD:        'passTB',           //default: tenant 
    POSTGRES_HOST:      'ip_to_Postgres',   //no defaults!
    POSTGRES_PORT:      'port_to_Postgres', //no defaults!
    POSTGRES_USERNAME:  'loginPostgres',    //no defaults!
    POSTGRES_PASSWORD:  'loginPostgres',    //no defaults!

}

async function main(){
    await TB.createConnection(options) //
    console.log( await TB.get.objectID('entity_name','asset'))
    console.log( await TB.get.objectIDandKeys('entity_name2','device','key1,key2'))
}

main()

```


# List REST API Functions

## GET

### createConnection() 
### Promise connection with TB creating. Starting crone for token update every 15 minutes. NEED IN run once at start!

List of options:
``` js
options = {
    TB_HOST:            'ip_to_TB',         //default: localhost
    TB_PORT:            'port_to_TB',       //default: 8080
    TB_USERNAME:        'loginTB',          //default: tenant@thingboard.org
    TB_PASSWORD:        'passTB',           //default: tenant 
    POSTGRES_HOST:      'ip_to_Postgres',   //no defaults!
    POSTGRES_PORT:      'port_to_Postgres', //no defaults!
    POSTGRES_USERNAME:  'loginPostgres',    //no defaults!
    POSTGRES_PASSWORD:  'loginPostgres',    //no defaults!

}
```

Usage
```js
var TB = require('thingsboard_api');
await TB.createConnection(options)
```



### get.objectID()
### Promise get ID of an object by its name and type

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

### get.objectIDandKeys()
### Promise get ID and attributes of an object by its name,type and keys

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




### get.allObjectsIDbyType()
### Promise get all object's ID by its name and "custom type",type

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

### get.allObjectsIDandKeysByType()
### Promise get all object's ID and attributes by its name and "custom type",type and keys

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


## PUSH

### push.createRelation()

List of options:
```json
(name, entity_view, parentName, parentType) //string
```

Usage
```js
var TB = require('thingsboard_api');
var createRelation = await TB.push.createRelation("myChild",'asset',"myParent",'asset')
```
Result
```js
true || false
```

### push.pushAttributes()

List of options:
```json
(name,entity_type,attributes) //string
```

Usage
```js
var TB = require('thingsboard_api');
let attributes = {
        key1: "value1",
        key2: "value2",
    }
var pushAttributes = await TB.push.pushAttributes("myObject",'asset',attributes)
```
Result
```js
true || false
```

### push.createEntity()

List of options:
```json
(name,type,attributes,entity_type,parentName,parentType,parentKeys,parentRelation)
// attributes - can be null, if no attributes to push
// parentName,parentType,parentKeys,parentRelation - can be null
// so no relation or cloning attributes will be done
//
// parentKeys - array of name of keys to clone from parent to new Entity
// parentRelation - boolean. If true - will call createRelation() to parentName
```

Usage
```js
var TB = require('thingsboard_api');
let attributes = {
        key1: "value1",
        key2: "value2",
    }
let parentKeys = ["keyTestParent","keyTestParent2"]

var createEntity = await TB.push.createEntity("myAsset",'testType',attributes,"asset","ParentDevice","device",parentKeys,true))
```
Result
```js
id || false //if no relation and parentClonning

{
    id: id,
    statusAttributes: true || false,
    statusRelation: true || false,
}
```


## DELETE

### delete.deleteEntity()

List of options:
```json
(name,entity_type,flagDeleteChilds) 
// flagDeleteChilds - boolean, if true - will delete child entities in 3 level depth max
```

Usage
```js
var TB = require('thingsboard_api');

var deleteEntity = await TB.delete.deleteEntity("myOldObject",'asset',false)
```
Result
```js
true || false
```

### delete.deleteEntitiesByType()

List of options:
```json
(type,entity_type) 

```

Usage
```js
var TB = require('thingsboard_api');

var deleteEntity = await TB.delete.deleteEntitiesByType("typeOfAssetsToDelete",'asset')
```
Result
```js
true || false
```


### delete.deleteEntitiesByType()

Will delete entities, whose has relation to 'name' in 3 level depth max
List of options:
```json
(name,entity_type) 

```

Usage
```js
var TB = require('thingsboard_api');

var deleteChilds = await TB.delete.deleteChilds("Parent",'asset')
```
Result
```js
true || false
```

# List Postgres Functions

### postgres.get.allObjectsIDbyType()
### Promise get all object's ID by its name and "custom type",type

List of options:
```json
(type, entity_type) //string. type - custom type, entity_type - ASSET/DEVICE/ENTITY_VIEW
```

Usage
```js
var TB = require('thingsboard_api');
var allObjectsID = await TB.postgres.get.allObjectsIDbyType('device_type', 'device')

```
Result
```js
[
    {
        id: "0b507930-78d2-11ea-a1c7-d1e730c27b32", 
        entity_name: "name1", 
        type: "device_type"
    },

    {
        id: "0b507930-78d2-11ea-a1c7-d1e730c27b32", 
        entity_name: "name2", 
        type: "device_type"
    }
]
```

### postgres.get.allObjectsIDandKeysByType()
### Promise get all object's ID and attributes by its name and "custom type",type and keys

List of options:
```json
(type, entity_type, keys) //string. type - custom type, entity_type - ASSET/DEVICE/ENTITY_VIEW. For keys - can be array.
//If keys == null - Trying to get all attributes!
```

Usage
```js
var TB = require('thingsboard_api');
let keys = ['key1','key2','key3']
var allObjectsIDandAttrs = await TB.postgres.get.allObjectsIDandKeysByType('device_type', 'device',keys)

```

Result
```js
[
    {
        entity_id: "0b507930-78d2-11ea-a1c7-d1e730c27b32", 
        entity_name: "name1", 
        entity_type: "device",
        key1: "value1",
        key2: "value2"
    },

    {
        entity_id: "0b507930-78d2-11ea-a1c7-d1e730c27b32", 
        entity_name: "name2", 
        entity_type: "device",
        key1: "value1",
        key2: "value2"
    }
]
```