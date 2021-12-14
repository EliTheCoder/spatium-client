import Board from "./board";
import GameSocket from "./gamesocket";
import EventEmitter from "eventemitter3";
import p5 from "p5";
import { Move, Vec } from "hika";

export default class GameBoard extends EventEmitter {
	board: Board;
	gameSocket: GameSocket;
	id: string;
	status: Status = 0;
	constructor(p: p5, url: string, originPoint: Vec = new Vec()) {
		super();
		let wsUrl = new URL(url);
		if (!wsUrl.port) wsUrl.port = "9024";
		this.gameSocket = new GameSocket(wsUrl.toString());
		this.gameSocket.on("state", data => {
			this.board = new Board(p, originPoint, data.initialState);
			if (data.moveHistory.length > 0) {
				for (let i of data.moveHistory) {
					this.board.move(Move.deserialize(i));
				}
			}
			this.board.on("move", (move: Move) => {
				this.gameSocket.move(move, this.id);
			});
			this.status = Status.PLAYING;
			this.emit("initialize");
		});
		this.gameSocket.on("move", (data: { move: string; team: number }) => {
			this.board.move(Move.deserialize(data.move));
		});
	}
	isInitialized() {
		return this.status === Status.PLAYING;
	}
}

enum Status {
	WAITING = 0,
	PLAYING = 1,
	FINISHED = 2
}
