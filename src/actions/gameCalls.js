/* eslint-disable class-methods-use-this */
import * as stringSimilarity from "string-similarity";

import { logger } from "../tools/loggers";
import constants from "../tools/constants";
import * as initVals from "./initFill";

export default class gamePlay {
	constructor(options) {
		this.socket = options.socket;
		this.io = options.io;
		// this.players = initVals.players;
		// initVals.rooms = initVals.rooms;
		// this.words = initVals.words;
	}

	initGame(data) {
		// initVals.players[this.socket.id] = data.room;
		this.storage(data.room).users[this.socket.id] = data.name;
		this.storage(data.room).keys = Object.values(this.storage(data.room).users);
		this.storage(data.room).userCount += 1;
		this.storage(data.room).points[data.name] = 0;
	}

	selectDrawer(io, room) {
		// 1. Selects drawer
		// 2. Generates random words
		// 3. Emits event to drawer with the random word and round number.
		logger.info(room);
		if (!this.storage(room).turn.start) return;

		this.storage(room).currentDrawer = Object.values(this.storage(room).users)[this.storage(room).turnNumber];
		const userIds = Object.keys(this.storage(room).users);

		for (let i = 0; i < this.storage(room).userCount; i += 1) {
			if (this.storage(room).users[userIds[i]] === this.storage(room).currentDrawer) {
				this.storage(room).currentDrawerId = userIds[i];
				break;
			}
		}

		const shuffledWords = initVals.words
			.map((x) => ({ x, r: Math.random() }))
			.sort((a, b) => a.r - b.r)
			.map((a) => a.x)
			.slice(0, constants.wordSelOptions);

		io.to(this.storage(room).currentDrawerId).emit("word-selection", {
			w1: shuffledWords[0],
			w2: shuffledWords[1],
			w3: shuffledWords[2],
			round: this.storage(room).roundNumber,
		});
		this.storage(room).turn.start = false;
		logger.info(this.storage(room).currentDrawer);
		logger.info("Drawer selected");
	}

	roundChange(io, room) {
		// 1. Changer round, shifts to next round.
		// 2. Cleares canvas

		io.to(this.storage(room).currentDrawerId).emit("turn-end");
		io.to(room).emit("canvas-cleared");
		io.to(room).emit("round-end");
		logger.info("Round end!");
		this.storage(room).roundNumber += 1;
		if (this.storage(room).roundNumber < constants.roundNum) {
			this.storage(room).turnNumber = 0;
			this.storage(room).turn.start = true;
			this.storage(room).turnOn = true;
			this.selectDrawer(io, room);
		}
	}

	turnChange(io, room) {
		// 1. Mover the turn to the next client
		// 2. When all clients have had turns, then round is changed.

		logger.info("turn over!");
		this.storage(room).currentWord = "";
		this.storage(room).usersGuessedName = [];
		this.storage(room).points[this.storage(room).currentDrawer]
			+= Math.floor(this.storage(room).turn.timeTotal / (this.storage(room).userCount - 1))
			* constants.drawerPointFactor;
		this.storage(room).turn.timeTotal = 0;
		this.storage(room).usersGuessed = 0;
		if (!this.storage(room).cleared) {
			clearInterval(this.storage(room).wordRevealInterval);
			this.storage(room).cleared = true;
			this.storage(room).cache.indexes = [];
			this.storage(room).cache.letters = [];
		}
		io.to(room).emit("update-scoreboard", this.storage(room).points);
		this.storage(room).turnNumber += 1;
		if (this.storage(room).turnNumber === this.storage(room).userCount) {
			this.roundChange(io, room);
			this.storage(room).turnOn = false;
		} else {
			io.to(this.storage(room).currentDrawerId).emit("turn-end");
			io.to(room).emit("canvas-cleared");
			this.storage(room).turn.start = true;
			this.selectDrawer(io, room);
		}
	}

	previousDrawing(io, name, room) {
		// 1. Pushes the revealed letters to the newly connected client

		let drawId = "";
		logger.info(room);
		const userIds = Object.keys(this.storage(room).users);
		for (let i = 0; i < this.storage(room).userCount; i += 1) {
			if (this.storage(room).users[userIds[i]] === name) {
				drawId = userIds[i];
				break;
			}
		}

		io.to(drawId).emit("revealed", {
			letters: this.storage(room).cache.letters,
			indexes: this.storage(room).cache.indexes,
		});
	}

