import { Move, Vec } from "hika";
import p5 from "p5";
import { board2pix } from "./board";

export default class Arrow extends Move {
	constructor(src: Vec, dst: Vec) {
		super(src, dst);
	}
	draw(p: p5, size: Vec, squareSize: number) {
		p.stroke(100, 100, 255, 200);
		p.strokeWeight(10);
		let src = board2pix(this.src, size);
		let dst = board2pix(this.dst, size);

		p.line(
			src.x + squareSize / 2,
			src.y + squareSize / 2,
			dst.x + squareSize / 2,
			dst.y + squareSize / 2
		);
	}
}
