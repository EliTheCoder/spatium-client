import Board from "./board";
import GameSocket from "./gamesocket";
import EventEmitter from "eventemitter3";
import p5 from "p5";
import { Move } from "hika";

export default class GameBoard extends EventEmitter {
	board: Board;
	socket: GameSocket;
	status: Status = 0;
	constructor(p: p5, url: string) {
		super();
		let wsUrl = new URL(url);
		console.log(wsUrl);
		if (wsUrl.port === "") wsUrl.port = "9024";
		this.socket = new GameSocket(wsUrl.toString());
		this.board;
		this.socket.on("initialize", data => {
			this.board = new Board(p, data.initialState);
			if (data.moves.length > 0) {
				for (let i of data.moves) {
					this.board.move(Move.deserialize(i));
				}
			}
			this.board.on("move", (move: Move) => {
				this.socket.move(move);
			});
			this.status = Status.PLAYING;
		});
		this.socket.on("move", (data: { move: string; team: number }) => {
			this.board.move(Move.deserialize(data.move));
		});
	}
	isInitialized() {
		return this.status === 1;
	}
}

enum Status {
	WAITING = 0,
	PLAYING = 1,
	FINISHED = 2
}
