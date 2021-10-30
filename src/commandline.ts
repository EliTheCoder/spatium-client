import EventEmitter from "eventemitter3";
import { Move, Vec } from "hika";
import p5 from "p5";
import * as Commands from "./commands";
import World from "./world";

export default class CommandLine extends EventEmitter {
	private readonly p: p5;
	private selected: boolean = false;
	private size: Vec;
	private pos: Vec;
	private text: string = "";
	private dispatcher: CommandDispatcher;
	private cursor: Cursor;
	private messageBox: MessageBox | null = null;
	constructor(
		p: p5,
		world: World,
		pos: Vec = new Vec(1920 / 2 - 720 / 2, 1080 - 120),
		size: Vec = new Vec(720, 60)
	) {
		super();
		this.p = p;
		this.pos = pos;
		this.size = size;
		this.cursor = new Cursor(this.p);
		this.messageBox = new MessageBox(
			this.p,
			this.pos.add(new Vec(0, -100)),
			this.size
		);
		this.dispatcher = new CommandDispatcher(world, this.messageBox);
	}
	draw() {
		this.p.push();
		this.p.fill(this.selected ? 80 : 60);
		this.p.stroke(this.selected ? 255 : 200);
		this.p.strokeWeight(2);
		this.p.textSize(20);
		this.p.rect(this.pos.x, this.pos.y, this.size.x, this.size.y, 10);
		this.p.pop();
		this.drawText();
		this.messageBox.draw();
	}
	private drawText() {
		this.p.push();
		this.p.fill(this.text ? 255 : 100);
		this.p.noStroke();
		this.p.textSize(20);
		this.p.textFont("monospace");
		this.p.text(
			this.selected ? this.text : this.text || "Type a command",
			this.pos.x + 20,
			this.pos.y + 35
		);
		this.p.pop();
		if (this.selected) {
			let cursorPos = new Vec(this.pos.x + 20, this.pos.y + 35);
			this.cursor.draw(cursorPos, this.text);
		}
	}
	select() {
		this.selected = true;
	}
	deselect() {
		this.selected = false;
	}
	toggleSelected() {
		return (this.selected = !this.selected);
	}
	isSelected() {
		return this.selected;
	}
	isInBounds(pos: Vec) {
		return (
			pos.x > this.pos.x &&
			pos.x < this.pos.x + this.size.x &&
			pos.y > this.pos.y &&
			pos.y < this.pos.y + this.size.y
		);
	}
	type(event: KeyboardEvent) {
		if (event.key === "Backspace") {
			this.text = this.text.slice(0, -1);
			this.cursor.moveLeft();
		} else if (event.key === "Enter") {
			this.run();
			this.cursor.reset();
		} else if (event.key.length === 1 && event.key.match(/[\x20-\x7F]/)) {
			this.text += event.key.toUpperCase();
			this.cursor.moveRight();
		}
	}
	run(command: string = this.text) {
		let commandParts = command.toLowerCase().split(" ");
		let id = commandParts[0];
		let args = commandParts.slice(1);
		this.text = "";
		console.log("Dispatching command: " + id);
		return this.dispatcher.run(id, args);
	}
}

export class CommandDispatcher extends EventEmitter {
	private commands: Map<string, Command> = new Map<string, Command>();
	private aliases: Map<string, string> = new Map<string, string>();
	private commandDataProvider: Map<string, any> = new Map<string, any>();
	constructor(world: World, messageBox: MessageBox) {
		super();
		this.commandDataProvider.set("world", world);
		this.commandDataProvider.set("messageBox", messageBox);
		this.register(new Commands.ConnectCommand());
		this.register(new Commands.MoveCommand());
		this.register(new Commands.MessageCommand());
	}
	register(command: Command): boolean {
		if (this.commands.has(command.id)) return false;
		else {
			this.commands.set(command.id, command);
			return true;
		}
	}
	run(id: string, args: string[]): Promise<boolean> {
		id = id.toLowerCase();
		if (this.commands.has(id)) {
			return this.commands.get(id).run(args, this.commandDataProvider);
		} else if (this.aliases.has(id)) {
			return this.commands
				.get(this.aliases.get(id))
				.run(args, this.commandDataProvider);
		} else {
			return new Promise((resolve, reject) => resolve(false));
		}
	}
	has(id: string): boolean {
		return this.commands.has(id);
	}
	registerAlias(alias: string, id: string): boolean {
		if (this.aliases.has(alias)) return false;
		else {
			this.aliases.set(alias, id);
			return true;
		}
	}
}

