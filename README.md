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
 const socket = new Socket{
    websocket: undefined 
    //(default) provide > WebSocket only if in testing environment. consider using mock-socket
    
    url: undefined,
    //(default) ex: "ws://localhost:4000",
    
    websocket_options: null,
    // (default), protocol stuff
    
    auto_reconnect: false,
    //(default), if true defaults to every 2000 ms . customize by passing > {every: (number in milliseconds)}
   
    requestMapper: undefined, 
    // (default), provide function to map > ({event, type, response_id, data}) => ({...}), 
   
    sendMapper: undefined 
    // (default), provide function to map > ({event, type, data}) => ({...}),
  
    should_console_log: false 
    //(default), if true will provide helpful logs
}
</pre> 