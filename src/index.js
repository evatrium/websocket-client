import {isFunction, isString, isObject} from "@iosio/utils/lib/type_checks";
// import {findByIdInObjArr_give_index} from "@iosio/utils/lib/crud_operations";
import {Eventer} from '@iosio/utils/lib/eventer';
import {tryParse} from '@iosio/utils/lib/string_manipulation';
import {uniqueID} from '@iosio/utils/lib/number_generation';


export default class Socket {

    constructor(config) {

        if (!config) {
            console.error('missing required config object for socket. required config:');
            return;
        }

        const {
            websocket,
            url,
            websocket_options,
            auto_reconnect,
            requestMapper,
            sendMapper,
            should_console_log
        } = config;

        if (!url) {
            console.error('missing required url for socket');
        }

        this._url = url ? url : null;
        this._auto_reconnect = auto_reconnect ? auto_reconnect : false;
        this._websocket_options = websocket_options;


        this._requestMapper = null;
        if (isFunction(requestMapper)) {
            this._requestMapper = requestMapper;
        }

        this._sendMapper = false;
        if (isFunction(sendMapper)) {
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

        this._eventer = Eventer(this._callbacks);


        /* -- request mapper example
        ({event, type, response_id, data}) => ({
            event,
            data: {type, response_id, data}
        })
         */

        /* -- send mapper example
          sendMapper: ({event, type, data}) => ({
            event,
            data: {type, data}
        })
         */

    }


    _onOpen = () => {
        this._log('socket connected');
        this._eventer.emit(this.CONNECT);
    };

    _onError = () => {
        this._log('socket error');
        this._eventer.emit(this.ERROR);
    };

    _onClose = () => {
        this._log('socket closed');
        this._eventer.emit(this.DISCONNECT);

        // this._socket.onclose = this._socket.onopen = this._socket.onerror = null;
        if (this._auto_reconnect && !this._deliberateClose) {
            this._attemptReconnect();
        }
    };

    _attemptReconnect = () => {
        const time = this._auto_reconnect && this._auto_reconnect.every ? this._auto_reconnect.every : 2000;

        if (this._reconnectInterval) {
            clearInterval(this._reconnectInterval);
        }

        this._reconnectInterval = setInterval(() => {

            if (!this._isConnected()) {

                this._log('attempting to reconnect');

                this._eventer.emit(this.RECONNECTING);

                this.open();

            } else {

                clearInterval(this._reconnectInterval);
            }

        }, time);
    };

    close = () => {

        this._deliberateClose = true;

        if (this._isConnected()) {
            this._log('closing socket');
            this._socket.close();
            if (this._reconnectInterval) {
                clearInterval(this._reconnectInterval);
            }
        } else {
            this._log('socket is already closed')
        }

    };


    _validateReceivedMessage = (data) => {
        const parsed = tryParse(data);// returns {ok,data,error}

        if (!parsed.ok) {
            this._log('data received from socket does not have valid format. instead received:', parsed.data, true);
            return {ok: false};
        }

        if (!parsed.data.event || typeof parsed.data.event !== 'string') {
            this._log('received messages are required to have an event property of type string', '', true);
            return {ok: false}
        }

        let message = parsed.data;

        if (!this._callbacks[message.event]) {
            this._log('no handler exists from this event received from socket:', message.event, true);
            return {ok: false}
        }

        return {ok: true, message}
    };

    _onMessage = ({data}) => {

        const validation = this._validateReceivedMessage(data);
        if (!validation.ok) {
            return;
        }

        const {message} = validation;

        this._eventer.emit(message.event, message.data);

        this._isResponse(message.event) && this._eventer.destroy(message.event);

    };

    _isConnected = () => {
        return this._socket ? (this._socket.readyState === this._WebSocket.OPEN) : false;
    };

    _isResponse = (res)=> isString(res) && res.search('@response-') > -1;


    open = () => {
        this._deliberateClose = false;
        this._log('initializing socket');
        if (!this._isConnected()) {
            try {
                this._socket = new this._WebSocket(this._url, this._websocket_options);
            } catch (e) {
                this._log('error instantiating WebSocket', e, true);
                this._socket = false;
            }
            if (!this._socket) {
                return;
            }
            this._socket.onopen = this._onOpen;
            this._socket.onerror = this._onError;
            this._socket.onmessage = this._onMessage;
            this._socket.onclose = this._onClose;
        } else {
            this._log('socket already open');
        }
    };

    _isValidOnEventArgs = (event, cb) => {
        let valid_args = true;

        if (!isString(event)) {
            valid_args = false;
            this._log('Must provide a string for the event type.', '', true);
        }

        if (!isFunction(cb)) {
            this._log('Must provide a function for a callback. Must be named function if you want to remove its listener', '', true);
            valid_args = false;
        }

        return valid_args;
    };

    on = (event, cb) => {
        this._isValidOnEventArgs(event, cb) && this._eventer.on(event, cb);
        // return {off: ()=>this.off(event, cb)};
    };

    off = (event, cb) => {
        if(this._isValidOnEventArgs(event, cb) && cb.name){
            this._eventer.off(event, cb);
        }else{
            this.log('callback function passed to .off must also be a named function (not anonymous) ');
        }

    };

    send = (event, data = {}, response_id) => {

        if (!this._isConnected()) {
            return;
        }
        if (!isString(event)) {
            this._log('.send must provide a string for the event type.', '', true);
            return;
        }

        let is_request = isString(response_id);

        let message;

        if (is_request) {
            message = {
                event,
                data,
                type: 'request',
                response_id
            };

            if (isFunction(this._requestMapper)) {
                message = this._requestMapper(message);
            }
        } else {
            message = {
                event,
                data,
                type: 'send'
            };

            if (isFunction(this._sendMapper)) {
                message = this._sendMapper(message);
            }
        }


        this._socket.send(JSON.stringify(message));
    };


    _validateRequestArgs = (event, params_or_cb_if_no_params, cb_if_params) => {

        let ok = true;

        if (!isString(event)) {
            this._log('/request method: a string event name is required', '', true);
            ok = false;
        }

        if (!isObject(params_or_cb_if_no_params) && !isFunction(params_or_cb_if_no_params)) {
            this._log('/request method: a params object or callback function is required on the second parameter', '', true);
            ok = false;
        }
        if (isObject(params_or_cb_if_no_params) && !isFunction(cb_if_params)) {
            this._log('/request method: a callback function is required as a third parameter if a param object is passed as the second', '', true);
            ok = false;
        }

        if (!ok) {
            return {ok: false,};
        }


        let return_obj;

        if (isObject(params_or_cb_if_no_params)) {

            return_obj = {
                ok: true,
                params: params_or_cb_if_no_params,
                cb: cb_if_params,
            };

        } else if (isFunction(params_or_cb_if_no_params)) {

            return_obj = {
                ok: true,
                params: {},
                cb: params_or_cb_if_no_params,
            };
        }

        return return_obj;
    };



    request = (event, params_or_cb_if_no_params, cb_if_params) => {


        let {ok, params, cb,} = this._validateRequestArgs(event, params_or_cb_if_no_params, cb_if_params);

        if (!ok) {
            this._log('request arguments are invalid', '', true);
            return;
        }

        const response_id = '@response-' + event + '-' + uniqueID();

        this._log('requesting');

        this.send(event, params, response_id);

        this.on(response_id, cb, true);

    };


    _log = (msg, arg = "", error) => {
        if (this._should_console_log) {
            error ? console.error('Socket.js: ' + msg, arg) : console.log('Socket.js: ' + msg, arg);
        }
    };

}