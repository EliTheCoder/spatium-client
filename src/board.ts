import p5 from "p5";
import { Game, Vec } from "./hika";
import { Camera } from "./world";
import { convertDimension } from "./sketch";

const squareSize = 50;

// let game = new Game("4,4,2,4 RNBQ,PPPP/KBNR,PPPP|||,,pppp,rnbq/,,pppp,kbnr");
let game = new Game();

let selected: null | Vec = null;

let images: { [key: string]: p5.Image } = {};
export function loadImages(p: p5) {
	let pieceNames = [
		"bB",
		"bK",
		"bN",
		"bP",
		"bQ",
		"bR",
		"b0",
		"wB",
		"wK",
		"wN",
		"wP",
		"wQ",
		"wR",
		"w0"
	];
	for (let pieceName of pieceNames) {
		images[pieceName] = p.loadImage(`./assets/cburnett/${pieceName}.png`);
	}
}

function convertBoardDimensions(pos: Vec) {
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
function convertPixelDimensions(pos: Vec) {
	const size = game.getSize();
	const nPos = new Vec(
		mod(Math.floor(pos.x / squareSize), size.x + 1),
		mod(Math.floor(pos.y / squareSize), size.y + 1),
		Math.floor(pos.x / (squareSize * size.x + squareSize)),
		Math.floor(pos.y / (squareSize * size.y + squareSize))
	);
	return new Vec(nPos.x, -nPos.y + size.y - 1, nPos.z, -nPos.w + size.w - 1);
}

const mod = (a: number, n: number) => ((a % n) + n) % n;

export function board(p: p5, camera: Camera) {
	let size = game.getSize();
	p.textAlign(p.CENTER, p.CENTER);
	p.noStroke();
	p.textSize(squareSize);
	for (let x = 0; x < size.x; x++) {
		for (let y = 0; y < size.y; y++) {
			for (let z = 0; z < size.z; z++) {
				for (let w = 0; w < size.w; w++) {
					tile(p, new Vec(x, y, z, w));
				}
			}
		}
	}
	let [mx, my] = convertDimension(p.mouseX, p.mouseY);
	let [cx, cy] = [mx / camera.z + camera.x, my / camera.z + camera.y];
	let hoverPos = convertPixelDimensions(new Vec(cx, cy));
	if (game.isInBounds(hoverPos) && game.getPiece(hoverPos) !== null) {
		let moves = game.getMoves(hoverPos);
		for (let move of moves) {
			let { x, y } = convertBoardDimensions(move.dst);
			p.fill(0, 0, 0, 100);
			p.ellipse(x + squareSize / 2, y + squareSize / 2, squareSize / 2);
		}
	}

	p.noStroke();
	p.fill(0, 0, 255, 64);
	p.rect(
		cx - mod(cx, squareSize),
		cy - mod(cy, squareSize),
		squareSize,
		squareSize,
		8
	);
}

function tile(p: p5, pos: Vec) {
	let { x, y, z, w } = pos;
	const cPos = convertBoardDimensions(pos);
	const color = (x + y + z + w) % 2;
	const hue = (w + z) % 2;
	p.fill(0, 0, (color ? 160 : 40) + (hue ? 0 : 40));
	p.rect(cPos.x, cPos.y, squareSize, squareSize, 4);
	let piece = game.getPiece(pos);
	if (piece === null) return;
	const pieceName = (piece.team ? "b" : "w") + piece.id.toUpperCase();
	let pieceImage;
	if (!images[pieceName]) {
		pieceImage = images[(piece.team ? "b" : "w") + "0"];
	} else pieceImage = images[pieceName];
	p.image(pieceImage, cPos.x, cPos.y, squareSize, squareSize);
}
