import { Game, Vec } from "hika";
import p5 from "p5";
import { board2pix, tileColor } from "./board";

export function tile(
	p: p5,
	pos: Vec,
	game: Game,
	selected: Vec | null,
	holding: Vec | null,
	squareSize: number,
	images: { [key: string]: p5.Image }
) {
	// Getting world pixel coordinates of the tile
	let cPos = board2pix(pos);

	// Drawing the tile
	p.fill(0, 0, tileColor(pos));
	p.rect(cPos.x, cPos.y, squareSize, squareSize);

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
	p.fill(160, 255, 255, 64);

	// Drawing selection overlay before the piece if not holding
	if (selected && pos.equals(selected) && holding === null) {
		p.rect(cPos.x, cPos.y, squareSize, squareSize);
	}

	// Drawing piece
	p.image(pieceImage, cPos.x, cPos.y, squareSize, squareSize);

	// Drawing selection overlay after the piece if holding
	if (holding && pos.equals(holding)) {
		p.rect(cPos.x, cPos.y, squareSize, squareSize);
	}
}
