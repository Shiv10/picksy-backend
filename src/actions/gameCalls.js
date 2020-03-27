import * as stringSimilarity from "string-similarity";

import { logger } from "../tools/loggers";
import { constants } from "../tools/constants";

export default class Piksy {
	constructor(options) {
		this.socket = options.socket;
		this.players = options.players;
		this.rooms = options.rooms;
		this.words = options.words;
	}

	initGame(socket, data) {
		this.players[this.socket.id] = data.room;
		this.rooms[data.room].users[this.socket.id] = data.name;
		this.rooms[data.room].keys = Object.values(this.rooms[data.room].users);
		this.rooms[data.room].userCount += 1;
		this.rooms[data.room].points[data.name] = 0;
	}

	selectDrawer(io, room) {
		// 1. Selects drawer
		// 2. Generates random words
		// 3. Emits event to drawer with the random word and round number.
		logger.info(room);
		if (!this.rooms[room].turn.start) return;

		this.rooms[room].currentDrawer = Object.values(this.rooms[room].users)[this.rooms[room].turnNumber];
		// logger.info(room.currentDrawer);
		const userIds = Object.keys(this.rooms[room].users);

		for (let i = 0; i < this.rooms[room].userCount; i += 1) {
			if (this.rooms[room].users[userIds[i]] === this.rooms[room].currentDrawer) {
				this.rooms[room].currentDrawerId = userIds[i];
				break;
			}
		}

		const shuffledWords = this.words
			.map((x) => ({ x, r: Math.random() }))
			.sort((a, b) => a.r - b.r)
			.map((a) => a.x)
			.slice(0, constants.wordSelOptions);

		io.to(this.rooms[room].currentDrawerId).emit("word-selection", {
			w1: shuffledWords[0],
			w2: shuffledWords[1],
			w3: shuffledWords[2],
			round: this.rooms[room].roundNumber,
		});
		this.rooms[room].turn.start = false;
	}

	roundChange(io, room) {
		// 1. Changer round, shifts to next round.
		// 2. Cleares canvas

		io.to(this.rooms[room].currentDrawerId).emit("turn-end");
		io.to(room).emit("canvas-cleared");
		io.to(room).emit("round-end");
		logger.info("Round end!");
		this.rooms[room].roundNumber += 1;
		if (this.rooms[room].roundNumber < constants.roundNum) {
			this.rooms[room].turnNumber = 0;
			this.rooms[room].turn.start = true;
			this.rooms[room].turnOn = true;
			this.selectDrawer(io, room);
		}
	}

	turnChange(io, room) {
		// 1. Mover the turn to the next client
		// 2. When all clients have had turns, then round is changed.

		logger.info("turn over!");
		this.rooms[room].currentWord = "";
		this.rooms[room].cache.drawStackX = [];
		this.rooms[room].cache.drawStackY = [];
		this.rooms[room].cache.colorStack = [];
		this.rooms[room].cache.fillStackX = [];
		this.rooms[room].cache.fillStackY = [];
		this.rooms[room].cache.fillColor = [];
		this.rooms[room].usersGuessedName = [];
		this.rooms[room].points[this.rooms[room].currentDrawer]
			+= Math.floor(this.rooms[room].turn.timeTotal / (this.rooms[room].userCount - 1)) * constants.drawerPointFactor;
		this.rooms[room].turn.timeTotal = 0;
		this.rooms[room].usersGuessed = 0;
		if (!this.rooms[room].cleared) {
			clearInterval(this.rooms[room].wordRevealInterval);
			this.rooms[room].cleared = true;
			this.rooms[room].cache.indexes = [];
			this.rooms[room].cache.letters = [];
		}
		io.to(room).emit("update-scoreboard", this.rooms[room].points);
		this.rooms[room].turnNumber += 1;
		if (this.rooms[room].turnNumber === this.rooms[room].userCount) {
			this.roundChange(io, room);
			this.rooms[room].turnOn = false;
		} else {
			io.to(this.rooms[room].currentDrawerId).emit("turn-end");
			io.to(room).emit("canvas-cleared");
			this.rooms[room].turn.start = true;
			this.selectDrawer(io, room);
		}
	}

	previousDrawing(io, name, currentRoom) {
		// 1. Pushes the drawStack to the new client.

		let drawId = "";
		logger.info(currentRoom);
		const userIds = Object.keys(this.rooms[currentRoom].users);
		for (let i = 0; i < this.rooms[currentRoom].userCount; i += 1) {
			if (this.rooms[currentRoom].users[userIds[i]] === name) {
				drawId = userIds[i];
				break;
			}
		}
		const l = this.rooms[currentRoom].cache.drawStackX.length;
		for (let i = 0; i < l; i += 1) {
			io.to(drawId).emit("draw", {
				x: this.rooms[currentRoom].cache.drawStackX[i],
				y: this.rooms[currentRoom].cache.drawStackY[i],
				color: this.rooms[currentRoom].cache.colorStack[i],
			});
		}

		for (let i = 0; i < this.rooms[currentRoom].cache.fillStackX.length; i += 1) {
			io.to(drawId).emit("fill", {
				x: this.rooms[currentRoom].cache.fillStackX[i],
				y: this.rooms[currentRoom].cache.fillStackY[i],
				color: this.rooms[currentRoom].cache.fillColor[i],
			});
		}
		io.to(drawId).emit("stop");
		io.to(drawId).emit("revealed", {
			letters: this.rooms[currentRoom].cache.letters,
			indexes: this.rooms[currentRoom].cache.indexes,
		});
	}

