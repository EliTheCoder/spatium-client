import EventEmitter from "eventemitter3";
import { Vec } from "hika";
import p5 from "p5";
import { loadImages } from "./board";
import CommandLine from "./commandline";
import { overlay } from "./overlay";
import World from "./world";

let width = 1920;
let height = 1080;

let world: World | null = null;
let commandline: CommandLine | null = null;

export function canvasSize(w: number, h: number) {
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

export function real2screen(vec: Vec) {
	let { x, y } = vec;
	return new Vec((x / width) * 1920, (y / height) * 1080);
}

export class Sketch extends EventEmitter {
	private p: p5;
	constructor(p: p5) {
		super();
		this.p = p;
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
			commandline = new CommandLine(p, world);
		};

		p.draw = () => {
			p.scale(p.width / 1920, p.height / 1080);
			world.draw();
			overlay(p, world);
			commandline.draw();
		};

		p.touchStarted = (event: MouseEvent) => {
			world.touchStarted(event);
			if (
				commandline.isInBounds(
					real2screen(new Vec(p.mouseX, p.mouseY))
				) ||
				commandline.isSelected()
			) {
				commandline.toggleSelected();
			}
		};

		p.touchEnded = (event: MouseEvent) => {
			world.touchEnded(event);
		};

		(p.keyPressed as (event: KeyboardEvent) => void) = (
			event: KeyboardEvent
		) => {
			world.keyPressed();
			if (commandline.isSelected()) {
				commandline.type(event);
			}
		};
	}
}
