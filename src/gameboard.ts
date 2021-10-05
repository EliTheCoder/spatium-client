import Board from "./board";
import GameSocket from "./gamesocket";
import EventEmitter from "eventemitter3";
import p5 from "p5";
import { Move } from "hika";

export default class GameBoard extends EventEmitter {
	board: Board;
	socket: GameSocket;
	status: number = 0;
	constructor(p: p5, url: string) {
		super();
		this.socket = new GameSocket(url);
		this.board;
		this.socket.on("initialize", initialState => {
			this.board = new Board(p, initialState);
			this.board.on("move", (move: Move) => {
				this.socket.move(move);
			});
			this.status = 1;
		});
		this.socket.on("move", (data: { move: string; team: number }) => {
			this.board.move(Move.deserialize(data.move));
		});
	}
	isInitialized() {
		return this.status === 1;
	}
}
