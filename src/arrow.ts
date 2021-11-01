import { Move, Vec } from "hika";
import p5 from "p5";
import { board2pix } from "./board";

export default class Arrow extends Move {
	constructor(src: Vec, dst: Vec) {
		super(src, dst);
	}
	draw(p: p5, size: Vec, squareSize: number, thick: boolean = true) {
		p.noFill();
		p.stroke(128, 148, 148, 200);
		p.strokeWeight(thick ? 10 : 8);
		let src = board2pix(this.src, size, squareSize);
		let dst = board2pix(this.dst, size, squareSize);

		if (this.src.equals(this.dst)) {
			p.strokeWeight(thick ? 7 : 5);
			p.ellipse(
				src.x + squareSize / 2,
				src.y + squareSize / 2,
				squareSize / 1.25,
				squareSize / 1.25
			);
		} else {
			p.line(
				src.x + squareSize / 2,
				src.y + squareSize / 2,
				dst.x + squareSize / 2,
				dst.y + squareSize / 2
			);
			p.ellipse(
				dst.x + squareSize / 2,
				dst.y + squareSize / 2,
				squareSize / 4
			);
		}
	}
	equals(a: Arrow): boolean {
		return this.src.equals(a.src) && this.dst.equals(a.dst);
	}
}
