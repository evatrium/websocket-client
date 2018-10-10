import {Eventer} from '@iosio/utils/lib/eventer';
import {uniqueID} from '@iosio/utils/lib/number_generation';
let isObject = (val) => typeof val === 'object',
    isFunction = (val) => typeof val === 'function',
    isString = (val) => typeof val === 'string';
export const Socket = ({_url, _websocket_options, _auto_reconnect}) => {
    let _callbacks = Object.create(null),
        _reconnectInterval = null,
        _deliberateClose = false,
        _socket = null,
        _eventer = Eventer(_callbacks),
        _attemptReconnect = () => {
            if (_reconnectInterval) clearInterval(_reconnectInterval);
            _reconnectInterval = setInterval(() => {
                if (!_isConnected()) {
                    _eventer.emit('reconnecting');
                    open()
                } else clearInterval(_reconnectInterval)
            }, _auto_reconnect && _auto_reconnect.every ? _auto_reconnect.every : 2000);
        },
        close = () => {
            _deliberateClose = true;
            if (_isConnected()) {
                _socket.close();
                _reconnectInterval && clearInterval(_reconnectInterval);
            }
        },
        _isConnected = () => _socket ? (_socket.readyState === _WebSocket.OPEN) : false,
        _isResponse = (res) => typeof res === 'string' && res.search('@response-') > -1,
        open = () => {
            _deliberateClose = false;
            if (_isConnected()) return;
            try {
                _socket = new WebSocket(_url, _websocket_options);
            } catch (e) {
                _socket = false;
            }
            if (!_socket) return;
            _socket.onopen = () => _eventer.emit('connect');
            _socket.onerror = () => _eventer.emit('error');
            _socket.onclose = () => {
                _eventer.emit('disconnect');
                (_auto_reconnect && !_deliberateClose) && _attemptReconnect();
            };
            _socket.onmessage = ({data}) => {
                let msg;
                try {
                    msg = JSON.parse(data)
                } catch (e) {
                    if(e)return;
                }
                _eventer.emit(msg.event, msg.data);
                _isResponse(msg.event) && _eventer.destroy(msg.event);
            }
        },
        on = (event, cb) => _eventer.on(event, cb),
        off = (event, cb) => _eventer.off(event, cb),
        send = (event, data = {}, response_id) => {
            if (!_isConnected()) return;
            let message;
            if (typeof response_id === 'string') message = {event, data, type: 'request', response_id};
            else message = {event, data, type: 'send'};
            _socket.send(JSON.stringify(message));
        },
        _validateRequestArgs = (event, par_or_cb, cb_if_par) => {
            let ok = true;
            if (!isString(event)) ok = false;
            if (!isObject(par_or_cb) && !isFunction(par_or_cb)) ok = false;
            if (isObject(par_or_cb) && !isFunction(cb_if_par)) ok = false;
            if (!ok) return {ok: false,};
            if (isObject(par_or_cb)) return {ok: true, params: par_or_cb, cb: cb_if_par,};
            else if (isFunction(par_or_cb)) return {ok: true, params: {}, cb: par_or_cb,};
            return {ok: false,};
        },
        request = (event, par_or_cb, cb_if_par) => {
            let {ok, params, cb,} = _validateRequestArgs(event, par_or_cb, cb_if_par);
            if (!ok) return;
            const response_id = '@response-' + event + '-' + uniqueID();
            send(event, params, response_id);
            on(response_id, cb, true);
        };
    return{open,send, request, on, off, close};

};
export default Socket;
