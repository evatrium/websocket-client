(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './type_checks'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./type_checks'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.type_checks);
        global.string_manipulation = mod.exports;
    }
})(this, function (exports, _type_checks) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.numbersOnly = exports.hasWord = exports.textReplacer = exports.capitalize = exports.capEveryFirst = exports.capFirstLet = exports.allCaps = exports.tryParse = undefined;

    /*
        --------- STRING MANIPULATION --------------
    */

    /**
     * attempts to parse stringified data safely and returns an object with the data
     * @param {String} data - stringified json
     * @returns {{ok: boolean, data: any, error: boolean}|{ok: boolean, data: null, error: *}} - returns stuff
     */
    var tryParse = exports.tryParse = function tryParse(data) {

        var parsed_data = void 0;

        try {
            parsed_data = { ok: true, data: JSON.parse(data), error: false };
        } catch (e) {

            parsed_data = { ok: false, data: null, error: e.message };
        }

        return parsed_data;
    };

    /**
     * capitalizes a string
     * @param {String} string - string to upperCase
     * @returns {String} - all caps string
     */
    var allCaps = exports.allCaps = function allCaps(string) {
        return string.toUpperCase();
    };

    /**
     * capitalises the first letter of the first word in a string
     * @param {String} string - to capitalize
     * @returns {string} - string with first char capitalized
     */
    var capFirstLet = exports.capFirstLet = function capFirstLet(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    /**
     * capitalizes the first letter of every word in a string
     * @param {String} string - to capitalize
     * @returns {String} - string with every first letter capitalized
     */
    var capEveryFirst = exports.capEveryFirst = function capEveryFirst(string) {
        return string.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    };

    /**
     * capitalize a string with different options.
     *
     * @param {String} string - to capitalize
     * @param {String} option - 'everyFirst', 'first', or undefined for all caps
     * @returns {String} - capitalized string
     */
    var capitalize = exports.capitalize = function capitalize(string, option) {
        if (option === 'everyFirst') {
            return capEveryFirst(string);
        } else if (option === 'first') {
            return capFirstLet(string);
        } else {
            return allCaps(string);
        }
    };

    /**
     * helper function to replace characters in a string with another value
     * @param {String} string - to replaces chars in
     * @param {Array} arr - an array of objects containing the key values to find and replace : string - to find, with - to replace with
     * @returns {String} - updated string
     */
    var textReplacer = exports.textReplacer = function textReplacer(string) {
        var arr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [{ string: '', with: '' }];

        var _text = string;
        arr.forEach(function (obj) {
            _text = _text.split(obj.string).join(obj.with);
        });
        return _text;
    };

    /**
     * helper function to determine if a string has a word in it
     * @param {String} string - string to search in
     * @param {String} word - word to look for
     * @returns {boolean} - true if string has word
     */
    var hasWord = exports.hasWord = function hasWord(string, word) {
        if (!(0, _type_checks.isString)(string) || !(0, _type_checks.isString)(word)) {
            return false;
        }
        var reg = new RegExp(word, 'gi');
        return !!string.match(reg);
    };

    /**
     * returns only numbers from a string
     * @param {String} text - to filter
     * @returns {string} text with only numbers in it
     */
    var numbersOnly = exports.numbersOnly = function numbersOnly(text) {
        var val = text + "";
        var invalidChars = /[^0-9]/gi;
        return val.replace(invalidChars, "");
    };
});