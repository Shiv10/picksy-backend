/* eslint-disable linebreak-style */
/* eslint-disable no-use-before-define */
const socketio = require("socket.io");
const stringSimilarity = require("string-similarity");
const constants = require("../tools/constants");

const { logger } = require("../tools/loggers");

const users = {}; // socket_id -> username

let keys = [];
const words = [
	"pencil",
	"paper",
	"glasses",
	"bottle",
	"keyboard",
	"clouds",
	"hills",
	"glue",
	"keys",
	"cuboid",
	"laptop",
	"window",
	"shoe",
	"play station",
];
let userCount = 0;

const room = {
	roundNumber: 0,
	turn: {
		start: false,
		timeStart: 0.0,
		timeTotal: 0,
	},
	currentWord: "",
	currentDrawer: "",
	currentDrawerId: "",
	points: {},
	usersGuessed: 0,
};

const cache = {
	drawStackX: [],
	drawStackY: [],
	colorStack: [],
	fillStackX: [],
	fillStackY: [],
	fillColor: [],
	indexes: [],
	letters: [],
};

let turn = 0;
let turnOn = false; // game already begun

let wordRevealInterval;
let cleared = false;

module.exports.listen = (app) => {
	const io = socketio.listen(app);
	let timeout;
	io.on("connection", (socket) => {
		socket.on("new user", (name) => {
			logger.info("user connected");
			users[socket.id] = name;
			keys = Object.values(users);
			userCount += 1;
			room.points[name] = 0;
			if (turnOn) {
				previousDrawing(io, name);
			}
		});

		keys = Object.values(users);
		if (keys.length + 1 === 2) {
			io.emit("start-game");
			room.turn.start = true;
			selectDrawer(io);
		}

		if (keys.length + 1 > 2) {
			socket.emit("start-game");
			if (turnOn) {
				socket.emit("word-selected", {
					name: room.currentDrawer,
					time: room.turn.timeStart,
				});
			}
		}

		socket.on("word-selected", (data) => {
			const timeStamp = new Date();
			logger.info(data.word);
			room.currentWord = data.word;
			const ct = Math.floor(timeStamp.getTime() / 1000);
			room.turn.timeStart = ct;
			io.emit("word-selected", { name: room.currentDrawer, time: ct });
			turnOn = true;
			timeout = setTimeout(turnChange, constants.timeOfRound, io);
			const wordRevealTime = Math.floor(60 / Math.floor(room.currentWord.length / 2));
			wordRevealInterval = setInterval(revealLetter, wordRevealTime * 1000, io);
			cleared = false;
		});

		socket.on("message", (data) => {
			if (data.text === room.currentWord && users[socket.id] !== room.currentDrawer) {
				// eslint-disable-next-line no-undef
				t = data.time - room.turn.timeStart;
				room.points[users[socket.id]] += calculatePoints(data.time);
				room.usersGuessed += 1;
				io.emit("word-guessed", { name: users[socket.id] });
				if (room.usersGuessed === userCount - 1) {
					io.emit("next-turn");
					clearTimeout(timeout);
					turnChange(io);
				}
			} else {
				const similarity = checkSimilarity(data.text);
				if (similarity >= 0.55) {
					io.emit("similar-word", { text: data.text });
				} else {
					socket.broadcast.emit("message", {
						name: users[socket.id],
						text: data.text,
					});
				}
			}
		});

		socket.on("fill", (data) => {
			cache.fillStackX.push(data.x);
			cache.fillStackY.push(data.y);
			cache.fillColor.push(data.color);
			socket.broadcast.emit("fill", data);
		});

		socket.on("draw", (data) => {
			cache.drawStackX.push(data.x);
			cache.drawStackY.push(data.y);
			cache.colorStack.push(data.color);
			socket.broadcast.emit("draw", data);
		});

		socket.on("stop", () => {
			socket.broadcast.emit("stop");
		});

		socket.on("canvas-cleared", () => {
			socket.broadcast.emit("canvas-cleared");
		});

		socket.on("no-more-reveal", () => {
			clearInterval(wordRevealInterval);
			cache.indexes = [];
			cache.letters = [];
			cleared = true;
		});

		socket.on("disconnect", () => {
			logger.info(`${users[socket.id]} disconnected`);
			// delete[room.points[socket.id]]; Scribble.io it doesn't remove user from scoreboard
			// on disconnection, but we can add this functionality
			userCount -= 1;
			if (users[socket.id] === room.currentDrawer && userCount > 1) {
				delete users[socket.id];
				logger.info("Drawer disconnected!");
				drawerDisconnected(io, timeout);
			} else {
				delete users[socket.id];
			}
		});
	});

	return io;
};

