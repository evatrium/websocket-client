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

<pre>
 
 import {Socket} from 
 
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