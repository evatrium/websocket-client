import {Server, WebSocket} from 'mock-socket';
import Socket from "../src/";
import {tryParse} from '@iosio/utils/lib/string_manipulation';
import {isUndefined, isFunction,} from '@iosio/utils/lib/type_checks';
import {Eventer} from '@iosio/utils/lib/eventer';

const URL = "ws://localhost:4000";

const mockServer = new Server(URL);


let eventer = Eventer();


const wait = time => new Promise(resolve => setTimeout(resolve, time));

describe('websocket-client', async () => {

    describe('instantiation', () => {




        // const socket1 = new Socket({
        //     websocket: WebSocket, // the global WebSocket class is available via mock-socket
        //     url: URL,
        //     websocket_options: undefined,
        //     auto_reconnect: {every: 1000},
        //     requestMapper: (request) => ({...request}),
        //     sendMapper: (send) => ({...send}),
        //     should_console_log: true,
        // });

        console.error = jest.fn();

        beforeEach(() => {
            console.error.mockClear();
        });


        it('instantiates as expected. class members should be defined', () => {

            let should_log = false;
            const socket1 = new Socket({
                websocket: WebSocket, // the global WebSocket class is available via mock-socket
                url: URL,
                auto_reconnect: {every: 1000},
                requestMapper: (request) => ({...request}),
                sendMapper: (send) => ({...send}),
                should_console_log: should_log,
                websocket_options: 'protocol'
            });


            expect(socket1._url).toEqual(URL);
            expect(socket1._auto_reconnect).toEqual({every: 1000});
            expect(isFunction(socket1._requestMapper)).toEqual(true);
            expect(isFunction(socket1._sendMapper)).toEqual(true);
            expect(socket1._should_console_log).toEqual(should_log);
            expect(socket1._socket).toEqual(null);


            const class_methods = Object.keys(socket1);

            setTimeout(() => {

                class_methods.forEach((meth) => {

                    expect(socket1[meth]).toBeDefined();
                });

            }, 200);


            const methods = [
                '_onOpen',
                '_onError',
                '_onClose',
                '_attemptReconnect',
                'close',
                '_validateReceivedMessage',
                '_onMessage',
                '_isConnected',
                '_isResponse',
                'open',
                '_isValidOnEventArgs',
                'on',
                'off',
                'send',
                '_validateRequestArgs',
                'request',
                '_log',
                '_url',
                '_auto_reconnect',
                '_websocket_options',
                '_requestMapper',
                '_sendMapper',
                '_reconnectInterval',
                '_deliberateClose',
                '_should_console_log',
                '_WebSocket',
                '_socket',
                'CONNECT',
                'DISCONNECT',
                'RECONNECTING',
                'ERROR',
                '_callbacks',
                '_eventer'
            ];

            expect(class_methods).toEqual(
                expect.arrayContaining(methods)
            );

        });

        it('should console.error when not provided config object or url on instantiation ', () => {

            const socket1 = new Socket();
            const socket2 = new Socket({websocket: WebSocket});
            expect(console.error).toHaveBeenCalledTimes(2);
        });


    });



});
