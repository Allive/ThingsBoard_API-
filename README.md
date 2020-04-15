# Thingboard API
Basic auth and get functions for Thingsboard REST API && Thingsboard's Postgres DB.
Promise like implementation



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

### createConnection() - Promise connection with TB creating. Starting crone for token update every 15 minutes. NEED IN run once at start!

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

# List Postgres Functions

### postgres.get.allObjectsIDbyType() - Promise get all object's ID by its name and "custom type",type

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

### postgres.get.allObjectsIDandKeysByType() - Promise get all object's ID and attributes by its name and "custom type",type and keys

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

___

#### postgres.get.getAttrsAndValuesById(entity_id) - get attributes keys and values for future assigning to child

##### Steps: 
 - convert Thingsboard UUID to Postgres entity_id
 - Use postgres.toPostgresID(thingsboard_uuid) for converting

##### List of options:
 - entity_id - is `string`

##### Response:
```js
[
...,
 {
    entity_type: 'DEVICE',
    entity_id: '1e9fbe382c16090a0332dde0dc34203',
    attribute_type: 'CLIENT_SCOPE',
    attribute_key: 'attribute_test_april2020',
    bool_v: false,
    str_v: '',
    long_v: 0,
    dbl_v: 0,
    last_update_ts: null
  },
...
]
```

____


#### postgres.toPostgresID(thingsboard_uuid) - convert Thingsboard UUID to Postgres ID

##### List of options:
 - thingsboard_uuid - `string`


___

#### postgres.insertIntoAttrsKeysVals(dataToWrite) - insert data into attribute_kv

##### List of options:
 - dataToWrite - is `array of objects`
```js
[
  {
    entity_type: 'DEVICE',
    entity_id: '1ea6d07aaba34b094de3ddf86487a77',
    attribute_type: 'CLIENT_SCOPE',
    attribute_key: 'test_attr_key',
    bool_v: null,
    str_v: null,
    long_v: null,
    dbl_v: null,
    last_update_ts: 1586949836446
  },
  {
    entity_type: 'DEVICE',
    entity_id: '1ea6d07aaba34b094de3ddf86487a77',
    attribute_type: 'CLIENT_SCOPE',
    attribute_key: 'Работа по программе',
    bool_v: null,
    str_v: null,
    long_v: null,
    dbl_v: null,
    last_update_ts: 1586949836446
  },
]
```

##### Response:
 - To check if data was written to db `compare insert count with response count`

___

### postgres.updateAttrsKeysAndVals(attributeObj) - Update child attributes keys and values based on parent attributes

##### List of options:
 - attributeObj is  `object`
```js
  {
    entity_type: 'DEVICE',
    entity_id: '1ea6d07aaba34b094de3ddf86487a77',
    attribute_type: 'CLIENT_SCOPE',
    attribute_key: 'Работа по программе',
    bool_v: null,
    str_v: null,
    long_v: null,
    dbl_v: null,
    last_update_ts: 1586949836446
  }
```
##### Response:
 - To check if data was updated `compare target count with db update response count`


# List of unclassified functions

### extendChildAttrs(options) - Extend child attributes by parent attributes

##### List of options:
 - options is an `object`
```js
    parent_id": "82c16090-fbe3-11e9-a033-2dde0dc34203",
    "child_id": "aaba34b0-6d07-11ea-94de-3ddf86487a77",
    "child_type": "DEVICE",
    POSTGRES_HOST: "host",
    POSTGRES_PORT: "port",
    POSTGRES_USERNAME: "username",
    POSTGRES_PASSWORD: "pass",
    POSTGRES_DATABASE: "database",
    "updateAttrs": false,
```

##### Steps:
 - If you want to add not existed attributes before to child set `updateAttrs` to `false`
 - For updating child attributes by parents attributes set `updateAttrs` to `true`

##### Reponse:
 - Function doesn't return any data!