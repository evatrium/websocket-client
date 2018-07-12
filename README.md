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
 <br/>
 socket.send('event-name', {some: 'info'}) // second param is optional
 <br/>
 //socket will send to server: {type: 'send', event: 'event-name', data: {some: 'info'}}
 <br/>
 <br/>
 //listen to events from server
 <br/>
 socket.on('something-from-server', (data)=>{
 <br/>
    console.log(data) // {some: 'info'}
 <br/>
 })
 <br/>
 //server should send: {event: 'something-from-server', data: {some: 'info'}}
 <br/>
 <br/>
 
 socket.request('give-me-something', {optional: 'param'}, (data)=>{
 <br/>
    console.log(data) //{here: 'is-something'}
    <br/>
 });
 <br/>
 // socket will send to server: {
 <br/>
 //       event: 'give-me-something',
 <br/>
 //       response_id: '@response-give-me-something-(some unique id response id)',
 <br/>
 //       type: 'request',
 <br/>
 //       data: {optional: 'param'}
 <br/>
 //     }
 <br/>
// server should use the response_id as the event to respond with: 
<br/>
//      {event:'@response-give-me-something-(some unique id response id)', data: {here: 'is-something'}}
<br/>
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