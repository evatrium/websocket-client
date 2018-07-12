import {wss} from "./wss";


import {Crud} from "./database";



import {router} from "./router";

let items = new Crud({name: 'items'});


const routes = {
    response_test: {
        controller: (req, res) =>{
            console.log('request received: ', req);
            res('server responding to request:' + JSON.stringify(req.data))
        }
    },
    'send-response': {
        controller: (req, res)=>{
            res('server responding to send: ' + JSON.stringify(req.data));
        },
        respond_to:'send-response'
    }
};


wss((socket) => {



    socket.on('message', (message) => {
        console.log('message received', message);
        router(socket, routes, message)
    });

    socket.on('close', () => {
        console.log('socket disconnected');
    })


});

