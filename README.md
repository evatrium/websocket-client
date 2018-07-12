<h1>IOSIO WebSocket Client</h1>

<h4>installation</h4> 
<pre>
npm i -S @iosio/websocket-client
</pre>

<br/>
or
<br/>
<br/>
<pre>
yarn add @iosio/websocket-client
</pre>

<br/>

 //emit data from client side
 socket.send('event-name', {some: 'info'}) // second param is optional
 //socket will send to server: {type: 'send', event: 'event-name', data: {some: 'info'}}
 
 //listen to events from server
 socket.on('something-from-server', (data)=>{
    console.log(data) // {some: 'info'}
 })
 //server should send: {event: 'something-from-server', data: {some: 'info'}}
 
 
 socket.request('give-me-something', {optional: 'param'}, (data)=>{
    console.log(data) //{here: 'is-something'}
 });
 // socket will send to server: {
 //       event: 'give-me-something',
 //       response_id: '@response-give-me-something-(some unique id response id)',
 //       type: 'request',
 //       data: {optional: 'param'}
 //     }
// server should use the response_id as the event to respond with: 
//      {event:'@response-give-me-something-(some unique id response id)', data: {here: 'is-something'}}
<br/>

<pre>
 
 import {Socket} from '@iosio/websocket-client'
 
 /*
    defaults
 */
 const socket = new Socket{
    websocket: undefined 
    // WebSocket required only if in testing environment. consider using mock-socket
    
    url: undefined,
    // ex: "ws://localhost:4000",
    
    websocket_options: undefined,
    // protocol stuff
    
    auto_reconnect: false,
    //if true defaults to every 2000 ms . customize by passing > {every: (number in milliseconds)}
   
    requestMapper: null, 
    // provide function to map > ({event, type, response_id, data}) => ({...}), 
   
    sendMapper: null 
    //  provide function to map > ({event, type, data}) => ({...}),
    
  
  
    should_console_log: false
    // if true will provide helpful logs
}
</pre> 