import {
    isFunction,
    isString,
    removeItemFromObjArrById,
    findByIdInObjArr_give_index,
    tryParse,
    isObject,
    uniqueID,
    isShape
} from "@iosio/utils";


export class Socket {

    constructor({url, auto_reconnect, should_console_log = true,}) {
        this.url = url;
        this.auto_reconnect = auto_reconnect;

        this.should_log = should_console_log;

        this.callbacks_base = {
            connect: [],
            disconnect: [],
            reconnecting: [],
            error: [],
        };

        this.callbacks = {
            connect: [],
            disconnect: [],
            reconnecting: [],
            error: [],
        };

        this.is_open = false;

        this.reconnectInterval = false;

        this.deliberateClose = false;

        this.testOutputCallback = false;

        this.testReceiveCallback = false;

    }


    /**
     * logs out msgs if this.should_log is true
     * @param {String} msg - message to log
     * @param {*} arg - anything else
     * @param {Boolean} error - optional print error
     * @returns {Undefined} - returns nothing
     */
    log = (msg, arg = "", error) => {
        if (this.should_log) {
            error ? console.error('Socket.js: ' + msg, arg) : console.log('Socket.js: ' + msg, arg);
        }
    };

    isValidOnEventArgs = (event, cb) => {
        let valid_args = true;

        if (!isString(event)) {
            valid_args = false;
            this.log('Must provide a string for the event type.', '', true);
        }

        if (!isFunction(cb)) {
            this.log('Must provide a function for a callback.', '', true);
            valid_args = false;
        }

        return valid_args;
    };

    removeResponseListener = (event) => {


        if (!this.callbacks[event]) {
            this.log('cannot remove response_listener that does not exist', '', true);
            return;
        }

        delete this.callbacks[event];

        this.log('response_listener removed. callbacks:', this.callbacks);
    };

    /**
     * initializes the socket
     * @returns {Undefined} - returns nothing
     */
    open = () => {

        this.deliberateClose = false;

        this.log('initializing socket');

        if (this.is_open) {

            this.log('socket already open');

        } else {

            this.socket = new WebSocket(this.url);


            this.socket.onopen = () => {
                this.log('socket connected');
                this.is_open = true;
                this.callbacks.connect.forEach(({fn,}) => fn({is_open: this.isConnected(),}));
            };


            this.socket.onerror = () => {
                this.log('socket error');
                this.callbacks.error.forEach(({fn,}) => fn());
            };


            this.socket.onmessage = ({data}) => {


                const parsed = tryParse(data);// returns {ok,data,error}

                if (!parsed.ok) {
                    this.log('received invalid data from socket. Error: ', parsed.error, true);
                    return;
                }

                let results = isShape(parsed.data, {
                    event:{
                        type: 'string',
                        required: true,
                    },
                    data:{
                        type: 'any',
                    }
                });


                if(!results.ok){
                    this.log('data received from socket does not have valid format. instead received:', parsed.data, true);
                    this.log(results.errors, '', true);
                    return;
                }

                let response = parsed.data;

                if (!this.callbacks[response.event]) {
                    this.log('no handler exists from this event received from socket:', response.event, true);
                    return;
                }


                if (isFunction(this.testReceiveCallback)) {
                    this.testReceiveCallback(parsed.data);
                }

                this.callbacks[response.event].forEach(({fn, response_listener, event}) => {

                    fn(response.data);

                    if (response_listener) {
                        this.log('response listener exists. removing it...', this.callbacks[response.event]);
                        this.removeResponseListener(event);
                    }
                });


            };


            this.socket.onclose = () => {

                this.is_open = false;

                this.log('socket has closed');

                this.callbacks.disconnect.forEach(({fn,}) => fn());

                this.deregisterListeners();

                if (this.auto_reconnect && !this.deliberateClose) {
                    this.attemptReconnect();
                }

            };

        }

    };


    isConnected = () => {
        return this.socket.readyState === WebSocket.OPEN;
    };


