import p5 from "p5";
import { loadImages } from "./board";
import { overlay } from "./overlay";
import World from "./world";

let width = 1920;
let height = 1080;

let world: World | null = null;

export function sketch(p: p5) {
	function canvasSize(w: number, h: number) {
		let aw = w / 16;
		let ah = h / 9;
		let diff = aw - ah;
		if (diff > 0) {
			w = (h * 16) / 9;
		} else {
			h = (w * 9) / 16;
		}
		return [w, h];
	}

	p.windowResized = () => {
		let [w, h] = canvasSize(window.innerWidth, window.innerHeight);
		[width, height] = [w, h];
		p.resizeCanvas(w, h);
	};

	p.preload = () => {
		loadImages(p);
	};

	p.setup = () => {
		let [w, h] = canvasSize(window.innerWidth, window.innerHeight);
		p.createCanvas(w, h);
		[width, height] = [w, h];
		p.colorMode(p.HSB, 255);
		p.frameRate(120);
		p.noStroke();
		p.rectMode(p.CORNER);
		p.ellipseMode(p.CENTER);
		p.smooth();
		world = new World(p);
	};

	p.draw = () => {
		p.scale(p.width / 1920, p.height / 1080);
		world.draw();
		overlay(p);
	};
}

export function convertDimension(x: number, y: number) {
	return [(x / width) * 1920, (y / height) * 1080];
}
