(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './color', './comparisons', './crud_operations', './empty_checks', './filters', './has_checks', 'misc', 'number_generation', 'string_manipulation', 'type_checks'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./color'), require('./comparisons'), require('./crud_operations'), require('./empty_checks'), require('./filters'), require('./has_checks'), require('misc'), require('number_generation'), require('string_manipulation'), require('type_checks'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.color, global.comparisons, global.crud_operations, global.empty_checks, global.filters, global.has_checks, global.misc, global.number_generation, global.string_manipulation, global.type_checks);
        global.index = mod.exports;
    }
})(this, function (exports, _color, _comparisons, _crud_operations, _empty_checks, _filters, _has_checks, _misc, _number_generation, _string_manipulation, _type_checks) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    Object.defineProperty(exports, 'hex2rgba', {
        enumerable: true,
        get: function () {
            return _color.hex2rgba;
        }
    });
    Object.defineProperty(exports, 'objEquivalent_deep', {
        enumerable: true,
        get: function () {
            return _comparisons.objEquivalent_deep;
        }
    });
    Object.defineProperty(exports, 'closeEnough', {
        enumerable: true,
        get: function () {
            return _comparisons.closeEnough;
        }
    });
    Object.defineProperty(exports, 'removeItemFromArray', {
        enumerable: true,
        get: function () {
            return _crud_operations.removeItemFromArray;
        }
    });
    Object.defineProperty(exports, 'removeItemFromArrayByIndex', {
        enumerable: true,
        get: function () {
            return _crud_operations.removeItemFromArrayByIndex;
        }
    });
    Object.defineProperty(exports, 'removeItemFromObjArrById', {
        enumerable: true,
        get: function () {
            return _crud_operations.removeItemFromObjArrById;
        }
    });
    Object.defineProperty(exports, 'findByIdInObjArr', {
        enumerable: true,
        get: function () {
            return _crud_operations.findByIdInObjArr;
        }
    });
    Object.defineProperty(exports, 'findByIdInObjArr_give_index', {
        enumerable: true,
        get: function () {
            return _crud_operations.findByIdInObjArr_give_index;
        }
    });
    Object.defineProperty(exports, 'updateItemInObjArrById', {
        enumerable: true,
        get: function () {
            return _crud_operations.updateItemInObjArrById;
        }
    });
    Object.defineProperty(exports, 'searchInObj', {
        enumerable: true,
        get: function () {
            return _crud_operations.searchInObj;
        }
    });
    Object.defineProperty(exports, 'searchInObj_update', {
        enumerable: true,
        get: function () {
            return _crud_operations.searchInObj_update;
        }
    });
    Object.defineProperty(exports, 'objectIsEmpty', {
        enumerable: true,
        get: function () {
            return _empty_checks.objectIsEmpty;
        }
    });
    Object.defineProperty(exports, 'arrayIsEmpty', {
        enumerable: true,
        get: function () {
            return _empty_checks.arrayIsEmpty;
        }
    });
    Object.defineProperty(exports, 'isEmpty', {
        enumerable: true,
        get: function () {
            return _empty_checks.isEmpty;
        }
    });
    Object.defineProperty(exports, 'filterObjArrByProp', {
        enumerable: true,
        get: function () {
            return _filters.filterObjArrByProp;
        }
    });
    Object.defineProperty(exports, 'filterArray', {
        enumerable: true,
        get: function () {
            return _filters.filterArray;
        }
    });
    Object.defineProperty(exports, 'sortOrderOfObjArr', {
        enumerable: true,
        get: function () {
            return _filters.sortOrderOfObjArr;
        }
    });
    Object.defineProperty(exports, 'uniquesInArray', {
        enumerable: true,
        get: function () {
            return _filters.uniquesInArray;
        }
    });
    Object.defineProperty(exports, 'itemsInArray1NotInArray2', {
        enumerable: true,
        get: function () {
            return _filters.itemsInArray1NotInArray2;
        }
    });
    Object.defineProperty(exports, 'objectHasProp', {
        enumerable: true,
        get: function () {
            return _has_checks.objectHasProp;
        }
    });
    Object.defineProperty(exports, 'isInArray', {
        enumerable: true,
        get: function () {
            return _has_checks.isInArray;
        }
    });
    Object.defineProperty(exports, 'hasDupsInObjArr_onProp', {
        enumerable: true,
        get: function () {
            return _has_checks.hasDupsInObjArr_onProp;
        }
    });
    Object.defineProperty(exports, 'deepClone', {
        enumerable: true,
        get: function () {
            return _misc.deepClone;
        }
    });
    Object.defineProperty(exports, 'idgen', {
        enumerable: true,
        get: function () {
            return _number_generation.idgen;
        }
    });
    Object.defineProperty(exports, 'uniqueID', {
        enumerable: true,
        get: function () {
            return _number_generation.uniqueID;
        }
    });
    Object.defineProperty(exports, 'tryParse', {
        enumerable: true,
        get: function () {
            return _string_manipulation.tryParse;
        }
    });
    Object.defineProperty(exports, 'allCaps', {
        enumerable: true,
        get: function () {
            return _string_manipulation.allCaps;
        }
    });
    Object.defineProperty(exports, 'capFirstLet', {
        enumerable: true,
        get: function () {
            return _string_manipulation.capFirstLet;
        }
    });
    Object.defineProperty(exports, 'capEveryFirst', {
        enumerable: true,
        get: function () {
            return _string_manipulation.capEveryFirst;
        }
    });
    Object.defineProperty(exports, 'capitalize', {
        enumerable: true,
        get: function () {
            return _string_manipulation.capitalize;
        }
    });
    Object.defineProperty(exports, 'textReplacer', {
        enumerable: true,
        get: function () {
            return _string_manipulation.textReplacer;
        }
    });
    Object.defineProperty(exports, 'hasWord', {
        enumerable: true,
        get: function () {
            return _string_manipulation.hasWord;
        }
    });
    Object.defineProperty(exports, 'numbersOnly', {
        enumerable: true,
        get: function () {
            return _string_manipulation.numbersOnly;
        }
    });
    Object.defineProperty(exports, 'toString', {
        enumerable: true,
        get: function () {
            return _type_checks.toString;
        }
    });
    Object.defineProperty(exports, 'typeOf', {
        enumerable: true,
        get: function () {
            return _type_checks.typeOf;
        }
    });
    Object.defineProperty(exports, 'isNaN', {
        enumerable: true,
        get: function () {
            return _type_checks.isNaN;
        }
    });
    Object.defineProperty(exports, 'isUndefined', {
        enumerable: true,
        get: function () {
            return _type_checks.isUndefined;
        }
    });
    Object.defineProperty(exports, 'isNull', {
        enumerable: true,
        get: function () {
            return _type_checks.isNull;
        }
    });
    Object.defineProperty(exports, 'isNumber', {
        enumerable: true,
        get: function () {
            return _type_checks.isNumber;
        }
    });
    Object.defineProperty(exports, 'isObject', {
        enumerable: true,
        get: function () {
            return _type_checks.isObject;
        }
    });
    Object.defineProperty(exports, 'isArray', {
        enumerable: true,
        get: function () {
            return _type_checks.isArray;
        }
    });
    Object.defineProperty(exports, 'isString', {
        enumerable: true,
        get: function () {
            return _type_checks.isString;
        }
    });
    Object.defineProperty(exports, 'isFunction', {
        enumerable: true,
        get: function () {
            return _type_checks.isFunction;
        }
    });
    Object.defineProperty(exports, 'isRegexp', {
        enumerable: true,
        get: function () {
            return _type_checks.isRegexp;
        }
    });
    Object.defineProperty(exports, 'isDate', {
        enumerable: true,
        get: function () {
            return _type_checks.isDate;
        }
    });
    Object.defineProperty(exports, 'isTruthy', {
        enumerable: true,
        get: function () {
            return _type_checks.isTruthy;
        }
    });
});