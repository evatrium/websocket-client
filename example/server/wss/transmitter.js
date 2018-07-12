
class Transmitter{
	constructor(){
		this.socket = false;
	}

	setSocket = (socket) => {
		this.socket = socket;
	};

	send = (event, data) =>{
		if(!this.socket){
			console.error('no socket available in transmitter');
			return;
		}

		this.socket.send(JSON.stringify({event, data}));
	}
}

export const transmitter = new Transmitter();