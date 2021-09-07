import p5 from "p5";

const squareSize = 50;
const boardSpacing = 100;

export function board(p: p5) {
	const boardSize = {x: 8, y: 8, z: 8, w: 8};
	p.noStroke();
	for (let x = 0; x < boardSize.x; x++) {
		for (let y = 0; y < boardSize.y; y++) {
			for (let z = 0; z < boardSize.z; z++) {
				for (let w = 0; w < boardSize.w; w++) {
					let color = (x + y + z + w) % 2 ? 200 : 100;
					p.fill(color, 0, color);
					p.rect(x * squareSize + z * (boardSize.x * squareSize + boardSpacing), y * squareSize + w * (boardSize.y * squareSize + boardSpacing), squareSize, squareSize);
				}
			}
		}
	}
}