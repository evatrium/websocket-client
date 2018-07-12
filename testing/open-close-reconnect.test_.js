import {Server, WebSocket} from 'mock-socket';
import Socket from "../src/";
import {tryParse} from '@iosio/utils/lib/string_manipulation';
import {isUndefined, isFunction,} from '@iosio/utils/lib/type_checks';
import {Eventer} from '@iosio/utils/lib/eventer';


const wait = time => new Promise(resolve => setTimeout(resolve, time));


const eve = Eventer();

const till = (it_happened) => {
    return new Promise(resolve => {
        eve.on(it_happened, () => {
            resolve();
        })
    })
};

const URL = "ws://localhost:4000";

const mockServer1 = new Server(URL);

mockServer1.on('connection', sock => {

    eve.emit('server-connected');


    // console.log('server connected');

    eve.on('close-server', () => {
        console.log('closing server');
        sock.close();
    });

    sock.on('close', () => {
        eve.emit('server-closed');
    })

});


describe('websocket should work as expected', async () => {


    const socket = new Socket({
        url: URL,
        websocket: WebSocket,
        should_console_log: false
    });



    it('should connect successfully', async () => {

        socket.open();
        const socketConnected = jest.fn();

        socket.on('connect', () => {
            eve.emit('socket-connected');
            socketConnected();
        });

        await Promise.all([
            till('socket-connected'),
            till('server-connected')
        ]);

        expect(socketConnected).toHaveBeenCalledTimes(1);

        expect(socket._isConnected()).toBe(true);

    });


    it('should close successfully', async () => {


        const socketClosed = jest.fn();
        socket.on('disconnect', () => {
            eve.emit('socket-closed');
            socketClosed();
        });


        socket.close();
        await till('socket-closed');

        expect(socketClosed).toHaveBeenCalledTimes(1);

        expect(socket._isConnected()).toBe(false);

    });


    it('should attempt reconnect ', async () => {

        socket.close();

        socket._should_console_log = false;

        socket._auto_reconnect = true;

        const initial_connect = () => {
            eve.emit('socket-init');
            // console.log('init connect')
            socket.off('connect', initial_connect);
        };


        socket.on('connect', initial_connect);

        socket.open();

        await till('socket-init');


        const socketReconnecting = jest.fn();
        socket.on('reconnecting', () => {
            eve.emit('socket-reconnecting');
            socketReconnecting();
        });

        socket.on('connect', ()=>{
            eve.emit('connected_')
        });

        socket._socket.close();

        await till('socket-reconnecting');
        await till('connected_');

        expect(socket._isConnected()).toBe(true);

        expect(socketReconnecting).toHaveBeenCalled();

    });


});