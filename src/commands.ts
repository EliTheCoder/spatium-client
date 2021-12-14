import { Move, Vec } from "hika";
import { Command, Message, MessageStatus } from "./commandline";

export class ConnectCommand implements Command {
	id: string = "connect";
	run(
		args: string[],
		commandDataProvider: Map<string, any>
	): Promise<boolean> {
		if (args.length === 0) {
			commandDataProvider
				.get("messageBox")
				.addMessage(
					new Message(MessageStatus.ERROR, "Usage: connect <url>")
				);
			return new Promise(resolve => resolve(false));
		} else {
			return new Promise(resolve => {
				commandDataProvider
					.get("world")
					.addOnlineBoard(args[0])
					.on("connect", () => {
						resolve(true);
						commandDataProvider
							.get("messageBox")
							.addMessage(
								new Message(
									MessageStatus.SUCCESS,
									"Connected to " + args[0]
								)
							);
					});
			});
		}
	}
}

export class MoveCommand implements Command {
	id: string = "move";
	run(
		args: string[],
		commandDataProvider: Map<string, any>
	): Promise<boolean> {
		if (args.length === 0) {
			commandDataProvider
				.get("messageBox")
				.addMessage(new Message(MessageStatus.ERROR, this.usage()));
			return new Promise(resolve => resolve(false));
		}
		let numberArgs = args.map(arg => parseInt(arg));
		commandDataProvider
			.get("world")
			.getBoards()[0]
			.board.move(
				new Move(
					new Vec(
						numberArgs[0],
						numberArgs[1],
						numberArgs[2],
						numberArgs[3]
					),
					new Vec(
						numberArgs[4],
						numberArgs[5],
						numberArgs[6],
						numberArgs[7]
					)
				)
			);
	}
	private usage(): string {
		return "Usage: move <x1> <y1> <z1> <w1> <x2> <y2> <z2> <w2>";
	}
}

export class MessageCommand implements Command {
	id: string = "message";
	run(
		args: string[],
		commandDataProvider: Map<string, any>
	): Promise<boolean> {
		if (args.length < 2) {
			commandDataProvider
				.get("messageBox")
				.addMessage(new Message(MessageStatus.ERROR, this.usage()));
			return new Promise(resolve => resolve(false));
		}
		let messageStatus: MessageStatus;
		switch (args[0]) {
			case "success":
				messageStatus = MessageStatus.SUCCESS;
				break;
			case "error":
				messageStatus = MessageStatus.ERROR;
				break;
			case "info":
				messageStatus = MessageStatus.INFO;
				break;
			default:
				commandDataProvider
					.get("messageBox")
					.addMessage(new Message(MessageStatus.ERROR, this.usage()));
				return new Promise(resolve => resolve(false));
		}
		commandDataProvider
			.get("messageBox")
			.addMessage(new Message(messageStatus, args.slice(1).join(" ")));
		return new Promise(resolve => resolve(true));
	}
	private usage(): string {
		return "Usage: message <info | error | success> <message>";
	}
}
