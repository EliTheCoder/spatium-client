import Board from "./board";
import GameSocket from "./gamesocket";
import EventEmitter from "eventemitter3";
import p5 from "p5";
import { Move } from "hika";

export default class GameBoard extends EventEmitter {
	board: Board;
	socket: GameSocket;
	constructor(p: p5, url: string) {
		super();
		this.socket = new GameSocket(url);
		this.board = new Board(p);
		this.socket.on("initialize", initialState => {
			this.board = new Board(p, initialState);
			this.board.on("move", (move: Move) => {
				this.socket.move(move);
			});
		});
		this.board.on("move", (move: Move) => {
			this.socket.move(move);
		});
		this.socket.on("move", (move: string) => {
			this.board.move(Move.deserialize(move));
		});
	}
}
