import EventEmitter from "eventemitter3";
import { Move } from "hika";
import io, { Socket } from "socket.io-client";

export default class GameSocket extends EventEmitter {
	private socket: Socket;
	constructor(url: string, username: string = "anon") {
		super();
		console.log("attempting socket connection");
		this.socket = io(url, {
			query: {
				username
			}
		});
		this.socket.on("connect", () => {
			this.emit("connect");
		});
		this.socket.onAny((event, ...args) => {
			console.log(
				`%c→ Received %c${event}%c \n%c  ${JSON.stringify(args[0])}`,
				"font-weight: bold",
				"background-color:#444",
				"background-color:inherit",
				"color:gray"
			);

			this.emit(event, ...args);
		});
		this.on("connect", () => this.connect());
		console.log(
			`%c↻ Connecting to server%c ${url}`,
			"font-weight: bold",
			"font-weight: inherit"
		);
	}
	send(event: MessageType, ...args: any[]) {
		console.log(
			`%c← Sending %c${event}%c \n%c  ${JSON.stringify(args[0])}`,
			"font-weight: bold",
			"background-color:#444",
			"background-color:inherit",
			"color:gray"
		);
		this.socket.emit(event, ...args);
	}
	move(move: Move, room: string) {
		this.send(MessageType.MOVE, { move: Move.serialize(move), room });
	}
	chat(data: { data: { message: string } }) {
		this.send(MessageType.CHAT, data);
	}
	close() {
		this.socket.close();
	}
	resign() {
		this.send(MessageType.RESIGN);
	}
	draw() {
		this.send(MessageType.DRAW);
	}
	undraw() {
		this.send(MessageType.UNDRAW);
	}
	getState() {
		this.send(MessageType.STATE);

		return new Promise(resolve => {
			this.once(ResponseType.STATE, data => {
				resolve(data.state);
			});
		});
	}
	private connect() {
		console.log(
			"%c✓ %cConnected to server",
			"font-weight: bold; color: LimeGreen",
			"color: inherit"
		);
	}
}

enum ResponseType {
	STATE = "state"
}

enum EventType {
	MOVE = "move",
	DRAW = "draw",
	UNDRAW = "undraw",
	RESIGN = "resign",
	CHAT = "chat"
}

enum MessageType {
	MOVE = "move",
	STATE = "state",
	DRAW = "draw",
	UNDRAW = "undraw",
	RESIGN = "resign",
	CHAT = "chat"
}
