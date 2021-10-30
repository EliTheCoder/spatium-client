import { convertDimension } from "./sketch";
import p5 from "p5";
import GameBoard from "./gameboard";
import EventEmitter from "eventemitter3";
import { Vec } from "hika";

export type Camera = { x: number; y: number; z: number; r: number };

export default class World extends EventEmitter {
	private p: p5;
	private camera: Camera = { x: 0, y: 0, z: 1, r: 0 };
	private oldX = 0;
	private oldY = 0;
	private dragging = false;
	private trackpad = false;
	private boards: GameBoard[] = [];
	constructor(p: p5) {
		super();
		this.p = p;
		let wsUrl = new URL(window.location.href).searchParams.get("url");
		let wsUrlString = wsUrl != null ? wsUrl : "wss://spatiumchess.app";
		// this.boards.push(new GameBoard(this.p, wsUrlString));
	}
	draw() {
		this.p.push();
		this.p.background(20);
		let [cx, cy] = convertDimension(this.p.mouseX, this.p.mouseY);
		if (this.dragging) {
			this.camera.x += (this.oldX - cx) / this.camera.z;
			this.camera.y += (this.oldY - cy) / this.camera.z;
		}
		this.oldX = cx;
		this.oldY = cy;
		this.p.scale(this.camera.z);
		this.p.translate(-this.camera.x, -this.camera.y);
		this.p.rotate(this.camera.r);
		for (let gameBoard of this.boards) {
			if (gameBoard.isInitialized()) gameBoard.board.draw(this.camera);
		}

		this.p.mouseWheel = (event: WheelEvent) => {
			const dz = event.deltaY / -500;
			const oldZ = this.camera.z;
			if (!this.trackpad || event.ctrlKey) this.camera.z *= 1 + dz;
			if (this.trackpad && !this.p.keyIsDown(this.p.CONTROL)) {
				this.camera.x += (event.deltaX / this.camera.z) * 2;
				this.camera.y += (event.deltaY / this.camera.z) * 2;
				return;
			}
			if (this.camera.z <= 0.1) {
				this.camera.z = oldZ;
				return;
			}
			if (this.camera.z >= 8) {
				this.camera.z = oldZ;
				return;
			}
			const dx = (1 / oldZ - 1 / this.camera.z) * 1920;
			const dy = (1 / oldZ - 1 / this.camera.z) * 1080;
			const [cx, cy] = convertDimension(this.p.mouseX, this.p.mouseY);
			this.camera.x += dx * (cx / 1920);
			this.camera.y += dy * (cy / 1080);
		};

		this.p.pop();
	}
	addBoard(url: string) {
		this.boards.push(new GameBoard(this.p, url));
	}
	getCamera() {
		return this.camera;
	}
	getBoards() {
		return this.boards;
	}
	toggleTrackpad() {
		return (this.trackpad = !this.trackpad);
	}
	getTrackpad() {
		return this.trackpad;
	}
	touchStarted(event: MouseEvent) {
		if (this.p.mouseButton === this.p.CENTER) {
			this.dragging = true;
		}
		for (let gameBoard of this.boards) {
			if (gameBoard.isInitialized())
				gameBoard.board.mousePressed(this.p, event, this.camera);
		}
		return false;
	}

	touchEnded(event: MouseEvent) {
		if (this.p.mouseButton === this.p.CENTER) {
			this.dragging = false;
		}
		for (let gameBoard of this.boards) {
			if (gameBoard.isInitialized())
				gameBoard.board.mouseReleased(this.p, event, this.camera);
		}
		return false;
	}
	keyPressed() {
		if (this.p.keyCode === this.p.LEFT_ARROW) {
			this.camera.r += Math.PI / 6;
		}
		if (this.p.keyCode === this.p.RIGHT_ARROW) {
			this.camera.r -= Math.PI / 6;
		}
		if (this.p.keyCode === this.p.ALT) {
			this.toggleTrackpad();
		}
	}
}

export function screen2world(x: number, y: number, camera: Camera): Vec {
	const [ax, ay] = convertDimension(x, y);
	const [bx, by] = [ax / camera.z + camera.x, ay / camera.z + camera.y];
	let dist = Math.sqrt(bx * bx + by * by);
	let angle = Math.atan2(by, bx);
	const [cx, cy] = [
		Math.cos(angle - camera.r) * dist,
		Math.sin(angle - camera.r) * dist
	];
	return new Vec(cx, cy);
}
