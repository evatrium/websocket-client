(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.has_checks = mod.exports;
    }
})(this, function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    /*
        ---------- HAS CHECKS ------------------
     */

    /**
     * checks to see if an object has a property
     * @param {Object} obj - the object to check
     * @param {String} prop - the property to check for on the object
     * @returns {boolean} - true if the object has the prop
     */
    var objectHasProp = exports.objectHasProp = function objectHasProp(obj, prop) {
        for (var key in obj) {
            if (key === prop) {
                return true;
            }
        }
        return false;
    };

    /**
     * checks if a value is in an array (shallow)
     * @param {String|Number|Boolean|NaN} item - pretty much anything except an object or array
     * @param {Array} arr - the array to look inside
     * @returns {boolean} - true if the item is in the array
     */
    var isInArray = exports.isInArray = function isInArray(item, arr) {
        if (arr.length > 0) {
            return arr.indexOf(item) !== -1;
        } else {
            return false;
        }
    };

    /**
     * returns bool if an object array has an object with a duplicate property (that exists on another object)
     * @param {Array} arr - the array to look in
     * @param {String} prop - the name of the property to check for
     * @returns {boolean} - true if another object has the property
     */
    var hasDupsInObjArr_onProp = exports.hasDupsInObjArr_onProp = function hasDupsInObjArr_onProp(arr, prop) {
        if (arr) {
            var temp = [];
            arr.forEach(function (obj) {
                if (!isInArray(obj[prop], temp)) {
                    temp.push(obj[prop]);
                } else {
                    return true;
                }
            });
            return false;
        }
    };
});