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
    global.type_checks = mod.exports;
  }
})(this, function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  /*
      --------- TYPE CHECKS AND STUFF ---------
   */
  /**
   * helper for typeOf
   * @param {*} thing - primitive (string, obj, number...etc)
   * @returns {String} the string definition of the primitive (ex: [object Array] )
   */
  var toString = exports.toString = function toString(thing) {
    return Object.prototype.toString.call(thing);
  };

  /**
   * tells what kind of primitive it is
   * @param {*} thing - primitive
   * @returns {string} - string definition of the primitive
   */
  var typeOf = exports.typeOf = function typeOf(thing) {
    var stringified = toString(thing);
    var type = stringified.split(' ')[1].slice(0, -1);
    return type.toLowerCase();
  };

  /**
   * determines if a primitive is isNaN
   * A polyfill for isNaN
   * (leverages the unique never-equal-to-itself characteristic of NaN)
   * @param {*} val - any value
   * @returns {Boolean} - returns true if val is not a number
   */
  var isNaN = exports.isNaN = function isNaN(val) {
    var n = Number(val);
    return n !== n; //eslint-disable-line
  };

  /**
   * determines if a value is undefined
   * @param {*} val - any value
   * @returns {boolean} - returns true if value is undefined
   */
  var isUndefined = exports.isUndefined = function isUndefined(val) {
    return typeOf(val) === "undefined";
  };

  /**
   * determines if a value is null
   * @param {*} val - ay value
   * @returns {boolean} true if val is null
   */
  var isNull = exports.isNull = function isNull(val) {
    return typeOf(val) === "null";
  };

  /**
   * determines if a value is a number
   * @param {*} val - any value
   * @returns {boolean} true if val is number
   */
  var isNumber = exports.isNumber = function isNumber(val) {
    return typeOf(val) === 'number' && !isNaN(val);
  };

  /**
   * determines if a value is an object
   * @param {*} val - any value
   * @returns {boolean} - true if val is an object
   */
  var isObject = exports.isObject = function isObject(val) {
    return typeOf(val) === "object";
  };

  /**
   * determines if a value is an array (useful because arrays will return object when using typeof)
   * @param {*} val - any value
   * @returns {boolean} - true if val is an array
   */
  var isArray = exports.isArray = function isArray(val) {
    return typeOf(val) === 'array';
  };

  /**
   * determines if a value is a string
   * @param {*} val - any value
   * @returns {boolean} - true if val is a string
   */
  var isString = exports.isString = function isString(val) {
    return typeOf(val) === 'string';
  };

  /**
   * determines if a value is a function
   * @param {*} val - any val
   * @returns {boolean} - true if val is function
   */
  var isFunction = exports.isFunction = function isFunction(val) {
    return typeOf(val) === 'function';
  };

  /**
   * determines if a value is a regular expression
   * @param {*} val - any val
   * @returns {boolean} - true if val is regexp
   */
  var isRegexp = exports.isRegexp = function isRegexp(val) {
    return typeOf(val) === 'regexp';
  };

  /**
   * determines if a value is a date object
   * @param {*} val - any val
   * @returns {boolean} - true if val is a date object
   */
  var isDate = exports.isDate = function isDate(val) {
    return typeOf(val) === 'date';
  };

  /**
   * determines if a value is truthy
   * @param {*} val - any val
   * @returns {boolean} - true if val is truthy
   */
  var isTruthy = exports.isTruthy = function isTruthy(val) {
    return !isUndefined(val) && !!val;
  };
});