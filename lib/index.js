(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', '@iosio/utils/lib/type_checks', '@iosio/utils/lib/eventer', '@iosio/utils/lib/string_manipulation', '@iosio/utils/lib/number_generation'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('@iosio/utils/lib/type_checks'), require('@iosio/utils/lib/eventer'), require('@iosio/utils/lib/string_manipulation'), require('@iosio/utils/lib/number_generation'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.type_checks, global.eventer, global.string_manipulation, global.number_generation);
        global.index = mod.exports;
    }
})(this, function (exports, _type_checks, _eventer, _string_manipulation, _number_generation) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var Socket =

    /**
     * Creates an instance of Socket.
     * @param {Object} config - the initial configuration for the module
     * @memberof Socket
     */
    function Socket(config) {
        var _this = this;

        _classCallCheck(this, Socket);

        this._onOpen = function () {
            _this._log('socket connected');
            _this._eventer.emit(_this.CONNECT);
        };

        this._onError = function () {
            _this._log('socket error');
            _this._eventer.emit(_this.ERROR);
        };

        this._onClose = function () {
            _this._log('socket closed');
            _this._eventer.emit(_this.DISCONNECT);

            // this._socket.onclose = this._socket.onopen = this._socket.onerror = null;
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
                    _this._log('attempting to reconnect');
                    _this._eventer.emit(_this.RECONNECTING);
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

        this._validateReceivedMessage = function (data) {
            var parsed = (0, _string_manipulation.tryParse)(data); // returns {ok,data,error}

            if (!parsed.ok) {
                _this._log('data received from socket does not have valid format. instead received:', parsed.data, true);
                return { ok: false };
            }

            if (!parsed.data.event || typeof parsed.data.event !== 'string') {
                _this._log('received messages are required to have an event property of type string', '', true);
                return { ok: false };
            }

            var message = parsed.data;

            if (!_this._callbacks[message.event]) {
                _this._log('no handler exists from this event received from socket:', message.event, true);
                return { ok: false };
            }

            return { ok: true, message: message };
        };

        this._onMessage = function (_ref) {
            var data = _ref.data;

            var validation = _this._validateReceivedMessage(data);
            if (!validation.ok) {
                return;
            }

            var message = validation.message;

            _this._eventer.emit(message.event, message.data);
            _this._isResponse(message.event) && _this._eventer.destroy(message.event);
        };

        this._isConnected = function () {
            return _this._socket ? _this._socket.readyState === _this._WebSocket.OPEN : false;
        };

        this._isResponse = function (res) {
            return (0, _type_checks.isString)(res) && res.search('@response-') > -1;
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
            if (!(0, _type_checks.isString)(event)) {
                _this._log('Must provide a string for the event type.', '', true);
                return false;
            }

            if (!(0, _type_checks.isFunction)(cb)) {
                _this._log('Must provide a function for a callback. Must be named function if you want to remove its listener', '', true);
                return false;
            }

            return true;
        };

        this.on = function (event, cb) {
            _this._isValidOnEventArgs(event, cb) && _this._eventer.on(event, cb);
        };

        this.off = function (event, cb) {
            if (_this._isValidOnEventArgs(event, cb) && cb.name) {
                _this._eventer.off(event, cb);
            } else {
                _this.log('callback function passed to .off must also be a named function (not anonymous) ');
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

            if ((0, _type_checks.isObject)(params_or_cb_if_no_params)) {
                return {
                    ok: true,
                    params: params_or_cb_if_no_params,
                    cb: cb_if_params
                };
            } else if ((0, _type_checks.isFunction)(params_or_cb_if_no_params)) {
                return {
                    ok: true,
                    params: {},
                    cb: params_or_cb_if_no_params
                };
            }

            return { ok: false };
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

            var response_id = '@response-' + event + '-' + (0, _number_generation.uniqueID)();
            _this._log('requesting');
            _this.send(event, params, response_id);
            _this.on(response_id, cb, true);
        };

        this._log = function (msg) {
            var arg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
            var error = arguments[2];

            if (_this._should_console_log) {
                error ? console.error('Socket.js: ' + msg, arg) : console.info('Socket.js: ' + msg, arg);
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
        this._auto_reconnect = auto_reconnect ? auto_reconnect : false;
        this._websocket_options = websocket_options;

        this._requestMapper = null;
        if ((0, _type_checks.isFunction)(requestMapper)) {
            this._requestMapper = requestMapper;
        }

        this._sendMapper = false;
        if ((0, _type_checks.isFunction)(sendMapper)) {
            this._sendMapper = sendMapper;
        }

        this._reconnectInterval = null;
        this._deliberateClose = false;
        this._should_console_log = should_console_log ? should_console_log : false;
        this._WebSocket = websocket ? websocket : WebSocket;
        this._socket = null;

        this.CONNECT = 'connect';
        this.DISCONNECT = 'disconnect';
        this.RECONNECTING = 'reconnecting';
        this.ERROR = 'error';

        this._callbacks = Object.create(null);
        this._eventer = (0, _eventer.Eventer)(this._callbacks);
    }

    /**
     * Handles emmitting when the socket is successfully connected to a websocket server
     * @memberof Socket
     * @returns {undefined}
     */


    /**
     * Handles emmiting when there is an error
     * @memberof Socket
     * @returns {undefined}
     */


    /**
     * Handles emmiting when the socket's connection is closed.
     * It will also handle autoconnction if the connection is not deliberately closed
     * and auto connect is enabled
     * @memberof Socket
     * @returns {undefined}
     */


    /**
     * Attempts to reconnect on a periodical basis
     * @memberof Socket
     * @returns {undefined}
     */


    /**
     * Will close the websocket connection deliberately1
     * @memberof Socket
     * @returns {undefined}
     */


    /**
     * Checks if the received message is in the correct format
     * @param {Object} data - the recieved data object
     * @memberof Socket
     * @returns {Object} - is the recieved message valid
     */


    /**
     * Handles emmiting when a message is received
     * @param {Object} * - the message received
     *  @property {Object} data the data received from the message
     * @memberof Socket
     * @returns {undefined}
     */


    /**
     * Checks if the websocket is connected
     * @memberof Socket
     * @returns {Boolean} - is the socket connected
     */


    /**
     * Checks if the message is a response for a named callback emittion
     * @param {*} res - the response
     * @returns {Boolean} - is the data a response
     */


    /**
     * Handles opening a websocket connection to the configured destination
     * @memberof Socket
     * @returns {undefined}
     */


    /**
     * Checks if the arguments for an event are valid
     * @param {String} event - the name of the event
     * @param {Function} cb  - the callback
     * @memberof Socket
     * @returns {Object} - are the arguments valid
     */


    /**
     * Registers an event to be listened for when the websocket client recieves an event from its connected server
     * @param {String} event - the nname of the event to listen to
     * @param {Function} cb  - the action to take when the event is received
     * @memberof Socket
     * @returns {undefined}
     */


    /**
     * Unregisters an event listener
     * @param {String} event - the event name
     * @param {Function} cb  - the callback
     * @memberof Socket
     * @returns {undefined}
     */


    /**
     * Sends a message to the connected websocket server
     * @param {String} event - the event to send
     * @param {Object} data  - the data to send with the event
     * @param {String} response_id - the response id
     * @memberof Socket
     * @returns {undefined}
     */


    /**
     * Validates the params of a reques
     * @param {String} event - the event to validate
     * @param {Object|Function} params_or_cb_if_no_params - either the options or the callback
     * @param {Function} cb_if_params - the callback if there are options
     * @memberof Socket
     * @returns {Object} - is the request valid
     */


    /**
     * Creates a named request to the server, the difference between this and send, is that this function
     * will also register an event listener for the next response based on the name of this event
     * @param {String} event - the name of the event
     * @param {Object|Function} params_or_cb_if_no_params - either params or a callback
     * @param {Function} cb_if_params - params if there is a callback
     * @memberof Socket
     * @returns {undefined}
     */


    /**
     * Handles logging if logging is enabled
     * @param {String} msg - the message to log
     * @param {String} arg - any arguments to log with the message
     * @param {Boolean} error - is this an error
     * @memberof Socket
     * @returns {undefined}
     */
    ;

    exports.default = Socket;
});