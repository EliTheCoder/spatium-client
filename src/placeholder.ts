import { Game, Move, Vec } from "hika";
import p5 from "p5";
import { board2pix, tileColor } from "./board";

export function drawPlaceholders(
	p: p5,
	game: Game,
	possibleMoves: Move[],
	squareSize: number
) {
	if (possibleMoves.length === 0) return;

	let images = drawImages(p, squareSize);

	for (const move of possibleMoves) {
		placeholder(p, game, move, squareSize, images);
	}
}

function placeholder(
	p: p5,
	game: Game,
	move: Move,
	squareSize: number,
	{ dot, tris }: { dot: p5.Graphics; tris: p5.Graphics }
) {
	let { x, y } = board2pix(move.dst);
	p.fill(0, 0, tileColor(move.dst) - 64);
	if (game.getPiece(move.dst) === null) {
		p.image(dot, x, y);
	} else {
		p.image(tris, x, y);
	}
}

function drawImages(p: p5, squareSize: number) {
	let dot = p.createGraphics(squareSize, squareSize);
	let tris = p.createGraphics(squareSize, squareSize);
	dot.noStroke();
	tris.noStroke();
	// p.fill(160, 255, 255, 64);
	dot.colorMode(p.HSB, 255);
	tris.colorMode(p.HSB, 255);
	dot.fill(160, 128, 255, 192);
	tris.fill(160, 128, 255, 192);
	dot.ellipse(squareSize / 2, squareSize / 2, squareSize / 4);
	tris.triangle(0, 0, squareSize / 4, 0, 0, squareSize / 4);
	tris.triangle(
		squareSize,
		0,
		squareSize - squareSize / 4,
		0,
		squareSize,
		squareSize / 4
	);
	tris.triangle(
		squareSize,
		squareSize,
		squareSize - squareSize / 4,
		squareSize,
		squareSize,
		squareSize - squareSize / 4
	);
	tris.triangle(
		0,
		squareSize,
		squareSize / 4,
		squareSize,
		0,
		squareSize - squareSize / 4
	);

	return { dot, tris };
}
