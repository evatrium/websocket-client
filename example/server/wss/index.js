import WebSocket from 'ws';
import express from 'express';
import {createServer} from 'http';

export const wss = (onConnection, port_) => {
    let app = express();
    let server = createServer(app);
    let port = port_ || process.env.PORT || 4000;

    const wss = new WebSocket.Server({server});
    server.listen(port, () => {
        console.log('Server listening at port %d', port);
        wss.on('connection', (socket) => {
            console.log('socket connected')
            onConnection && onConnection(socket)
        });
    });
};


