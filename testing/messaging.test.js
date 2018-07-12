import {Server, WebSocket} from 'mock-socket';
import Socket from "../src/";
import {tryParse} from '@iosio/utils/lib/string_manipulation';
import {isUndefined, isFunction,} from '@iosio/utils/lib/type_checks';
import {isShape} from '@iosio/utils/lib/isShape';

import {Eventer} from '@iosio/utils/lib/eventer';


const wait = time => new Promise(resolve => setTimeout(resolve, time));


const eve = Eventer();

const till = (it_happened) => {
    return new Promise((resolve, reject) => {
        eve.on(it_happened, (status) => {
            status === 'fail' ? reject(it_happened + ' failed') : resolve();
        })
    });
};

const URL = "ws://localhost:4000";

const mockServer1 = new Server(URL);


const fail = jest.fn();

let send_test_data;
let send_test_event;

let request_test_data;
let request_test_event;


mockServer1.on('connection', sock => {

    const send = (data) => sock.send(JSON.stringify(data));


    eve.emit('server-connected');


    sock.on('message', (data) => {

        let received = tryParse(data);//returns {ok, data, error}

        if (received.ok) {


            if (received.data.type === 'send') {
                eve.emit('server-received-send');
                send_test_data = received.data.data;
                send_test_event = received.data.event;
                send({event: 'send-response', data: 'test'});
            }


            // console.log(received.data);
            if (received.data.type === 'request' && received.data.event !== 'nummy') {
                request_test_data = received.data.data;
                request_test_event = received.data.event;
                send({event: received.data.response_id, data: 'test'});

            }


            if (received.data.type === 'request' && received.data.event === 'nummy') {

                send({
                    event: received.data.response_id,
                    data: received.data.data.num
                });
            }


        } else {

            eve.emit('server-received-send', 'fail');
            fail();
        }

    })

});


const socket = new Socket({
    url: URL,
    should_console_log: true,
    websocket: WebSocket,
});


describe('messaging', () => {


    it('should send message and receive message', async () => {

        socket.open();

        await till('server-connected');

        socket.send('test', {test: 'message'});

        socket.on('send-response', (data) => {
            eve.emit('socket-received-send-message');
            expect(data).toBe('test');
        });


        await Promise.all([
            till('server-received-send'),
            till('socket-received-send-message')
        ]);

        expect(send_test_data).toEqual({test: 'message'});
        expect(send_test_event).toEqual('test');
        expect(socket._callbacks['send-response']).toBeDefined();

    });


    it('request should work properly. event handler should be removed', async () => {


        socket.request('test', {test: 'message'}, (data) => {
            let event = false;
            Object.keys(socket._callbacks).forEach((key) => {
                console.log(key);
                if (socket._isResponse(key)) {
                    event = true;
                }
            });

            expect(event).toBe(true);
            eve.emit('socket-received-request');
            expect(data).toBe('test');
        });


        await Promise.all([
            till('socket-received-request')
        ]);
        expect(request_test_data).toEqual({test: 'message'});
        expect(request_test_event).toEqual('test');

        /*

            do a bunch of requests at once to verify no cross contamination

         */

        // const repeat_and_done = (times) => (func) => {
        //     return [...Array(times)].map((_, i) => {
        //         let done = i === (times - 1);
        //         func(done);
        //     })
        // };

        const repeat = times => func => [...Array(times)].map(() => func());

        let num = 0;
        const amount_to_repeat = 100;
        repeat(amount_to_repeat)(() => {
            num++;
            socket.request('nummy', {num}, (nummy) => {
                // console.log('*****************', nummy)
                nummy === amount_to_repeat && eve.emit('done');
            });
        });



        await till('done');

        let request_events_removed = true;


        Object.keys(socket._callbacks).forEach((key) => {
            if (socket._isResponse(key)) {
                request_events_removed = false;
            }
        });


        expect(request_events_removed).toBe(true);



    });


});