    attemptReconnect = () => {
        const time = this.auto_reconnect && this.auto_reconnect.every ? this.auto_reconnect.every : 2000;


        if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
        }


        this.reconnectInterval = setInterval(() => {

            if (!this.is_open) {


                this.callbacks.reconnecting.forEach(({fn,}) => fn());

                this.log('attempting to reconnect');

                this.open();

            } else {

                clearInterval(this.reconnectInterval);
            }

        }, time);
    };


    deregisterListeners = () => {
        this.socket.onclose = this.socket.onopen = this.socket.onerror = null;
    };


    close = () => {

        this.log('closing socket');
        this.is_open = false;
        this.deliberateClose = true;

        this.socket.close();
        if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
        }

        // this.socket = false;
    };

    send = (event, data) => {

        if (!isString(event)) {
            this.log('a string event name is required', '', true);
            return;
        }

        if (this.is_open && this.isConnected()) {

            if (!data.type) {
                data.type = 'send';
            }

            let message = {event, data,};

            if (isFunction(this.testOutputCallback)) {
                this.testOutputCallback(message);
            }

            let message_string = JSON.stringify(message);

            this.socket.send(message_string);

        } else {
            this.log('cant send message. socket is closed', '', true);
        }

    };

    validateRequestArgs = (event, params_or_cb_if_no_params, cb_if_params) => {

        let ok = true;

        if (!isString(event)) {
            this.log('/request method: a string event name is required', '', true);
            ok = false;
        }

        if (!isObject(params_or_cb_if_no_params) && !isFunction(params_or_cb_if_no_params)) {
            this.log('/request method: a params object or callback function is required on the second parameter', '', true);
            ok = false;
        }
        if (isObject(params_or_cb_if_no_params) && !isFunction(cb_if_params)) {
            this.log('/request method: a callback function is required as a third parameter if a param object is passed as the second', '', true);
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

    setTestOutputCallback = (cb) => {
        this.testOutputCallback = cb;
    };

    setTestReceiveCallback = (cb) => {
        this.testReceiveCallback = cb;
    };

    request = (event, params_or_cb_if_no_params, cb_if_params) => {


        let {ok, params, cb,} = this.validateRequestArgs(event, params_or_cb_if_no_params, cb_if_params);

        if (!ok) {
            this.log('request arguments are invalid', '', true);
            return;
        }

        if (this.is_open && this.isConnected()) {
            const response_id = event + '_response_' + uniqueID();

            let request_data = {type: 'request', response_id, data: params};

            if (isFunction(this.testOutputCallback)) {
                this.testOutputCallback(request_data);
            }

            console.log('requestttttttt')

            this.send(event, request_data);

            this.on(response_id, cb, true);

        }else{
            this.log('socket not open. cannot make request', '', true);
        }
    };


    on = (event, cb, response_listener) => {

        if (!this.isValidOnEventArgs(event, cb)) {
            return;
        }

        //stringify the name to allow this.remove_on to find the anonymous function
        let name = cb.toString();

        let already_pushed = findByIdInObjArr_give_index(this.callbacks[event], 'name', name);

        if (already_pushed !== false) {
            // this.log('already listening to the event with this function', name, true);
            return;
        }


        let event_listener = {name, fn: cb, response_listener, event};

        if (!this.callbacks[event]) {

            this.callbacks[event] = [event_listener];

        } else {

            this.callbacks[event].push(event_listener);
        }

    };


    remove_on = (event, cb) => {

        if (!this.isValidOnEventArgs(event, cb)) {
            return;
        }

        if (!this.callbacks[event]) {
            this.log('cannot remove an event that does not exist', '', true);
            return;
        }

        let updated_list = removeItemFromObjArrById(this.callbacks[event], 'name', cb.toString());

        if (updated_list) {
            this.callbacks[event] = updated_list;
        } else {
            this.log('cb not removed or has not been previously set', '', true);
        }

    };

    removeAll = () => {
        this.callbacks = this.callbacks_base;
    };


}


