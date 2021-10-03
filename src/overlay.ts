import p5 from "p5";

let frameRate = 0;

export function overlay(p: p5) {
	p.push();
	if (p.frameCount % 10 == 0 || p.frameRate() < 30)
		frameRate = Math.round(p.frameRate() * 100) / 100;
	p.textAlign(p.LEFT, p.TOP);
	p.textSize(32);
	p.fill(0, 0, 255, 255);
	p.text(`FPS: ${frameRate}`, 20, 20);
	p.pop();
}
