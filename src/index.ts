import p5 from "p5";
import { Sketch } from "./sketch";

new p5(p => new Sketch(p), document.getElementById("canvas") as HTMLElement);
