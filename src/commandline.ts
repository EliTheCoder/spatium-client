import EventEmitter from "eventemitter3";
import p5 from "p5";

export default class CommandDispatcher extends EventEmitter {
	private commands: Map<string, Command> = new Map<string, Command>();
	private aliases: Map<string, string> = new Map<string, string>();
	constructor() {
		super();
	}
	register(command: Command): boolean {
		if (this.commands.has(command.id)) return false;
		else {
			this.commands.set(command.id, command);
			return true;
		}
	}
	run(id: string, args: string[]): string | null | undefined {
		if (this.commands.has(id)) {
			return this.commands.get(id).run(args);
		} else if (this.aliases.has(id)) {
			return this.commands.get(this.aliases.get(id)).run(args);
		} else {
			return undefined;
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

interface Command {
	id: string;
	run(args?: string[]): string | null;
}
