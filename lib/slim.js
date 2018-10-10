(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', '@iosio/utils/lib/eventer', '@iosio/utils/lib/number_generation'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('@iosio/utils/lib/eventer'), require('@iosio/utils/lib/number_generation'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.eventer, global.number_generation);
        global.slim = mod.exports;
    }
})(this, function (exports, _eventer2, _number_generation) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Socket = undefined;

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    var isObject = function isObject(val) {
        return (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object';
    },
        isFunction = function isFunction(val) {
        return typeof val === 'function';
    },
        isString = function isString(val) {
        return typeof val === 'string';
    };
    var Socket = exports.Socket = function Socket(_ref) {
        var _url = _ref._url,
            _websocket_options = _ref._websocket_options,
            _auto_reconnect = _ref._auto_reconnect;

        var _callbacks = Object.create(null),
            _reconnectInterval = null,
            _deliberateClose = false,
            _socket = null,
            _eventer = (0, _eventer2.Eventer)(_callbacks),
            _attemptReconnect = function _attemptReconnect() {
            if (_reconnectInterval) clearInterval(_reconnectInterval);
            _reconnectInterval = setInterval(function () {
                if (!_isConnected()) {
                    _eventer.emit('reconnecting');
                    open();
                } else clearInterval(_reconnectInterval);
            }, _auto_reconnect && _auto_reconnect.every ? _auto_reconnect.every : 2000);
        },
            close = function close() {
            _deliberateClose = true;
            if (_isConnected()) {
                _socket.close();
                _reconnectInterval && clearInterval(_reconnectInterval);
            }
        },
            _isConnected = function _isConnected() {
            return _socket ? _socket.readyState === _WebSocket.OPEN : false;
        },
            _isResponse = function _isResponse(res) {
            return typeof res === 'string' && res.search('@response-') > -1;
        },
            open = function open() {
            _deliberateClose = false;
            if (_isConnected()) return;
            try {
                _socket = new WebSocket(_url, _websocket_options);
            } catch (e) {
                _socket = false;
            }
            if (!_socket) return;
            _socket.onopen = function () {
                return _eventer.emit('connect');
            };
            _socket.onerror = function () {
                return _eventer.emit('error');
            };
            _socket.onclose = function () {
                _eventer.emit('disconnect');
                _auto_reconnect && !_deliberateClose && _attemptReconnect();
            };
            _socket.onmessage = function (_ref2) {
                var data = _ref2.data;

                var msg = void 0;
                try {
                    msg = JSON.parse(data);
                } catch (e) {
                    if (e) return;
                }
                _eventer.emit(msg.event, msg.data);
                _isResponse(msg.event) && _eventer.destroy(msg.event);
            };
        },
            on = function on(event, cb) {
            return _eventer.on(event, cb);
        },
            off = function off(event, cb) {
            return _eventer.off(event, cb);
        },
            send = function send(event) {
            var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var response_id = arguments[2];

            if (!_isConnected()) return;
            var message = void 0;
            if (typeof response_id === 'string') message = { event: event, data: data, type: 'request', response_id: response_id };else message = { event: event, data: data, type: 'send' };
            _socket.send(JSON.stringify(message));
        },
            _validateRequestArgs = function _validateRequestArgs(event, par_or_cb, cb_if_par) {
            var ok = true;
            if (!isString(event)) ok = false;
            if (!isObject(par_or_cb) && !isFunction(par_or_cb)) ok = false;
            if (isObject(par_or_cb) && !isFunction(cb_if_par)) ok = false;
            if (!ok) return { ok: false };
            if (isObject(par_or_cb)) return { ok: true, params: par_or_cb, cb: cb_if_par };else if (isFunction(par_or_cb)) return { ok: true, params: {}, cb: par_or_cb };
            return { ok: false };
        },
            request = function request(event, par_or_cb, cb_if_par) {
            var _validateRequestArgs2 = _validateRequestArgs(event, par_or_cb, cb_if_par),
                ok = _validateRequestArgs2.ok,
                params = _validateRequestArgs2.params,
                cb = _validateRequestArgs2.cb;

            if (!ok) return;
            var response_id = '@response-' + event + '-' + (0, _number_generation.uniqueID)();
            send(event, params, response_id);
            on(response_id, cb, true);
        };
        return { open: open, send: send, request: request, on: on, off: off, close: close };
    };
    exports.default = Socket;
});