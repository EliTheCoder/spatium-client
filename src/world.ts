import { convertDimension } from "./sketch";
import { board, mousePressed } from "./board";
import p5 from "p5";

export type Camera = { x: number; y: number; z: number };

let camera = { x: 0, y: 0, z: 1 };
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
		if (p.mouseButton == p.CENTER) {
			dragging = true;
		}
		mousePressed(p, camera);
	};

	p.mouseReleased = () => {
		if (p.mouseButton == p.CENTER) {
			dragging = false;
		}
	};
}
