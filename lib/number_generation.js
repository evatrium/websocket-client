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
    global.number_generation = mod.exports;
  }
})(this, function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  /*
      ------------ NUMBER GENERATION --------------
   */

  var _i_d_counter_ = 0;
  /**
   * simple id generator, just gives an incremented number with each call
   * @returns {Number} - an incremented number
   */
  var idgen = exports.idgen = function idgen() {
    var oldId = _i_d_counter_;
    _i_d_counter_ += 1;
    return oldId;
  };

  /**
   * random number generator used for genRando
   * @returns {String} - random char string
   */
  var s4 = function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  };

  /**
   * creates a date string and replaces spaces with dashes
   * used for uniqueID
   * @returns {string} - returns date string with dashes
   */
  var dateStringForId = function dateStringForId() {
    return new Date().toString().split(" ").join("-");
  };

  /**
   * generates a ridiculously unique set of characters
   * ...adding a date time at the end makes it almost impossible for collisions
   * def impossible if generated within a closed source (ex: not sharing ids with other users)
   * @returns {String} - super unique value string
   */
  var uniqueID = exports.uniqueID = function uniqueID() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4() + '-' + dateStringForId();
  };
});