// import {WebSocket} from 'mock-socket';
// import Socket from "../src/";
// import {tryParse} from '@iosio/utils/lib/string_manipulation';
// import {isUndefined, isFunction,} from '@iosio/utils/lib/type_checks';
// import {Eventer} from '@iosio/utils/lib/eventer';
//
// // import ws from 'ws';
// // import express from 'express';
// // import {createServer} from 'http';
// //
// //
// // const eve = Eventer();
// // const wss = (onConnection, port_) => {
// //     let app = express();
// //     let server = createServer(app);
// //     // let port = port_ || process.env.PORT || 4000;
// //     let port = 5000;
// //
// //     const wss = new ws.Server({server});
// //     server.listen(port, () => {
// //         console.log('Server listening at port %d', port);
// //         wss.on('connection', (socket) => {
// //             console.log('socket connected')
// //             onConnection && onConnection(socket)
// //         });
// //     });
// // };
// //
// //
// // wss((sock) => {
// //
// //     afterAll(() => {
// //         sock.destroy();
// //     });
// //
// // });
//
//
// const wait = time => new Promise(resolve => setTimeout(resolve, time));
//
//
// const till = (it_happened) => {
//     return new Promise(resolve => {
//         eve.on(it_happened, () => {
//             resolve();
//         })
//     })
// };
//
//
// const URL = "ws://localhost:5000";
//
// // let serve = {};
// // serve.mockServer1 = new Server(URL);
//
// // serve.mockServer1.on('connection', sock => {
// //
// //     eve.emit('server-connected');
// //
// //
// //     console.log('server connected');
// //
// //     eve.on('close-server', () => {
// //         console.log('closing server');
// //         sock.close();
// //     });
// //
// //     sock.on('close', () => {
// //         eve.emit('server-closed');
// //     })
// //
// //     // sock.on('message', req => {
// //     //
// //     //     let {ok, error, data} = tryParse(req);
// //     //
// //     //     let message = JSON.stringify({
// //     //         event: data.response_id,
// //     //         data: {asdf: 'zvxc'}
// //     //     });
// //     //
// //     //     setTimeout(() => {
// //     //         sock.send(message);
// //     //     }, 500)
// //     //
// //     // });
// //
// // });
//
//
// describe('reconnect', async () => {
//
//
//     it('should reconnect', async () => {
//
//         const socket = new Socket({
//             url: URL,
//             websocket: WebSocket,
//             should_console_log: true,
//             auto_reconnect: {every: 500}
//         });
//
//         const reconnect = jest.fn();
//
//         socket.open();
//
//         socket.on('connect', () => {
//             eve.emit('socket-connected');
//         });
//         //
//         // await till('socket-connected');
//         //
//         // socket.on('disconnect', () => {
//         //     eve.emit('socket-closed');
//         //     console.log('socket disconnecteddededededd')
//         // });
//         //
//         // socket.on('reconnecting', () => {
//         //     console.log('socket reconnecting');
//         //     reconnect();
//         // });
//         //
//         // delete serve.mockServer1;
//
//
//         await wait(1000);
//         // delete serve.mockServer1;
//         //
//         // expect(reconnect).toHaveBeenCalled();
//         //
//         // expect(socket._isConnected()).toBe(true);
//         //
//         // console.log('connected still?', socket._isConnected())
//
//
//         // serve.mockServer2 = new Server(URL);
//
//         // serve.mockServer2.on('connection', sock =>{
//         //     eve.emit('server-reconnected');
//         // });
//
//         // await till('server-reconnected');
//
//
//         eve.emit('destroy-server')
//
//     });
//
//
// });