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

module.exports = {
    makeAttrsValuesObj: makeAttrsValuesObj,
}