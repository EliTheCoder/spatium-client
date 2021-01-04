const Chessboard = require("@chrisoakman/chessboardjs/dist/chessboard-1.0.0.min.js");

const boardConfig = {
	position: "start",
	draggable: true
};

const board = Chessboard("board", boardConfig);
