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
        global.misc = mod.exports;
    }
})(this, function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    /*
        ---------- MISC UTIL ------------------
     */

    /**
     * makes a new copy of an object, good for verifying the prototype is of type object
     * @param {Object|Array} check_obj - object or array to copy
     * @returns {Object|Array} - copy of object or array
     */
    var deepClone = exports.deepClone = function deepClone(check_obj) {
        return JSON.parse(JSON.stringify(check_obj));
    };
});