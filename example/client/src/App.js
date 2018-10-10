import React from 'react';
import Socket from "./@iosio/websocket-client";
import {typeOf} from "@iosio/utils/lib/type_checks"

const socket = new Socket({
    websocket: WebSocket,
    websocket_options: null,
    url: "ws://" + window.location.hostname + ":4000",
    auto_reconnect: {every: 2000},
    should_console_log: true,
    sendMapper: ({event, type, data}) => ({
        event,
        data: {type, data}
    }),
    requestMapper: ({event, type, response_id, data}) => ({
        event,
        data: {type, response_id, data}
    })
});

socket.open();

// socket.on('connect', () => {
//     console.log('-------connected')
// });
//
// socket.on('disconnect', () => {
//     console.log('-------disconnect')
// });
//
// socket.on('reconnecting', () => {
//     console.log('-------reconnecting')
// });
//
// socket.on('error', () => {
//     console.log('-------error')
// });


class App extends React.Component {

    state = {
        message: '',
        response: '',
        send_response: '',
        test: ''
    };


    componentDidMount() {

        // mitt.on('test2',(data)=>{
        //     this.setState({test: data})
        // })
        socket.on('send-response', (data) => {
            console.log('hard coded response to send')
            this.setState({send_response: data})
        })

    }

    request = () => {
        socket.request('response_test', {msg: this.state.message}, (data) => {
            console.log('received response from server: ', data);
            this.setState({response: data});
        })

    };

    send = () => {
        socket.send('send-response', {msg: this.state.message});
    }

    render() {
        return (
            <div className="App">


                <button onClick={() => socket.open()}>
                    open
                </button>
                <button onClick={() => socket.close()}>
                    close
                </button>

                Message:
                <input value={this.state.value} onChange={(e) => this.setState({message: e.target.value})}/>

                <button onClick={this.send}>
                    send
                </button>

                <button onClick={this.request}>
                    request
                </button>


                <br/>
                <br/>

                Response to request: {this.state.response}
                <br/>

                Response to send: {this.state.send_response}

                <br/>
                <br/>

            </div>
        );
    }
}

export default App;
