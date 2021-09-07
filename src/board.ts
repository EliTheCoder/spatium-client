import p5 from "p5";
import { Game, Vec } from "./hika";
import { Camera } from "./world";
import { convertDimension } from "./sketch";

const squareSize = 50;
const boardSpacing = 100;

let game = new Game("8,8,2,2 RNBQKBNR,PPPPPPPP,8,8,8,8,pppppppp,rnbqkbnr");
console.log(game.move({ src: new Vec(4, 1), dst: new Vec(4, 2) }));

export function board(p: p5, camera: Camera) {
	let size = game.getSize();
	p.textAlign(p.CENTER, p.CENTER);
	p.noStroke();
	p.textSize(squareSize);
	for (let x = 0; x < size.x; x++) {
		for (let y = 0; y < size.y; y++) {
			for (let z = 0; z < size.z; z++) {
				for (let w = 0; w < size.w; w++) {
					const color = (x + y + z + w) % 2;
					const hue = (w + z) % 2;
					p.fill(0, 0, (color ? 160 : 40) + (hue ? 0 : 40));
					p.rect(
						x * squareSize +
							z * (size.x * squareSize + boardSpacing),
						y * squareSize +
							w * (size.y * squareSize + boardSpacing),
						squareSize,
						squareSize
					);
					let piece = game.getPiece(
						new Vec(x, -y + size.y - 1, z, -w + size.w - 1)
					);
					if (piece === null) continue;
					const pieceName = piece.team
						? piece.id.toLowerCase()
						: piece.id;
					p.fill(0, 0, (color ? 60 : 200) + (hue ? 0 : 60));
					p.text(
						pieceName,
						x * squareSize +
							z * (size.x * squareSize + boardSpacing) +
							squareSize / 2,
						y * squareSize +
							w * (size.y * squareSize + boardSpacing) +
							squareSize / 2
					);
				}
			}
		}
	}
	let [mx, my] = convertDimension(p.mouseX, p.mouseY);
	let [cx, cy] = [mx / camera.z + camera.x, my / camera.z + camera.y];
	p.noStroke();
	p.fill(0, 0, 255, 100);
	const mod = (a: number, n: number) => ((a % n) + n) % n;
	p.rect(cx - mod(cx, squareSize), cy - mod(cy, squareSize), squareSize, squareSize, 8);
}
