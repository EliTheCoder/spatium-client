import { Move, Vec } from "hika";
import p5 from "p5";

export default class Arrow extends Move {
	constructor(src: Vec, dst: Vec) {
		super(src, dst);
	}
	draw(p: p5) {
		p.line(this.src.x, this.src.y, this.dst.x, this.dst.y);
	}
}
