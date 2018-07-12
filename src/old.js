import {isFunction, isString, isObject} from "@iosio/utils/lib/type_checks";
import {findByIdInObjArr_give_index} from "@iosio/utils/lib/crud_operations";
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
        this._auto_reconnect = auto_reconnect ? auto_reconnect : null;
        this._websocket_options = websocket_options ? websocket_options : null;


        this._requestMapper = null;
        if (isFunction(requestMapper)) {
            this._requestMapper = requestMapper;
        }

        this._sendMapper = false;
        if (isFunction(sendMapper)) {
            this._sendMapper = sendMapper;
        }

        this._callbacks_base = {
            connect: [],
            disconnect: [],
            reconnecting: [],
            error: [],
        };

        this._callbacks = {...this._callbacks_base};
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

    }

    _onOpen = () => {
        this._log('socket connected');
        this._callbacks.connect.forEach(({fn,}) => fn());
    };

    _onError = () => {
        this._log('socket error');
        this._callbacks.error.forEach(({fn,}) => fn());
    };

    _onClose = () => {
        this._log('socket closed');
        this._callbacks.disconnect.forEach(({fn}) => fn());
        this._socket.onclose = this._socket.onopen = this._socket.onerror = null;
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

                this._callbacks.reconnecting.forEach(({fn,}) => fn());

                this._log('attempting to reconnect');

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


    _removeResponseListener = (event) => {

        if (!this._callbacks[event]) {
            this._log('cannot remove response_listener that does not exist', '', true);
            return;
        }

        delete this._callbacks[event];

        this._log('response_listener removed. callbacks:', this._callbacks);
    };


    _validateResponse = (data) => {
        const parsed = tryParse(data);// returns {ok,data,error}

        if (!parsed.ok) {
            this._log('data received from socket does not have valid format. instead received:', parsed.data, true);
            return {ok: false};
        }

        if (!parsed.data.event || typeof parsed.data.event !== 'string') {
            this._log('received messages are required to have an event property of type string', '', true);
            return {ok: false}
        }

        let response = parsed.data;

        if (!this._callbacks[response.event]) {
            this._log('no handler exists from this event received from socket:', response.event, true);
            return {ok: false}
        }

        return {ok: true, response: response}
    };

    _onMessage = ({data}) => {

        const validation = this._validateResponse(data);
        if (!validation.ok) {
            return;
        }

        const {response} = validation;

        this._callbacks[response.event].forEach(({fn, response_listener, event}) => {
            fn(response.data);
            if (response_listener) {
                this._log('response listener exists. removing it...', this._callbacks[response.event]);
                this._removeResponseListener(event);
            }
        });
    };

    _isConnected = () => {
        return this._socket ? (this._socket.readyState === WebSocket.OPEN) : false;
    };


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
            this._log('Must provide a function for a callback.', '', true);
            valid_args = false;
        }

        return valid_args;
    };

    on = (event, cb, response_listener) => {

        if (!this._isValidOnEventArgs(event, cb)) {
            return;
        }

        //stringify the name to allow this.remove_on to find the anonymous function
        let name = cb.toString();

        let already_pushed = findByIdInObjArr_give_index(this._callbacks[event], 'name', name);

        if (already_pushed !== false) {
            // this._log('already listening to the event with this function', name, true);
            return;
        }

        let event_listener = {name, fn: cb, response_listener, event};

        if (!this._callbacks[event]) {

            this._callbacks[event] = [event_listener];

        } else {

            this._callbacks[event].push(event_listener);
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

        const response_id = event + '_response_' + uniqueID();

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