	drawerDisconnected(io, timeout, room) {
		io.to(room).emit("next-turn");

		this.storage(room).turnNumber -= 1;
		clearTimeout(this.storage(room).timeout);
		logger.info("turn over!");
		this.storage(room).usersGuessedName = [];
		this.storage(room).cache.indexes = [];
		this.storage(room).cache.letters = [];
		this.storage(room).turnNumber += 1;
		this.storage(room).points[this.storage(room).currentDrawer]
			+= Math.floor(this.storage(room).turn.timeTotal / (this.storage(room).userCount - 1))
			* constants.drawerPointFactor;
		this.storage(room).turn.timeTotal = 0;
		if (!this.storage(room).cleared) {
			clearInterval(this.storage(room).wordRevealInterval);
			this.storage(room).cleared = true;
			this.storage(room).cache.indexes = [];
			this.storage(room).cache.letters = [];
		}
		io.to(room).emit("update-scoreboard", this.storage(room).points);
		if (this.storage(room).turnNumber === this.storage(room).userCount) {
			this.roundChangeOnDisconnect(io, room);
			this.storage(room).turnOn = false;
		} else {
			io.to(room).emit("canvas-cleared");
			this.storage(room).turn.start = true;
			this.selectDrawer(io, room);
		}
	}

	roundChangeOnDisconnect(io, room) {
		io.to(room).emit("canvas-cleared");
		io.to(room).emit("round-end");
		logger.info(`Round end for ${room}`);
		this.storage(room).roundNumber += 1;
		if (this.storage(room).roundNumber < constants.roundNum) {
			this.storage(room).turnNumber = 0;
			this.storage(room).turn.start = true;
			this.storage(room).turnOn = true;
			this.selectDrawer(io, room);
		}
	}

	calculatePoints(t, room) {
		const time = 80 - (t - this.storage(room).turn.timeStart);
		const p = time * constants.playerPointFactor;
		this.storage(room).turn.timeTotal += time;
		return p;
	}

	checkSimilarity(text, room) {
		const similarity = stringSimilarity.compareTwoStrings(this.storage(room).currentWord, text);
		return similarity;
	}

	revealLetter(io, room) {
		let letter = "";
		let letterIndex;
		let loop = true;
		while (loop) {
			letterIndex = Math.floor(Math.random() * (this.storage(room).currentWord.length - 1 - 0));
			// logger.info(letterIndex);
			if (this.storage(room).cache.indexes.indexOf(letterIndex) === -1) {
				this.storage(room).cache.indexes.push(letterIndex);
				loop = false;
				break;
			}
		}

		letter = this.storage(room).currentWord.charAt(letterIndex);
		this.storage(room).cache.letters.push(letter);
		io.to(room).emit("letter", { letter, index: letterIndex });
	}

	storage(roomId) {
		return this.io.of("/gameSpace").adapter.rooms[roomId].storage;
	}

	resetRoom(room) {
		this.storage(room).userCount -= 1;
		this.storage(room).roundNumber = 0;
		this.storage(room).turn.start = false;
		this.storage(room).turn.timeStart = 0.0;
		this.storage(room).turn.timeTotal = 0;
		this.storage(room).currentWord = "";
		this.storage(room).currentDrawer = "";
		this.storage(room).currentDrawerId = "";
		this.storage(room).points = {};
		this.storage(room).usersGuessed = 0;
		this.storage(room).usersGuessedName = [];
		this.storage(room).turnNumber = 0;
		this.storage(room).startCount = 0;
		this.storage(room).turnOn = false;
		clearInterval(this.storage(room).wordRevealInterval);
		this.storage(room).wordRevealInterval = null;
		clearTimeout(this.storage(room).timeout);
		this.storage(room).timeout = null;
		this.storage(room).cleared = false;
		this.storage(room).usersGuessedName = [];
		this.storage(room).cache.indexes = [];
		this.storage(room).cache.letters = [];
		this.storage(room).keys = [];
		if (this.storage(room).userCount === 0) {
			this.storage(room).users = {};
		}
	}
}