	drawerDisconnected(io, timeout, room) {
		io.to(room).emit("next-turn");

		this.rooms[room].turnNumber -= 1;
		clearTimeout(this.rooms[room].timeout);
		logger.info("turn over!");
		this.rooms[room].cache.drawStackX = [];
		this.rooms[room].cache.drawStackY = [];
		this.rooms[room].cache.colorStack = [];
		this.rooms[room].cache.fillStackX = [];
		this.rooms[room].cache.fillStackY = [];
		this.rooms[room].cache.fillColor = [];
		this.rooms[room].usersGuessedName = [];
		this.rooms[room].cache.indexes = [];
		this.rooms[room].cache.letters = [];
		this.rooms[room].turnNumber += 1;
		this.rooms[room].points[this.rooms[room].currentDrawer]
			+= Math.floor(this.rooms[room].turn.timeTotal / (this.rooms[room].userCount - 1)) * constants.drawerPointFactor;
		this.rooms[room].turn.timeTotal = 0;
		if (!this.rooms[room].cleared) {
			clearInterval(this.rooms[room].wordRevealInterval);
			this.rooms[room].cleared = true;
			this.rooms[room].cache.indexes = [];
			this.rooms[room].cache.letters = [];
		}
		io.to(room).emit("update-scoreboard", this.rooms[room].points);
		if (this.rooms[room].turnNumber === this.rooms[room].userCount) {
			this.roundChangeOnDisconnect(io, room);
			this.rooms[room].turnOn = false;
		} else {
			io.to(room).emit("canvas-cleared");
			this.rooms[room].turn.start = true;
			this.selectDrawer(io, room);
		}
	}

	roundChangeOnDisconnect(io, room) {
		io.to(room).emit("canvas-cleared");
		io.to(room).emit("round-end");
		logger.info(`Round end for ${room}`);
		this.rooms[room].roundNumber += 1;
		if (this.rooms[room].roundNumber < constants.roundNum) {
			this.rooms[room].turnNumber = 0;
			this.rooms[room].turn.start = true;
			this.rooms[room].turnOn = true;
			this.selectDrawer(io);
		}
	}

	calculatePoints(t, room) {
		const time = 80 - (t - this.rooms[room].turn.timeStart);
		const p = time * constants.playerPointFactor;
		this.rooms[room].turn.timeTotal += time;
		return p;
	}

	checkSimilarity(text, room) {
		const similarity = stringSimilarity.compareTwoStrings(this.rooms[room].currentWord, text);
		return similarity;
	}

	revealLetter(io, room) {
		let letter = "";
		let letterIndex;
		let loop = true;
		while (loop) {
			letterIndex = Math.floor(Math.random() * (this.rooms[room].currentWord.length - 1 - 0));
			// logger.info(letterIndex);
			if (this.rooms[room].cache.indexes.indexOf(letterIndex) === -1) {
				this.rooms[room].cache.indexes.push(letterIndex);
				loop = false;
				break;
			}
		}

		letter = this.rooms[room].currentWord.charAt(letterIndex);
		this.rooms[room].cache.letters.push(letter);
		io.to(room).emit("letter", { letter, index: letterIndex });
	}

	resetRoom(room) {
		this.rooms[room].userCount -= 1;
		this.rooms[room].roundNumber = 0;
		this.rooms[room].turn.start = false;
		this.rooms[room].turn.timeStart = 0.0;
		this.rooms[room].turn.timeTotal = 0;
		this.rooms[room].currentWord = "";
		this.rooms[room].currentDrawer = "";
		this.rooms[room].currentDrawerId = "";
		this.rooms[room].points = {};
		this.rooms[room].usersGuessed = 0;
		this.rooms[room].usersGuessedName = [];
		this.rooms[room].turnNumber = 0;
		this.rooms[room].turnOn = false;
		clearInterval(this.rooms[room].wordRevealInterval);
		this.rooms[room].wordRevealInterval = null;
		clearTimeout(this.rooms[room].timeout);
		this.rooms[room].timeout = null;
		this.rooms[room].cleared = false;
		this.rooms[room].cache.drawStackX = [];
		this.rooms[room].cache.drawStackY = [];
		this.rooms[room].cache.colorStack = [];
		this.rooms[room].cache.fillStackX = [];
		this.rooms[room].cache.fillStackY = [];
		this.rooms[room].cache.fillColor = [];
		this.rooms[room].usersGuessedName = [];
		this.rooms[room].cache.indexes = [];
		this.rooms[room].cache.letters = [];
		this.rooms[room].keys = [];
		if (this.rooms[room].userCount === 0) {
			this.rooms[room].users = {};
		}
	}
}
