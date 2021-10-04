import p5 from "p5";
import { Game, Move, Vec } from "hika";
import { Camera, screen2world } from "./world";
import { drawPlaceholders } from "./placeholder";
import { tile } from "./tile";

const squareSize = 50;

// Creating the game board
let game = new Game("4,4,2,4 RNBQ,PPPP/KBNR,PPPP|||,,pppp,rnbq/,,pppp,kbnr");

// Creating variables for movement
let selected: null | Vec = null;
let oldSelected: null | Vec = null;
let preSelected: boolean = false;
let holding: null | Vec = null;
let possibleMoves: Move[] = [];
let lastMove: Move | null = null;
let possibleMovesCache = new Map<number, Move[]>();

// Loading images for the pieces
let images: { [key: string]: p5.Image } = {};
export function loadImages(p: p5) {
	let imageFiles: string[] = [].slice
		.call(document.getElementsByTagName("img"))
		.map((a: HTMLImageElement) => a.src);
	for (let imagePath of imageFiles) {
		const pieceName = imagePath.split("/").slice(-1).join("").split(".")[0];
		images[pieceName] = p.loadImage(imagePath);
	}
}

// Function that takes board coordinates and returns pixel coordinates
export function board2pix(pos: Vec) {
	const size = game.getSize();
	const nPos = new Vec(
		pos.x,
		-pos.y + size.y - 1,
		pos.z,
		-pos.w + size.w - 1
	);
	return new Vec(
		nPos.x * squareSize + nPos.z * (size.x * squareSize + squareSize),
		nPos.y * squareSize + nPos.w * (size.y * squareSize + squareSize)
	);
}

// Function that takes pixel coordinates and returns board coordinates
export function pix2board(pos: Vec) {
	const size = game.getSize();
	const nPos = new Vec(
		mod(Math.floor(pos.x / squareSize), size.x + 1),
		mod(Math.floor(pos.y / squareSize), size.y + 1),
		Math.floor(pos.x / (squareSize * size.x + squareSize)),
		Math.floor(pos.y / (squareSize * size.y + squareSize))
	);
	return new Vec(nPos.x, -nPos.y + size.y - 1, nPos.z, -nPos.w + size.w - 1);
}

// Modulo function
const mod = (a: number, n: number) => ((a % n) + n) % n;

// Function that draws the board
export function board(p: p5, camera: Camera) {
	let size = game.getSize();
	p.noStroke();

	// Drawing tile for each board square
	for (let x = 0; x < size.x; x++) {
		for (let y = 0; y < size.y; y++) {
			for (let z = 0; z < size.z; z++) {
				for (let w = 0; w < size.w; w++) {
					tile(
						p,
						new Vec(x, y, z, w),
						game,
						selected,
						holding,
						squareSize,
						images,
						lastMove,
						camera
					);
				}
			}
		}
	}

	// Get world coordinates of the mouse
	const [cx, cy] = screen2world(p.mouseX, p.mouseY);

	// Drawing highlight under the mouse
	p.noStroke();
	p.fill(0, 0, 255, 64);
	p.rect(
		cx - mod(cx, squareSize),
		cy - mod(cy, squareSize),
		squareSize,
		squareSize,
		4
	);

	// Drawing dots for each possible move
	drawPlaceholders(p, game, possibleMoves, squareSize);

	// Drawing the currently held piece under mouse
	let heldPiecePos = new Vec(cx - squareSize / 2, cy - squareSize / 2);
	if (holding !== null && game.getPiece(holding) !== null) {
		let piece = game.getPiece(holding);
		const pieceName = (piece.team ? "b" : "w") + piece.id.toUpperCase();
		let pieceImage: p5.Image;
		if (!images[pieceName]) {
			pieceImage = images[(piece.team ? "b" : "w") + "0"];
		} else pieceImage = images[pieceName];

		p.push();
		p.rotate(-camera.r);
		const [bx, by] = [heldPiecePos.x, heldPiecePos.y];
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
	}
}

export function pieceImage(pos: Vec, game: Game) {
	let piece = game.getPiece(pos);
	if (piece === null) return null;
	let pieceName = (piece.team ? "b" : "w") + piece.id.toUpperCase();
	if (!images[pieceName]) {
		pieceName = (piece.team ? "b" : "w") + "0";
	}
	return images[pieceName];
}

export function tileColor(pos: Vec) {
	let { x, y, z, w } = pos;
	const color = (x + y + z + w) % 2;
	const hue = (w + z) % 2;
	return (color ? 160 : 40) + (hue ? 0 : 40);
}

export function mousePressed(p: p5, event: MouseEvent) {
	if (event.button !== 0) return;
	const [cx, cy] = screen2world(p.mouseX, p.mouseY);
	let pos = pix2board(new Vec(cx, cy));
	if (!game.isInBounds(pos)) {
		selected = null;
		holding = null;
		updatePossibleMoves();
		return;
	}
	if (
		game.getPiece(pos) !== null &&
		(selected !== null
			? game.getPiece(pos).team === game.getPiece(selected).team
			: true)
	) {
		holding = pos;
		preSelected = true;
		if (selected && selected.equals(pos)) preSelected = false;
		if (!selected || !selected.equals(pos)) {
			selected = pos;
		}
	} else if (
		selected !== null &&
		game.getMoves(selected).some(move => move.dst.equals(pos))
	) {
		game.move(new Move(selected, pos));
		possibleMovesCache = new Map<number, Move[]>();
		lastMove = new Move(selected, pos);
		selected = null;
	} else {
		selected = null;
	}
	updatePossibleMoves();
}

export function mouseReleased(p: p5, event: MouseEvent) {
	if (event.button !== 0) return;
	const [cx, cy] = screen2world(p.mouseX, p.mouseY);
	let pos = pix2board(new Vec(cx, cy));
	if (!game.isInBounds(pos)) {
		holding = null;
		selected = null;
		updatePossibleMoves();
		return;
	}
	if (selected && selected.equals(pos) && !preSelected) {
		selected = null;
	}
	if (holding && game.getMoves(holding).some(move => move.dst.equals(pos))) {
		game.move(new Move(holding, pos));
		possibleMovesCache = new Map<number, Move[]>();
		lastMove = new Move(holding, pos);
		holding = null;
		selected = null;
	}
	holding = null;
	updatePossibleMoves();
}

function updatePossibleMoves() {
	if (selected === null) possibleMoves = [];
	else {
		if (oldSelected !== null && selected.equals(oldSelected)) return;
		let { x, y, z } = game.getSize();
		if (possibleMovesCache.has(getVecIndex(selected, x, y, z))) {
			possibleMoves = possibleMovesCache.get(
				getVecIndex(selected, x, y, z)
			);
		} else {
			possibleMoves = game.getMoves(selected);
			possibleMovesCache.set(
				getVecIndex(selected, x, y, z),
				possibleMoves
			);
		}
	}
	oldSelected = selected;
}

function getVecIndex(vec: Vec, i: number, j: number, k: number) {
	return vec.x + vec.y * i + vec.z * i * j + vec.w * i * j * k;
}

function movesEqual(a: Move, b: Move) {
	return a.src.equals(b.src) && a.dst.equals(b.dst);
}
