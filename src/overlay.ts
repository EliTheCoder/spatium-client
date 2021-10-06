import { Vec } from "hika";
import p5 from "p5";
import { pix2board } from "./board";
import World, { screen2world } from "./world";

let frameRate = 0;

export function overlay(p: p5, world: World) {
	p.push();
	if (p.frameCount % 10 == 0 || p.frameRate() < 30)
		frameRate = Math.round(p.frameRate() * 100) / 100;
	p.textAlign(p.LEFT, p.TOP);
	p.textSize(32);
	p.fill(0, 0, 255, 255);
	p.text(`FPS: ${frameRate}`, 20, 20);
	let mouse = screen2world(p.mouseX, p.mouseY, world.getCamera());
	p.text(`Mouse: ${Math.floor(mouse.x)}, ${Math.floor(mouse.y)}`, 20, 50);
	let worldCoords: Vec;
	for (let board of world.getBoards()) {
		if (board.board === undefined) continue;
		let boardCoords = pix2board(
			mouse.add(board.board.getOriginPoint().scale(-1)),
			board.board.getGame().getSize()
		);
		if (board.board.getGame().isInBounds(boardCoords))
			worldCoords = boardCoords;
	}

	if (worldCoords !== undefined)
		p.text(
			`World: ${Math.floor(worldCoords.x)}, ${Math.floor(
				worldCoords.y
			)}, ${Math.floor(worldCoords.z)}, ${Math.floor(worldCoords.w)}`,
			20,
			80
		);
	p.pop();
}
