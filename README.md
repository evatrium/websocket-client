# IOSIO WebSocket Client

#### Installation 
```sh
npm i -S @iosio/websocket-client
```
or
```sh
yarn add @iosio/websocket-client
```
#### Usage

```js


import {Socket} from '@iosio/websocket-client'

/*
   defaults
*/
const socket = new Socket({

    // WebSocket required only if in node testing environment. consider using mock-socket 
    // otherwise, no need to pass a WebSocket
    websocket: undefined,

    // ex: "ws://localhost:4000",  
    url: undefined,

    // protocol stuff 
    websocket_options: undefined,

    //if true defaults to every 2000 ms . customize by passing > {every: (number in milliseconds)}
    auto_reconnect: false,

    // provide function to map > ({event, type, response_id, data}) => ({...}),   
    requestMapper: null,

    //  provide function to map > ({event, type, data}) => ({...}),  
    sendMapper: null,

    // if true will provide helpful logs
    should_console_log: false
});

socket.on('connect', () => {
    // socket is available
});

socket.on('disconnect', () => {
    // socket has closed
});

socket.on('error', () => {
    // a socket error occurred 
});

socket.on('reconnecting', () => {
    // socket is attempting to reconnect
});

//creates connection
socket.open();

//closes socket
socket.close();

//emit data from client side
socket.send('event-name', {some: 'info'}) // second param is optional
//socket will send to server: {type: 'send', event: 'event-name', data: {some: 'info'}}
//   --- use the sendMapper to shape the object in the format that you want 


//listen to events from server 
socket.on('something-from-server', (data) => {
    console.log(data) // {some: 'info'}
});
/*
server should send in this format: 

    {
        event: 'something-from-server', //string is required
        data: {some: 'info'}
    }
    
*/


//(ex: using named function)
const myNamedEventHandler = (data) => {
    console.log(data);
};
//listen to events from server 
socket.on('some-event', myNamedEventHandler);

//optionally remove listener 
//** a named function is required in order to remove listener
socket.off('some-event', myNamedEventHandler);


//request data with automatic response handler
socket.request('give-me-something', {optional: 'param'}, (data) => {
    console.log(data) //{here: 'is-something'}
});
/*

socket will send to server:

    {
      event: 'give-me-something',
      response_id: '@response-give-me-something-(some unique id)',
      type: 'request',
      data: {optional: 'param'}
    }

  --- use the requestMapper to shape the object in the format that you want

server should use the response_id as the event to respond with: 

  {
    event:'@response-give-me-something-(some unique id)',
    data: {here: 'is-something'}
  }
  
  
*/
```