function selectDrawer(io) {
	// 1. Selects drawer
	// 2. Generates random words
	// 3. Emits event to drawer with the random word and round number.
	if (!room.turn.start) return;

	room.currentDrawer = Object.values(users)[turn];
	logger.info(room.currentDrawer);
	const userIds = Object.keys(users);

	for (let i = 0; i < userCount; i += 1) {
		if (users[userIds[i]] === room.currentDrawer) {
			room.currentDrawerId = userIds[i];
			break;
		}
	}

	const shuffledWords = words
		.map((x) => ({ x, r: Math.random() }))
		.sort((a, b) => a.r - b.r)
		.map((a) => a.x)
		.slice(0, constants.wordSelOptions);

	io.to(room.currentDrawerId).emit("word-selection", {
		w1: shuffledWords[0],
		w2: shuffledWords[1],
		w3: shuffledWords[2],
		round: room.roundNumber,
	});
	room.turn.start = false;
}

function roundChange(io) {
	// 1. Changer round, shifts to next round.
	// 2. Cleares canvas

	io.to(room.currentDrawerId).emit("turn-end");
	io.emit("canvas-cleared");
	io.emit("round-end");
	logger.info("Round end!");
	room.roundNumber += 1;
	if (room.roundNumber < constants.roundNum) {
		turn = 0;
		room.turn.start = true;
		turnOn = true;
		selectDrawer(io);
	}
}

function turnChange(io) {
	// 1. Mover the turn to the next client
	// 2. When all clients have had turns, then round is changed.

	logger.info("turn over!");
	room.currentWord = "";
	cache.drawStackX = [];
	cache.drawStackY = [];
	cache.colorStack = [];
	cache.fillStackX = [];
	cache.fillStackY = [];
	cache.fillColor = [];
	room.points[room.currentDrawer] += Math.floor(room.turn.timeTotal / (userCount - 1)) * constants.drawerPointFactor;
	room.turn.timeTotal = 0;
	room.usersGuessed = 0;
	if (!cleared) {
		clearInterval(wordRevealInterval);
		cleared = true;
		cache.indexes = [];
		cache.letters = [];
	}
	io.emit("update-scoreboard", room.points);
	turn += 1;
	if (turn === userCount) {
		roundChange(io);
		turnOn = false;
	} else {
		io.to(room.currentDrawerId).emit("turn-end");
		io.emit("canvas-cleared");
		room.turn.start = true;
		selectDrawer(io);
	}
}

function previousDrawing(io, name) {
	// 1. Pushes the drawStack to the new client.

	let drawId = "";
	const userIds = Object.keys(users);
	for (let i = 0; i < userCount; i += 1) {
		if (users[userIds[i]] === name) {
			drawId = userIds[i];
			break;
		}
	}
	const l = cache.drawStackX.length;
	for (let i = 0; i < l; i += 1) {
		io.to(drawId).emit("draw", { x: cache.drawStackX[i], y: cache.drawStackY[i], color: cache.colorStack[i] });
	}

	for (let i = 0; i < cache.fillStackX.length; i += 1) {
		io.to(drawId).emit("fill", { x: cache.fillStackX[i], y: cache.fillStackY[i], color: cache.fillColor[i] });
	}
	io.to(drawId).emit("stop");
	io.to(drawId).emit("revealed", { letters: cache.letters, indexes: cache.indexes });
}

function drawerDisconnected(io, timeout) {
	io.emit("next-turn");

	turn -= 1;
	clearTimeout(timeout);
	logger.info("turn over!");
	cache.drawStackX = [];
	cache.drawStackY = [];
	cache.colorStack = [];
	cache.fillStackX = [];
	cache.fillStackY = [];
	cache.fillColor = [];
	turn += 1;
	room.points[room.currentDrawer] += Math.floor(room.turn.timeTotal / (userCount - 1)) * constants.drawerPointFactor;
	room.turn.timeTotal = 0;
	if (!cleared) {
		clearInterval(wordRevealInterval);
		cleared = true;
		cache.indexes = [];
		cache.letters = [];
	}
	io.emit("update-scoreboard", room.points);
	if (turn === userCount) {
		roundChangeOnDisconnect(io);
		turnOn = false;
	} else {
		io.emit("canvas-cleared");
		room.turn.start = true;
		selectDrawer(io);
	}
}

function roundChangeOnDisconnect(io) {
	io.emit("canvas-cleared");
	io.emit("round-end");
	logger.info("Round end!");
	room.roundNumber += 1;
	if (room.roundNumber < constants.roundNum) {
		turn = 0;
		room.turn.start = true;
		turnOn = true;
		selectDrawer(io);
	}
}

function calculatePoints(t) {
	const time = 80 - (t - room.turn.timeStart);
	const p = time * constants.playerPointFactor;
	room.turn.timeTotal += time;
	return p;
}

function checkSimilarity(text) {
	const similarity = stringSimilarity.compareTwoStrings(room.currentWord, text);
	return similarity;
}

function revealLetter(io) {
	let letter = "";
	let letterIndex;
	let loop = true;
	while (loop) {
		letterIndex = Math.floor(Math.random() * (room.currentWord.length - 1 - 0));
		// logger.info(letterIndex);
		if (cache.indexes.indexOf(letterIndex) === -1) {
			cache.indexes.push(letterIndex);
			loop = false;
			break;
		}
	}

	letter = room.currentWord.charAt(letterIndex);
	cache.letters.push(letter);
	io.emit("letter", { letter, index: letterIndex });
}