export interface Command {
	id: string;
	run(
		args: string[],
		commandDataProvider: Map<string, any>
	): Promise<boolean>;
}

class Cursor {
	private readonly p: p5;
	private pos: Vec;
	constructor(p: p5, pos: Vec = new Vec()) {
		this.p = p;
		this.pos = pos;
	}
	draw(originPoint: Vec, text: string) {
		this.p.push();
		this.p.fill(255);
		this.p.stroke(255);
		this.p.strokeWeight(2);
		this.p.textSize(20);
		this.p.textFont("monospace");
		this.p.text(
			"_",
			originPoint.x + this.p.textWidth(text.slice(0, this.pos.x)),
			originPoint.y + this.pos.y * 20
		);
		this.p.pop();
	}
	moveLeft() {
		if (this.pos.x > 0) {
			this.pos.x--;
		}
	}
	moveRight() {
		this.pos.x++;
	}
	reset() {
		this.pos = new Vec();
	}
}

export enum MessageStatus {
	ERROR = 0,
	SUCCESS = 1,
	INFO = 2
}

export class MessageBox {
	private readonly p: p5;
	private pos: Vec;
	private size: Vec;
	private messages: Message[] = [];
	constructor(p: p5, pos: Vec, size: Vec) {
		this.p = p;
		this.pos = pos;
		this.size = size;
	}
	draw() {
		if (this.messages.length === 0) return;
		this.p.push();
		this.p.colorMode(this.p.HSB, 255);
		let fillColor: p5.Color;
		let strokeColor: p5.Color;
		switch (this.messages[0].getStatus()) {
			case MessageStatus.ERROR:
				fillColor = this.p.color(0, 100, 150);
				strokeColor = this.p.color(0, 100, 100);
				break;
			case MessageStatus.SUCCESS:
				fillColor = this.p.color(100, 100, 150);
				strokeColor = this.p.color(100, 100, 100);
				break;
			case MessageStatus.INFO:
				fillColor = this.p.color(150, 20, 150);
				strokeColor = this.p.color(150, 20, 100);
		}
		this.p.fill(fillColor);
		this.p.stroke(strokeColor);
		this.p.strokeWeight(4);
		this.p.rect(this.pos.x, this.pos.y, this.size.x, this.size.y, 10);
		this.drawText();
		this.messages[0].decrementTime();
		if (this.messages[0].timeIsUp()) {
			this.messages.shift();
		}
	}
	private drawText() {
		this.p.push();
		this.p.fill(255);
		this.p.noStroke();
		this.p.textSize(20);
		this.p.textFont("monospace");
		this.p.text(
			this.messages[0].getText(),
			this.pos.x + 20,
			this.pos.y + 35
		);
		this.p.pop();
	}
	addMessage(message: Message) {
		this.messages.push(message);
	}
}

export class Message {
	private readonly status: MessageStatus;
	private readonly text: string;
	private time: number;
	constructor(status: MessageStatus, text: string, time: number = 180) {
		this.status = status;
		this.text = text;
		this.time = time;
	}
	getStatus(): MessageStatus {
		return this.status;
	}
	getText(): string {
		return this.text;
	}
	getTime(): number {
		return this.time;
	}
	decrementTime() {
		this.time--;
	}
	timeIsUp(): boolean {
		return this.time <= 0;
	}
}
