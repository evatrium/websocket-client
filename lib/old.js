(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports", "@iosio/utils/lib/type_checks", "@iosio/utils/lib/crud_operations", "@iosio/utils/lib/string_manipulation", "@iosio/utils/lib/number_generation"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require("@iosio/utils/lib/type_checks"), require("@iosio/utils/lib/crud_operations"), require("@iosio/utils/lib/string_manipulation"), require("@iosio/utils/lib/number_generation"));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.type_checks, global.crud_operations, global.string_manipulation, global.number_generation);
        global.old = mod.exports;
    }
})(this, function (exports, _type_checks, _crud_operations, _string_manipulation, _number_generation) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var Socket = function Socket(config) {
        var _this = this;

        _classCallCheck(this, Socket);

        this._onOpen = function () {
            _this._log('socket connected');
            _this._callbacks.connect.forEach(function (_ref) {
                var fn = _ref.fn;
                return fn();
            });
        };

        this._onError = function () {
            _this._log('socket error');
            _this._callbacks.error.forEach(function (_ref2) {
                var fn = _ref2.fn;
                return fn();
            });
        };

        this._onClose = function () {
            _this._log('socket closed');
            _this._callbacks.disconnect.forEach(function (_ref3) {
                var fn = _ref3.fn;
                return fn();
            });
            _this._socket.onclose = _this._socket.onopen = _this._socket.onerror = null;
            if (_this._auto_reconnect && !_this._deliberateClose) {
                _this._attemptReconnect();
            }
        };

        this._attemptReconnect = function () {
            var time = _this._auto_reconnect && _this._auto_reconnect.every ? _this._auto_reconnect.every : 2000;

            if (_this._reconnectInterval) {
                clearInterval(_this._reconnectInterval);
            }

            _this._reconnectInterval = setInterval(function () {

                if (!_this._isConnected()) {

                    _this._callbacks.reconnecting.forEach(function (_ref4) {
                        var fn = _ref4.fn;
                        return fn();
                    });

                    _this._log('attempting to reconnect');

                    _this.open();
                } else {

                    clearInterval(_this._reconnectInterval);
                }
            }, time);
        };

        this.close = function () {

            _this._deliberateClose = true;

            if (_this._isConnected()) {
                _this._log('closing socket');
                _this._socket.close();
                if (_this._reconnectInterval) {
                    clearInterval(_this._reconnectInterval);
                }
            } else {
                _this._log('socket is already closed');
            }
        };

        this._removeResponseListener = function (event) {

            if (!_this._callbacks[event]) {
                _this._log('cannot remove response_listener that does not exist', '', true);
                return;
            }

            delete _this._callbacks[event];

            _this._log('response_listener removed. callbacks:', _this._callbacks);
        };

        this._validateResponse = function (data) {
            var parsed = (0, _string_manipulation.tryParse)(data); // returns {ok,data,error}

            if (!parsed.ok) {
                _this._log('data received from socket does not have valid format. instead received:', parsed.data, true);
                return { ok: false };
            }

            if (!parsed.data.event || typeof parsed.data.event !== 'string') {
                _this._log('received messages are required to have an event property of type string', '', true);
                return { ok: false };
            }

            var response = parsed.data;

            if (!_this._callbacks[response.event]) {
                _this._log('no handler exists from this event received from socket:', response.event, true);
                return { ok: false };
            }

            return { ok: true, response: response };
        };

        this._onMessage = function (_ref5) {
            var data = _ref5.data;


            var validation = _this._validateResponse(data);
            if (!validation.ok) {
                return;
            }

            var response = validation.response;


            _this._callbacks[response.event].forEach(function (_ref6) {
                var fn = _ref6.fn,
                    response_listener = _ref6.response_listener,
                    event = _ref6.event;

                fn(response.data);
                if (response_listener) {
                    _this._log('response listener exists. removing it...', _this._callbacks[response.event]);
                    _this._removeResponseListener(event);
                }
            });
        };

        this._isConnected = function () {
            return _this._socket ? _this._socket.readyState === WebSocket.OPEN : false;
        };

        this.open = function () {
            _this._deliberateClose = false;
            _this._log('initializing socket');
            if (!_this._isConnected()) {
                try {
                    _this._socket = new _this._WebSocket(_this._url, _this._websocket_options);
                } catch (e) {
                    _this._log('error instantiating WebSocket', e, true);
                    _this._socket = false;
                }
                if (!_this._socket) {
                    return;
                }
                _this._socket.onopen = _this._onOpen;
                _this._socket.onerror = _this._onError;
                _this._socket.onmessage = _this._onMessage;
                _this._socket.onclose = _this._onClose;
            } else {
                _this._log('socket already open');
            }
        };

        this._isValidOnEventArgs = function (event, cb) {
            var valid_args = true;

            if (!(0, _type_checks.isString)(event)) {
                valid_args = false;
                _this._log('Must provide a string for the event type.', '', true);
            }

            if (!(0, _type_checks.isFunction)(cb)) {
                _this._log('Must provide a function for a callback.', '', true);
                valid_args = false;
            }

            return valid_args;
        };

        this.on = function (event, cb, response_listener) {

            if (!_this._isValidOnEventArgs(event, cb)) {
                return;
            }

            //stringify the name to allow this.remove_on to find the anonymous function
            var name = cb.toString();

            var already_pushed = (0, _crud_operations.findByIdInObjArr_give_index)(_this._callbacks[event], 'name', name);

            if (already_pushed !== false) {
                // this._log('already listening to the event with this function', name, true);
                return;
            }

            var event_listener = { name: name, fn: cb, response_listener: response_listener, event: event };

            if (!_this._callbacks[event]) {

                _this._callbacks[event] = [event_listener];
            } else {

                _this._callbacks[event].push(event_listener);
            }
        };

        this.send = function (event) {
            var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var response_id = arguments[2];


            if (!_this._isConnected()) {
                return;
            }
            if (!(0, _type_checks.isString)(event)) {
                _this._log('.send must provide a string for the event type.', '', true);
                return;
            }

            var is_request = (0, _type_checks.isString)(response_id);

            var message = void 0;

            if (is_request) {
                message = {
                    event: event,
                    data: data,
                    type: 'request',
                    response_id: response_id
                };

                if ((0, _type_checks.isFunction)(_this._requestMapper)) {
                    message = _this._requestMapper(message);
                }
            } else {
                message = {
                    event: event,
                    data: data,
                    type: 'send'
                };

                if ((0, _type_checks.isFunction)(_this._sendMapper)) {
                    message = _this._sendMapper(message);
                }
            }

            _this._socket.send(JSON.stringify(message));
        };

        this._validateRequestArgs = function (event, params_or_cb_if_no_params, cb_if_params) {

            var ok = true;

            if (!(0, _type_checks.isString)(event)) {
                _this._log('/request method: a string event name is required', '', true);
                ok = false;
            }

            if (!(0, _type_checks.isObject)(params_or_cb_if_no_params) && !(0, _type_checks.isFunction)(params_or_cb_if_no_params)) {
                _this._log('/request method: a params object or callback function is required on the second parameter', '', true);
                ok = false;
            }
            if ((0, _type_checks.isObject)(params_or_cb_if_no_params) && !(0, _type_checks.isFunction)(cb_if_params)) {
                _this._log('/request method: a callback function is required as a third parameter if a param object is passed as the second', '', true);
                ok = false;
            }

            if (!ok) {
                return { ok: false };
            }

            var return_obj = void 0;

            if ((0, _type_checks.isObject)(params_or_cb_if_no_params)) {

                return_obj = {
                    ok: true,
                    params: params_or_cb_if_no_params,
                    cb: cb_if_params
                };
            } else if ((0, _type_checks.isFunction)(params_or_cb_if_no_params)) {

                return_obj = {
                    ok: true,
                    params: {},
                    cb: params_or_cb_if_no_params
                };
            }

            return return_obj;
        };

        this.request = function (event, params_or_cb_if_no_params, cb_if_params) {
            var _validateRequestArgs = _this._validateRequestArgs(event, params_or_cb_if_no_params, cb_if_params),
                ok = _validateRequestArgs.ok,
                params = _validateRequestArgs.params,
                cb = _validateRequestArgs.cb;

            if (!ok) {
                _this._log('request arguments are invalid', '', true);
                return;
            }

            var response_id = event + '_response_' + (0, _number_generation.uniqueID)();

            _this._log('requesting');

            _this.send(event, params, response_id);

            _this.on(response_id, cb, true);
        };

        this._log = function (msg) {
            var arg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
            var error = arguments[2];

            if (_this._should_console_log) {
                error ? console.error('Socket.js: ' + msg, arg) : console.log('Socket.js: ' + msg, arg);
            }
        };

        if (!config) {
            console.error('missing required config object for socket. required config:');
            return;
        }

        var websocket = config.websocket,
            url = config.url,
            websocket_options = config.websocket_options,
            auto_reconnect = config.auto_reconnect,
            requestMapper = config.requestMapper,
            sendMapper = config.sendMapper,
            should_console_log = config.should_console_log;


        if (!url) {
            console.error('missing required url for socket');
        }

        this._url = url ? url : null;
        this._auto_reconnect = auto_reconnect ? auto_reconnect : null;
        this._websocket_options = websocket_options ? websocket_options : null;

        this._requestMapper = null;
        if ((0, _type_checks.isFunction)(requestMapper)) {
            this._requestMapper = requestMapper;
        }

        this._sendMapper = false;
        if ((0, _type_checks.isFunction)(sendMapper)) {
            this._sendMapper = sendMapper;
        }

        this._callbacks_base = {
            connect: [],
            disconnect: [],
            reconnecting: [],
            error: []
        };

        this._callbacks = Object.assign({}, this._callbacks_base);
        this._reconnectInterval = null;
        this._deliberateClose = false;

        this._should_console_log = should_console_log ? should_console_log : null;

        this._WebSocket = websocket ? websocket : WebSocket;

        this._socket = null;

        /* -- request mapper for project
        ({event, type, response_id, data}) => ({
            event,
            data: {type, response_id, data}
        })
         */

        /* -- send mapper for project
          sendMapper: ({event, type, data}) => ({
            event,
            data: {type, data}
        })
         */
    };

    exports.default = Socket;
});