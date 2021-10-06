import p5 from "p5";
import { Game, Move, Vec } from "hika";
import { Camera, screen2world } from "./world";
import { drawPlaceholders } from "./placeholder";
import { tile } from "./tile";
import EventEmitter from "eventemitter3";

const squareSize = 50;

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
export function board2pix(pos: Vec, size: Vec) {
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
export function pix2board(pos: Vec, size: Vec) {
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

function getVecIndex(vec: Vec, i: number, j: number, k: number) {
	return vec.x + vec.y * i + vec.z * i * j + vec.w * i * j * k;
}

function movesEqual(a: Move, b: Move) {
	return a.src.equals(b.src) && a.dst.equals(b.dst);
}

export default class Board extends EventEmitter {
	game: Game;
	private originPoint: Vec;
	private selected: null | Vec = null;
	private oldSelected: null | Vec = null;
	private preSelected: boolean = false;
	private holding: null | Vec = null;
	private possibleMoves: Move[] = [];
	private lastMove: Move | null = null;
	private possibleMovesCache = new Map<number, Move[]>();
	private p: p5;
	constructor(p: p5, originPoint: Vec = new Vec(), initialState?: string) {
		super();
		if (initialState == null) {
			this.game = new Game();
		} else {
			this.game = new Game(initialState);
		}
		this.p = p;
		this.originPoint = originPoint;
	}
	move(move: Move) {
		this.game.move(move);
		this.lastMove = move;
		this.possibleMovesCache = new Map<number, Move[]>();
		this.emit(BoardEvent.MOVE, move);
	}
	updatePossibleMoves() {
		if (this.selected === null) this.possibleMoves = [];
		else {
			if (
				this.oldSelected !== null &&
				this.selected.equals(this.oldSelected)
			)
				return;
			let { x, y, z } = this.game.getSize();
			if (
				this.possibleMovesCache.has(getVecIndex(this.selected, x, y, z))
			) {
				this.possibleMoves = this.possibleMovesCache.get(
					getVecIndex(this.selected, x, y, z)
				);
			} else {
				this.possibleMoves = this.game.getMoves(this.selected);
				this.possibleMovesCache.set(
					getVecIndex(this.selected, x, y, z),
					this.possibleMoves
				);
			}
		}
		this.oldSelected = this.selected;
	}
	draw(camera: Camera) {
		if (this.game === null) return;

		let size = this.game.getSize();
		this.p.noStroke();

		// Drawing tile for each board square
		for (let x = 0; x < size.x; x++) {
			for (let y = 0; y < size.y; y++) {
				for (let z = 0; z < size.z; z++) {
					for (let w = 0; w < size.w; w++) {
						tile(
							this.p,
							new Vec(x, y, z, w),
							this.game,
							this.selected,
							this.holding,
							squareSize,
							images,
							this.lastMove,
							camera,
							this.originPoint
						);
					}
				}
			}
		}

		// Get world coordinates of the mouse
		let worldVec = screen2world(this.p.mouseX, this.p.mouseY, camera);
		const [cx, cy] = [worldVec.x, worldVec.y];

		// Drawing highlight under the mouse
		this.p.noStroke();
		this.p.fill(0, 0, 255, 64);
		this.p.rect(
			cx - mod(cx, squareSize),
			cy - mod(cy, squareSize),
			squareSize,
			squareSize,
			4
		);

		// Drawing dots for each possible move
		drawPlaceholders(
			this.p,
			this.game,
			this.possibleMoves,
			squareSize,
			this.originPoint
		);

		// Drawing the currently held piece under mouse
		let heldPiecePos = new Vec(cx - squareSize / 2, cy - squareSize / 2);
		if (
			this.holding !== null &&
			this.game.getPiece(this.holding) !== null
		) {
			let piece = this.game.getPiece(this.holding);
			const pieceName = (piece.team ? "b" : "w") + piece.id.toUpperCase();
			let pieceImage: p5.Image;
			if (!images[pieceName]) {
				pieceImage = images[(piece.team ? "b" : "w") + "0"];
			} else pieceImage = images[pieceName];

			this.p.push();
			this.p.rotate(-camera.r);
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
			this.p.image(pieceImage, cx + dx, cy + dy, squareSize, squareSize);
			this.p.pop();
		}
	}
	mousePressed(p: p5, event: MouseEvent, camera: Camera) {
		if (event.button !== 0) return;
		const worldVec = screen2world(p.mouseX, p.mouseY, camera).add(
			this.originPoint.scale(-1)
		);
		let pos = pix2board(worldVec, this.game.getSize());
		if (!this.game.isInBounds(pos)) {
			this.selected = null;
			this.holding = null;
			this.updatePossibleMoves();
			return;
		}
		if (
			this.game.getPiece(pos) !== null &&
			(this.selected !== null
				? this.game.getPiece(pos).team ===
				  this.game.getPiece(this.selected).team
				: true)
		) {
			this.holding = pos;
			this.preSelected = true;
			if (this.selected && this.selected.equals(pos))
				this.preSelected = false;
			if (this.selected === null || !this.selected.equals(pos)) {
				this.selected = pos;
				this.updatePossibleMoves();
			}
		} else if (
			this.selected !== null &&
			this.game.getMoves(this.selected).some(move => move.dst.equals(pos))
		) {
			this.move(new Move(this.selected, pos));
			this.selected = null;
		} else {
			this.selected = null;
		}
	}
	mouseReleased(p: p5, event: MouseEvent, camera: Camera) {
		if (event.button !== 0) return;
		const worldVec = screen2world(p.mouseX, p.mouseY, camera).add(
			this.originPoint.scale(-1)
		);
		let pos = pix2board(worldVec, this.game.getSize());
		if (!this.game.isInBounds(pos)) {
			this.holding = null;
			this.selected = null;
			this.updatePossibleMoves();
			return;
		}
		if (this.selected && this.selected.equals(pos) && !this.preSelected) {
			this.selected = null;
		}
		if (
			this.holding &&
			this.game.getMoves(this.holding).some(move => move.dst.equals(pos))
		) {
			this.move(new Move(this.holding, pos));
			this.holding = null;
			this.selected = null;
		}
		this.holding = null;
		this.updatePossibleMoves();
	}
}

export enum BoardEvent {
	MOVE = "move"
}
