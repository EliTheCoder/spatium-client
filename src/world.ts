import { convertDimension } from "./sketch";
import { board, mousePressed, mouseReleased } from "./board";
import p5 from "p5";

export type Camera = { x: number; y: number; z: number; r: number };

let camera: Camera = { x: 0, y: 0, z: 1, r: 0 };
let oldX = 0;
let oldY = 0;
let dragging = false;

export function world(p: p5) {
	p.background(20);
	let [cx, cy] = convertDimension(p.mouseX, p.mouseY);
	if (dragging) {
		camera.x += (oldX - cx) / camera.z;
		camera.y += (oldY - cy) / camera.z;
	}
	oldX = cx;
	oldY = cy;
	p.scale(camera.z);
	p.translate(-camera.x, -camera.y);
	p.rotate(camera.r);
	board(p, camera);

	p.mouseWheel = (event: WheelEvent) => {
		const dz = event.deltaY / -500;
		const oldZ = camera.z;
		camera.z *= 1 + dz;
		if (camera.z <= 0.1) {
			camera.z = oldZ;
			return;
		}
		if (camera.z >= 8) {
			camera.z = oldZ;
			return;
		}
		const dx = (1 / oldZ - 1 / camera.z) * 1920;
		const dy = (1 / oldZ - 1 / camera.z) * 1080;
		const [cx, cy] = convertDimension(p.mouseX, p.mouseY);
		camera.x += dx * (cx / 1920);
		camera.y += dy * (cy / 1080);
	};

	p.mousePressed = () => {
		if (p.mouseButton === p.CENTER || p.mouseButton === p.RIGHT) {
			dragging = true;
		}
		mousePressed(p);
	};

	p.mouseReleased = () => {
		if (p.mouseButton === p.CENTER || p.mouseButton === p.RIGHT) {
			dragging = false;
		}
		mouseReleased(p);
	};
}

export function screen2world(x: number, y: number): [number, number] {
	const [ax, ay] = convertDimension(x, y);
	const [bx, by] = [ax / camera.z + camera.x, ay / camera.z + camera.y];
	let dist = Math.sqrt(bx * bx + by * by);
	let angle = Math.atan2(by, bx);
	const [cx, cy] = [
		Math.cos(angle - camera.r) * dist,
		Math.sin(angle - camera.r) * dist
	];
	return [cx, cy];
}
