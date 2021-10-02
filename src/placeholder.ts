import { Game, Move, Vec } from "hika";
import p5 from "p5";
import { board2pix, tileColor } from "./board";

export function drawPlaceholders(
	p: p5,
	game: Game,
	selected: Vec | null,
	squareSize: number
) {
	if (selected === null) return;
	const moves = game.getMoves(selected);
	if (moves.length === 0) return;
	let dot = p.createGraphics(squareSize, squareSize);
	dot.noStroke();
	dot.fill(0, 0, 0, 128);
	dot.ellipse(squareSize / 2, squareSize / 2, squareSize / 4, squareSize / 4);
	for (const move of moves) {
		placeholder(p, game, move, squareSize, dot);
	}
}

function placeholder(
	p: p5,
	game: Game,
	move: Move,
	squareSize: number,
	dot: p5.Graphics
) {
	let { x, y } = board2pix(move.dst);
	p.fill(0, 0, tileColor(move.dst) - 64);
	p.image(dot, x, y, squareSize, squareSize);
}
