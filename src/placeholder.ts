import { Game, Move, Vec } from "hika";
import p5 from "p5";
import { board2pix, tileColor } from "./board";

export function drawPlaceholders(
	p: p5,
	game: Game,
	possibleMoves: Move[],
	squareSize: number,
	originPoint: Vec
) {
	if (possibleMoves.length === 0) return;

	for (const move of possibleMoves) {
		placeholder(p, game, move, squareSize, originPoint);
	}
}

function placeholder(
	p: p5,
	game: Game,
	move: Move,
	squareSize: number,
	originPoint: Vec
) {
	let { x, y } = board2pix(move.dst, game.getSize(), squareSize);
	p.fill(160, 192, 128, 192);
	p.stroke(0, 0, 255, 192);
	p.strokeWeight(2);
	if (game.getPiece(move.dst) === null) {
		p.ellipse(
			x + squareSize / 2 + originPoint.x,
			y + squareSize / 2 + originPoint.y,
			squareSize / 4,
			squareSize / 4
		);
	} else {
		p.push();
		p.translate(x + originPoint.x, y + originPoint.y);
		p.triangle(0, 0, squareSize / 4, 0, 0, squareSize / 4);
		p.triangle(
			squareSize,
			0,
			squareSize - squareSize / 4,
			0,
			squareSize,
			squareSize / 4
		);
		p.triangle(
			squareSize,
			squareSize,
			squareSize - squareSize / 4,
			squareSize,
			squareSize,
			squareSize - squareSize / 4
		);
		p.triangle(
			0,
			squareSize,
			squareSize / 4,
			squareSize,
			0,
			squareSize - squareSize / 4
		);
		p.pop();
	}
}
