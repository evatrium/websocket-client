(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports", "@iosio/utils"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require("@iosio/utils"));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.utils);
        global.index = mod.exports;
    }
})(this, function (exports, _utils) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Socket = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var Socket = exports.Socket = function Socket(_ref) {
        var _this = this;

        var url = _ref.url,
            auto_reconnect = _ref.auto_reconnect,
            _ref$should_console_l = _ref.should_console_log,
            should_console_log = _ref$should_console_l === undefined ? true : _ref$should_console_l;

        _classCallCheck(this, Socket);

        this.log = function (msg) {
            var arg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
            var error = arguments[2];

            if (_this.should_log) {
                error ? console.error('Socket.js: ' + msg, arg) : console.log('Socket.js: ' + msg, arg);
            }
        };

        this.isValidOnEventArgs = function (event, cb) {
            var valid_args = true;

            if (!(0, _utils.isString)(event)) {
                valid_args = false;
                _this.log('Must provide a string for the event type.', '', true);
            }

            if (!(0, _utils.isFunction)(cb)) {
                _this.log('Must provide a function for a callback.', '', true);
                valid_args = false;
            }

            return valid_args;
        };

        this.removeResponseListener = function (event) {

            if (!_this.callbacks[event]) {
                _this.log('cannot remove response_listener that does not exist', '', true);
                return;
            }

            delete _this.callbacks[event];

            console.log('response_listener removed:', _this.callbacks);
        };

        this.open = function () {

            _this.deliberateClose = false;

            _this.log('initializing socket');

            if (_this.is_open) {

                _this.log('socket already open');
            } else {

                _this.socket = new WebSocket(_this.url);

                _this.socket.onopen = function () {
                    _this.log('socket connected');
                    _this.is_open = true;
                    _this.callbacks.connect.forEach(function (_ref2) {
                        var fn = _ref2.fn;
                        return fn({ is_open: _this.isConnected() });
                    });
                };

                _this.socket.onerror = function () {
                    _this.log('socket error');
                    _this.callbacks.error.forEach(function (_ref3) {
                        var fn = _ref3.fn;
                        return fn();
                    });
                };

                _this.socket.onmessage = function (_ref4) {
                    var data = _ref4.data;


                    var parsed = (0, _utils.tryParse)(data); // returns {ok,data,error}

                    if (!parsed.ok) {
                        _this.log('received invalid data from socket. Error: ', parsed.error, true);
                        return;
                    }

                    if (!parsed.data.event) {
                        _this.log('data received does not have an event and or data property. instead received:', parsed, true);
                        return;
                    }

                    if (!parsed.data.data) {
                        _this.log('data.data received is false or does not exist', '', true);
                    }

                    var response = parsed.data;

                    if (!_this.callbacks[response.event]) {
                        _this.log('no handler exists from this event received from socket:', response.event, true);
                        return;
                    }

                    if ((0, _utils.isFunction)(_this.testReceiveCallback)) {
                        _this.testReceiveCallback(parsed.data);
                    }

                    _this.callbacks[response.event].forEach(function (_ref5) {
                        var fn = _ref5.fn,
                            response_listener = _ref5.response_listener,
                            event = _ref5.event;

                        fn(response.data);
                        if (response_listener) {
                            console.log('response listener exists', _this.callbacks[response.event]);
                            _this.removeResponseListener(event);
                        }
                    });
                };

                _this.socket.onclose = function () {

                    _this.is_open = false;

                    _this.log('socket has closed');

                    _this.callbacks.disconnect.forEach(function (_ref6) {
                        var fn = _ref6.fn;
                        return fn();
                    });

                    _this.deregisterListeners();

                    if (_this.auto_reconnect && !_this.deliberateClose) {
                        _this.attemptReconnect();
                    }
                };
            }
        };

        this.isConnected = function () {
            return _this.socket.readyState === WebSocket.OPEN;
        };

        this.attemptReconnect = function () {
            var time = _this.auto_reconnect && _this.auto_reconnect.every ? _this.auto_reconnect.every : 2000;

            if (_this.reconnectInterval) {
                clearInterval(_this.reconnectInterval);
            }

            _this.reconnectInterval = setInterval(function () {

                if (!_this.is_open) {

                    _this.callbacks.reconnecting.forEach(function (_ref7) {
                        var fn = _ref7.fn;
                        return fn();
                    });

                    _this.log('attempting to reconnect');

                    _this.open();
                } else {

                    clearInterval(_this.reconnectInterval);
                }
            }, time);
        };

        this.deregisterListeners = function () {
            _this.socket.onclose = _this.socket.onopen = _this.socket.onerror = null;
        };

        this.close = function () {

            _this.log('closing socket');
            _this.is_open = false;
            _this.deliberateClose = true;

            _this.socket.close();
            if (_this.reconnectInterval) {
                clearInterval(_this.reconnectInterval);
            }

            // this.socket = false;
        };

        this.send = function (event, data) {

            if (!(0, _utils.isString)(event)) {
                _this.log('a string event name is required', '', true);
                return;
            }

            if (_this.is_open && _this.isConnected()) {

                if (!data.type) {
                    data.type = 'send';
                }

                var message = { event: event, data: data };

                if ((0, _utils.isFunction)(_this.testOutputCallback)) {
                    _this.testOutputCallback(message);
                }

                var message_string = JSON.stringify(message);

                _this.socket.send(message_string);
            } else {
                _this.log('cant send message. socket is closed', '', true);
            }
        };

        this.validateRequestArgs = function (event, params_or_cb_if_no_params, cb_if_params) {

            var ok = true;

            if (!(0, _utils.isString)(event)) {
                _this.log('/request method: a string event name is required', '', true);
                ok = false;
            }

            if (!(0, _utils.isObject)(params_or_cb_if_no_params) && !(0, _utils.isFunction)(params_or_cb_if_no_params)) {
                _this.log('/request method: a params object or callback function is required on the second parameter', '', true);
                ok = false;
            }
            if ((0, _utils.isObject)(params_or_cb_if_no_params) && !(0, _utils.isFunction)(cb_if_params)) {
                _this.log('/request method: a callback function is required as a third parameter if a param object is passed as the second', '', true);
                ok = false;
            }

            if (!ok) {
                return { ok: false };
            }

            var return_obj = void 0;

            if ((0, _utils.isObject)(params_or_cb_if_no_params)) {

                return_obj = {
                    ok: true,
                    params: params_or_cb_if_no_params,
                    cb: cb_if_params
                };
            } else if ((0, _utils.isFunction)(params_or_cb_if_no_params)) {

                return_obj = {
                    ok: true,
                    params: {},
                    cb: params_or_cb_if_no_params
                };
            }

            return return_obj;
        };

        this.setTestOutputCallback = function (cb) {
            _this.testOutputCallback = cb;
        };

        this.setTestReceiveCallback = function (cb) {
            _this.testReceiveCallback = cb;
        };

        this.request = function (event, params_or_cb_if_no_params, cb_if_params) {
            var _validateRequestArgs = _this.validateRequestArgs(event, params_or_cb_if_no_params, cb_if_params),
                ok = _validateRequestArgs.ok,
                params = _validateRequestArgs.params,
                cb = _validateRequestArgs.cb;

            if (!ok) {
                _this.log('request arguments are invalid', '', true);
                return;
            }

            var response_id = event + '_response_' + (0, _utils.uniqueID)();

            var request_data = { type: 'request', response_id: response_id, data: params };

            if ((0, _utils.isFunction)(_this.testOutputCallback)) {
                _this.testOutputCallback(request_data);
            }

            _this.send(event, request_data);

            _this.on(response_id, cb, true);
        };

        this.on = function (event, cb, response_listener) {

            if (!_this.isValidOnEventArgs(event, cb)) {
                return;
            }

            //stringify the name to allow this.remove_on to find the anonymous function
            var name = cb.toString();

            var already_pushed = (0, _utils.findByIdInObjArr_give_index)(_this.callbacks[event], 'name', name);

            if (already_pushed !== false) {
                // this.log('already listening to the event with this function', name, true);
                return;
            }

            var event_listener = { name: name, fn: cb, response_listener: response_listener, event: event };

            if (!_this.callbacks[event]) {

                _this.callbacks[event] = [event_listener];
            } else {

                _this.callbacks[event].push(event_listener);
            }
        };

        this.remove_on = function (event, cb) {

            if (!_this.isValidOnEventArgs(event, cb)) {
                return;
            }

            if (!_this.callbacks[event]) {
                _this.log('cannot remove an event that does not exist', '', true);
                return;
            }

            var updated_list = (0, _utils.removeItemFromObjArrById)(_this.callbacks[event], 'name', cb.toString());

            if (updated_list) {
                _this.callbacks[event] = updated_list;
            } else {
                _this.log('cb not removed or has not been previously set', '', true);
            }
        };

        this.removeAll = function () {
            _this.callbacks = _this.callbacks_base;
        };

        this.url = url;
        this.auto_reconnect = auto_reconnect;

        this.should_log = should_console_log;

        this.callbacks_base = {
            connect: [],
            disconnect: [],
            reconnecting: [],
            error: []
        };

        this.callbacks = {
            connect: [],
            disconnect: [],
            reconnecting: [],
            error: []
        };

        this.is_open = false;

        this.reconnectInterval = false;

        this.deliberateClose = false;

        this.testOutputCallback = false;

        this.testReceiveCallback = false;
    };
});