(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports", "./misc", "./type_checks"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require("./misc"), require("./type_checks"));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.misc, global.type_checks);
        global.empty_checks = mod.exports;
    }
})(this, function (exports, _misc, _type_checks) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.isEmpty = exports.arrayIsEmpty = exports.objectIsEmpty = undefined;


    /*
        -------- IS EMPTY CHECKS --------------
     */

    // import {deepClone, isArray, isObject, isTruthy} from "./index";

    /**
     * checks if an object has any properties /is empty
     * @param {Object} obj - object to check for emptiness
     * @returns {boolean} - true if object is empty
     */
    var objectIsEmpty = exports.objectIsEmpty = function objectIsEmpty(obj) {
        if (!(0, _type_checks.isObject)(obj)) {
            console.error('must pass object to objectIsEmpty check');
            return;
        }

        var ensuredObject = (0, _misc.deepClone)(obj);

        for (var prop in ensuredObject) {
            if (ensuredObject.hasOwnProperty(prop)) {
                return false;
            }
        }
        return JSON.stringify(ensuredObject) === JSON.stringify({});
    };

    /**
     * checks if an array is empty / helper for isEmpty
     * @param {Array} arr to check
     * @returns {boolean} - true if array is empty
     */
    var arrayIsEmpty = exports.arrayIsEmpty = function arrayIsEmpty(arr) {
        return arr.length === 0;
    };

    /**
     * determines if an object or an array is empty
     * if not an object or array then check if its truthy
     * @param {*} val - any value
     * @returns {boolean} - true if empty or not truthy
     */
    var isEmpty = exports.isEmpty = function isEmpty(val) {
        if ((0, _type_checks.isArray)(val)) {
            return arrayIsEmpty(val);
        }
        if ((0, _type_checks.isObject)(val)) {
            return objectIsEmpty(val);
        }

        return !(0, _type_checks.isTruthy)(val);
    };
});