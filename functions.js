// Here usefull functions for work is presented

// obj which will store attribute keys according to attribute_type
/* {
    "SERVER_SCOPE": ["active, "простой",.....],
    "CLIENT_SCOPE": [...],
}
*/
function makeAttrsValuesObj(incomeAttrs){
    let outputObj = {};
    let buf = [];

    for (let i = 0; i < incomeAttrs.length; i++) {
        if (i === incomeAttrs.length - 1) {
            buf.push(incomeAttrs[i])
            outputObj[incomeAttrs[i].attribute_type] = buf;
            break;
        }

        if (incomeAttrs[i].attribute_type === incomeAttrs[i + 1].attribute_type) {
            buf.push(incomeAttrs[i]);
        }

        if (incomeAttrs[i].attribute_type !== incomeAttrs[i + 1].attribute_type) {
            buf.push(incomeAttrs[i]);
            outputObj[incomeAttrs[i].attribute_type] = buf;
            buf = [];
        }
    }

    return outputObj;
}

function updateChildAttrsKeysValue(childAttributes, childId, childType){
    // childAttributes is parent attributes that not existed before in child
    // before assign new attributes to child
    // change entity_id, entity_type and etc.
    for (let val of childAttributes) {
        val.entity_id = childId;
        val.entity_type = childType;
        val.bool_v = null;
        val.str_v = null;
        val.long_v = null;
        val.dbl_v = null;
        val.last_update_ts = Date.now();
    }

    return childAttributes;
}

module.exports = {
    makeAttrsValuesObj: makeAttrsValuesObj,
    updateChildAttrsKeysValue: updateChildAttrsKeysValue,
}