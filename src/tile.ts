import { Game, Move, Vec } from "hika";
import p5 from "p5";
import { board2pix, tileColor } from "./board";
import { Camera } from "./world";

export function tile(
	p: p5,
	pos: Vec,
	game: Game,
	selected: Vec | null,
	holding: Vec | null,
	squareSize: number,
	images: { [key: string]: p5.Image },
	lastMove: Move | null,
	camera: Camera
) {
	// Getting world pixel coordinates of the tile
	let cPos = board2pix(pos, game.getSize());

	// Drawing the tile
	p.fill(0, 0, tileColor(pos));
	p.rect(cPos.x, cPos.y, squareSize, squareSize);

	// Drawing last move indicator
	if (lastMove !== null && pos.equals(lastMove.src)) {
		p.fill(45, 192, 255, 64);
		p.rect(cPos.x, cPos.y, squareSize, squareSize);
	}
	if (lastMove !== null && pos.equals(lastMove.dst)) {
		p.fill(45, 192, 192, 64);
		p.rect(cPos.x, cPos.y, squareSize, squareSize);
	}

	// Getting the piece at the position
	let piece = game.getPiece(pos);
	if (piece === null) return;

	// Getting the "name" of the piece (e.g. "bP" for a black pawn)
	const pieceName = (piece.team ? "b" : "w") + piece.id.toUpperCase();

	// Getting the image of the piece
	let pieceImage: p5.Image;
	if (!images[pieceName]) {
		pieceImage = images[(piece.team ? "b" : "w") + "0"];
	} else pieceImage = images[pieceName];

	// Setting fill color for selected piece
	p.fill(160, 192, 255, 64);

	// Drawing selection overlay before the piece if not holding
	if (selected && pos.equals(selected) && holding === null) {
		p.rect(cPos.x, cPos.y, squareSize, squareSize);
	}

	// Drawing piece
	p.push();
	p.rotate(-camera.r);
	const [bx, by] = [cPos.x, cPos.y];
	let dist = Math.sqrt(bx * bx + by * by);
	let angle = Math.atan2(by, bx);
	const [cx, cy] = [
		Math.cos(angle + camera.r) * dist,
		Math.sin(angle + camera.r) * dist
	];

	// Don't ask me why this works, but it centers the piece on the tile
	const [dx, dy] = [
		((Math.sqrt(2) / 2) * Math.cos(camera.r + Math.PI / 4) - 0.5) *
			squareSize,
		((Math.sqrt(2) / 2) * Math.sin(camera.r + Math.PI / 4) - 0.5) *
			squareSize
	];
	p.image(pieceImage, cx + dx, cy + dy, squareSize, squareSize);
	p.pop();

	// Drawing selection overlay after the piece if holding
	if (holding && pos.equals(holding)) {
		p.rect(cPos.x, cPos.y, squareSize, squareSize);
	}
}
