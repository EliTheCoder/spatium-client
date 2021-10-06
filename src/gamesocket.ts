import EventEmitter from "eventemitter3";
import { Move } from "hika";

export default class GameSocket extends EventEmitter {
	private socket: WebSocket;
	private ping: number;
	constructor(url: string) {
		super();
		this.socket = new WebSocket(url);
		this.socket.addEventListener("open", () => {
			this.emit("open");
		});
		this.socket.addEventListener("message", event => {
			const data = JSON.parse(event.data);

			if (data.o !== "0.b") {
				console.log(
					`%c→ Received %c${data.o}%c \n%c  ${JSON.stringify(
						data.d
					)}`,
					"font-weight: bold",
					"background-color:#444",
					"background-color:inherit",
					"color:gray"
				);
			}

			if (opcodes[data.o] !== null) {
				this.emit(opcodes[data.o], data.d);
			} else {
				console.error("Unknown opcode", data.o);
			}
		});
		this.on("open", () => this.open());
		this.on(ResponseType.HANDSHAKE, data => {
			this.emit("initialize", data.data);
		});
		console.log(
			`%c↻ Connecting to server%c ${url}`,
			"font-weight: bold",
			"font-weight: inherit"
		);
	}
	send(opcode: MessageType, data?: any) {
		if (opcode !== MessageType.HEARTBEAT) {
			console.log(
				`%c← Sending %c${opcode}%c \n%c  ${JSON.stringify(data)}`,
				"font-weight: bold",
				"background-color:#444",
				"background-color:inherit",
				"color:gray"
			);
		}
		if (data === undefined) {
			this.socket.send(JSON.stringify({ o: opcode }));
		} else {
			this.socket.send(JSON.stringify({ o: opcode, d: data }));
		}
	}
	move(move: Move) {
		this.send(MessageType.MOVE, Move.serialize(move));
	}
	chat(data: { data: { message: string } }) {
		this.send(MessageType.CHAT, data);

		return new Promise(resolve => {
			this.once(ResponseType.CHAT, resolve);
		});
	}
	close() {
		this.socket.close();
	}
	resign() {
		this.send(MessageType.RESIGN);
	}
	draw() {
		this.send(MessageType.DRAW);

		return new Promise(resolve => {
			this.once(ResponseType.DRAW, resolve);
		});
	}
	undraw() {
		this.send(MessageType.UNDRAW);

		return new Promise(resolve => {
			this.once("undraw", resolve);
		});
	}
	getState() {
		this.send(MessageType.STATE);

		return new Promise(resolve => {
			this.once(ResponseType.STATE, resolve);
		});
	}
	private open() {
		this.send(MessageType.HANDSHAKE, {
			username: "EliTheCoder",
			version: "0.0.1"
		});
		setInterval(() => this.heartbeat(), 1000);
		console.log(
			"%c✓ %cConnected to server",
			"font-weight: bold; color: LimeGreen",
			"color: inherit"
		);
	}
	private heartbeat() {
		this.send(MessageType.HEARTBEAT);
		console.log("%c❤ %cSent heartbeat", "color: red", "color: gray");
	}
}

enum ResponseType {
	HEARTBEAT = "heartbeat_response",
	HANDSHAKE = "handshake_response",
	PING = "ping_response",
	MOVE = "move_response",
	STATE = "state_response",
	DRAW = "draw_response",
	UNDRAW = "undraw_response",
	CHAT = "chat_response"
}

enum EventType {
	MOVE = "move",
	DRAW = "draw",
	UNDRAW = "undraw",
	RESIGN = "resign",
	CHAT = "chat"
}

enum MessageType {
	HEARTBEAT = "0.a",
	HANDSHAKE = "1.a",
	PING = "2.a",
	MOVE = "3.a",
	STATE = "4.a",
	DRAW = "5.a",
	UNDRAW = "5.d",
	RESIGN = "6.a",
	CHAT = "7.a"
}

const opcodes = {
	"0.b": ResponseType.HEARTBEAT,
	"1.b": ResponseType.HANDSHAKE,
	"2.b": ResponseType.PING,
	"3.b": ResponseType.MOVE,
	"3.c": EventType.MOVE,
	"4.b": ResponseType.STATE,
	"5.b": ResponseType.DRAW,
	"5.c": EventType.DRAW,
	"5.d": ResponseType.UNDRAW,
	"5.f": EventType.UNDRAW,
	"6.b": EventType.RESIGN,
	"7.b": ResponseType.CHAT,
	"7.c": EventType.CHAT
};
