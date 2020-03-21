/* eslint-disable linebreak-style */
/* eslint-disable no-use-before-define */
const socketio = require("socket.io");
const stringSimilarity = require("string-similarity");
const constants = require("../tools/constants");

const { logger } = require("../tools/loggers");

// const users = {}; // socket_id -> username

// let keys = [];
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

const rooms = {
	room1: {
		userCount: 0,
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
		usersGuessedName: [],
		turnNumber: 0,
		turnOn: false,
		wordRevealInterval: null,
		timeout: null,
		cleared: false,
		cache: {
			drawStackX: [],
			drawStackY: [],
			colorStack: [],
			fillStackX: [],
			fillStackY: [],
			fillColor: [],
			indexes: [],
			letters: [],
		},
		users: {},
		keys: [],
	},
};

module.exports.listen = (app) => {
	const io = socketio.listen(app);
	let timeout;
	io.on("connection", (socket) => {
		socket.on("new user", (name) => {
			logger.info("user connected");
			rooms.room1.users[socket.id] = name;
			rooms.room1.keys = Object.values(rooms.room1.users);
			rooms.room1.userCount += 1;
			rooms.room1.points[name] = 0;
			if (rooms.room1.turnOn) {
				previousDrawing(io, name);
			}
		});

		rooms.room1.keys = Object.values(rooms.room1.users);
		if (rooms.room1.keys.length + 1 === 2) {
			io.emit("start-game");
			rooms.room1.turn.start = true;
			selectDrawer(io);
		}

		if (rooms.room1.keys.length + 1 > 2) {
			socket.emit("start-game");
			if (rooms.room1.turnOn) {
				socket.emit("word-selected", {
					name: rooms.room1.currentDrawer,
					time: rooms.room1.turn.timeStart,
				});
			}
		}

		socket.on("word-selected", (data) => {
			const timeStamp = new Date();
			logger.info(data.word);
			rooms.room1.currentWord = data.word;
			const ct = Math.floor(timeStamp.getTime() / 1000);
			rooms.room1.turn.timeStart = ct;
			io.emit("word-selected", { name: rooms.room1.currentDrawer, time: ct });
			rooms.room1.turnOn = true;
			rooms.room1.timeout = setTimeout(turnChange, constants.timeOfRound, io);
			const wordRevealTime = Math.floor(60 / Math.floor(rooms.room1.currentWord.length / 2));
			rooms.room1.wordRevealInterval = setInterval(revealLetter, wordRevealTime * 1000, io);
			rooms.room1.cleared = false;
		});

		socket.on("message", (data) => {
			if (data.text === rooms.room1.currentWord && rooms.room1.users[socket.id] !== rooms.room1.currentDrawer) {
				if (rooms.room1.usersGuessedName.includes(rooms.room1.users[socket.id])) return;
				// eslint-disable-next-line no-undef
				t = data.time - rooms.room1.turn.timeStart;
				rooms.room1.points[rooms.room1.users[socket.id]] += calculatePoints(data.time);
				rooms.room1.usersGuessed += 1;
				rooms.room1.usersGuessedName.push(rooms.room1.users[socket.id]);
				io.emit("word-guessed", { name: rooms.room1.users[socket.id] });
				if (rooms.room1.usersGuessed === rooms.room1.userCount - 1) {
					io.emit("next-turn");
					clearTimeout(rooms.room1.timeout);
					turnChange(io);
				}
			} else {
				const similarity = checkSimilarity(data.text);
				if (similarity >= 0.55) {
					io.emit("similar-word", { text: data.text });
				} else {
					socket.broadcast.emit("message", {
						name: rooms.room1.users[socket.id],
						text: data.text,
					});
				}
			}
		});

		socket.on("fill", (data) => {
			rooms.room1.cache.fillStackX.push(data.x);
			rooms.room1.cache.fillStackY.push(data.y);
			rooms.room1.cache.fillColor.push(data.color);
			socket.broadcast.emit("fill", data);
		});

		socket.on("draw", (data) => {
			rooms.room1.cache.drawStackX.push(data.x);
			rooms.room1.cache.drawStackY.push(data.y);
			rooms.room1.cache.colorStack.push(data.color);
			socket.broadcast.emit("draw", data);
		});

		socket.on("stop", () => {
			socket.broadcast.emit("stop");
		});

		socket.on("canvas-cleared", () => {
			socket.broadcast.emit("canvas-cleared");
		});

		socket.on("no-more-reveal", () => {
			clearInterval(rooms.room1.wordRevealInterval);
			rooms.room1.cache.indexes = [];
			rooms.room1.cache.letters = [];
			rooms.room1.cleared = true;
		});

		socket.on("disconnect", () => {
			logger.info(`${rooms.room1.users[socket.id]} disconnected`);
			// delete[room.points[socket.id]]; Scribble.io it doesn't remove user from scoreboard
			// on disconnection, but we can add this functionality
			rooms.room1.userCount -= 1;
			if (rooms.room1.users[socket.id] === rooms.room1.currentDrawer && rooms.room1.userCount > 1) {
				delete rooms.room1.users[socket.id];
				logger.info("Drawer disconnected!");
				drawerDisconnected(io, timeout);
			} else {
				delete rooms.room1.users[socket.id];
			}
		});
	});

	return io;
};

function selectDrawer(io) {
	// 1. Selects drawer
	// 2. Generates random words
	// 3. Emits event to drawer with the random word and round number.
	if (!rooms.room1.turn.start) return;

	rooms.room1.currentDrawer = Object.values(rooms.room1.users)[rooms.room1.turnNumber];
	// logger.info(room.currentDrawer);
	const userIds = Object.keys(rooms.room1.users);

	for (let i = 0; i < rooms.room1.userCount; i += 1) {
		if (rooms.room1.users[userIds[i]] === rooms.room1.currentDrawer) {
			rooms.room1.currentDrawerId = userIds[i];
			break;
		}
	}

	const shuffledWords = words
		.map((x) => ({ x, r: Math.random() }))
		.sort((a, b) => a.r - b.r)
		.map((a) => a.x)
		.slice(0, constants.wordSelOptions);

	io.to(rooms.room1.currentDrawerId).emit("word-selection", {
		w1: shuffledWords[0],
		w2: shuffledWords[1],
		w3: shuffledWords[2],
		round: rooms.room1.roundNumber,
	});
	rooms.room1.turn.start = false;
}

function roundChange(io) {
	// 1. Changer round, shifts to next round.
	// 2. Cleares canvas

	io.to(rooms.room1.currentDrawerId).emit("turn-end");
	io.emit("canvas-cleared");
	io.emit("round-end");
	logger.info("Round end!");
	rooms.room1.roundNumber += 1;
	if (rooms.room1.roundNumber < constants.roundNum) {
		rooms.room1.turnNumber = 0;
		rooms.room1.turn.start = true;
		rooms.room1.turnOn = true;
		selectDrawer(io);
	}
}

function turnChange(io) {
	// 1. Mover the turn to the next client
	// 2. When all clients have had turns, then round is changed.

	logger.info("turn over!");
	rooms.room1.currentWord = "";
	rooms.room1.cache.drawStackX = [];
	rooms.room1.cache.drawStackY = [];
	rooms.room1.cache.colorStack = [];
	rooms.room1.cache.fillStackX = [];
	rooms.room1.cache.fillStackY = [];
	rooms.room1.cache.fillColor = [];
	rooms.room1.usersGuessedName = [];
	rooms.room1.points[rooms.room1.currentDrawer] += Math.floor(rooms.room1.turn.timeTotal / (rooms.room1.userCount - 1)) * constants.drawerPointFactor;
	rooms.room1.turn.timeTotal = 0;
	rooms.room1.usersGuessed = 0;
	if (!rooms.room1.cleared) {
		clearInterval(rooms.room1.wordRevealInterval);
		rooms.room1.cleared = true;
		rooms.room1.cache.indexes = [];
		rooms.room1.cache.letters = [];
	}
	io.emit("update-scoreboard", rooms.room1.points);
	rooms.room1.turnNumber += 1;
	if (rooms.room1.turnNumber === rooms.room1.userCount) {
		roundChange(io);
		rooms.room1.turnOn = false;
	} else {
		io.to(rooms.room1.currentDrawerId).emit("turn-end");
		io.emit("canvas-cleared");
		rooms.room1.turn.start = true;
		selectDrawer(io);
	}
}

function previousDrawing(io, name) {
	// 1. Pushes the drawStack to the new client.

	let drawId = "";
	const userIds = Object.keys(rooms.room1.users);
	for (let i = 0; i < rooms.room1.userCount; i += 1) {
		if (rooms.room1.users[userIds[i]] === name) {
			drawId = userIds[i];
			break;
		}
	}
	const l = rooms.room1.cache.drawStackX.length;
	for (let i = 0; i < l; i += 1) {
		io.to(drawId).emit("draw", { x: rooms.room1.cache.drawStackX[i], y: rooms.room1.cache.drawStackY[i], color: rooms.room1.cache.colorStack[i] });
	}

	for (let i = 0; i < rooms.room1.cache.fillStackX.length; i += 1) {
		io.to(drawId).emit("fill", { x: rooms.room1.cache.fillStackX[i], y: rooms.room1.cache.fillStackY[i], color: rooms.room1.cache.fillColor[i] });
	}
	io.to(drawId).emit("stop");
	io.to(drawId).emit("revealed", { letters: rooms.room1.cache.letters, indexes: rooms.room1.cache.indexes });
}

function drawerDisconnected(io, timeout) {
	io.emit("next-turn");

	rooms.room1.turnNumber -= 1;
	clearTimeout(rooms.room1.timeout);
	logger.info("turn over!");
	rooms.room1.cache.drawStackX = [];
	rooms.room1.cache.drawStackY = [];
	rooms.room1.cache.colorStack = [];
	rooms.room1.cache.fillStackX = [];
	rooms.room1.cache.fillStackY = [];
	rooms.room1.cache.fillColor = [];
	rooms.room1.usersGuessedName = [];
	rooms.room1.turnNumber += 1;
	rooms.room1.points[rooms.room1.currentDrawer] += Math.floor(rooms.room1.turn.timeTotal / (rooms.room1.userCount - 1)) * constants.drawerPointFactor;
	rooms.room1.turn.timeTotal = 0;
	if (!rooms.room1.cleared) {
		clearInterval(rooms.room1.wordRevealInterval);
		rooms.room1.cleared = true;
		rooms.room1.cache.indexes = [];
		rooms.room1.cache.letters = [];
	}
	io.emit("update-scoreboard", rooms.room1.points);
	if (rooms.room1.turnNumber === rooms.room1.userCount) {
		roundChangeOnDisconnect(io);
		rooms.room1.turnOn = false;
	} else {
		io.emit("canvas-cleared");
		rooms.room1.turn.start = true;
		selectDrawer(io);
	}
}

function roundChangeOnDisconnect(io) {
	io.emit("canvas-cleared");
	io.emit("round-end");
	logger.info("Round end!");
	rooms.room1.roundNumber += 1;
	if (rooms.room1.roundNumber < constants.roundNum) {
		rooms.room1.turnNumber = 0;
		rooms.room1.turn.start = true;
		rooms.room1.turnOn = true;
		selectDrawer(io);
	}
}

function calculatePoints(t) {
	const time = 80 - (t - rooms.room1.turn.timeStart);
	const p = time * constants.playerPointFactor;
	rooms.room1.turn.timeTotal += time;
	return p;
}

function checkSimilarity(text) {
	const similarity = stringSimilarity.compareTwoStrings(rooms.room1.currentWord, text);
	return similarity;
}

function revealLetter(io) {
	let letter = "";
	let letterIndex;
	let loop = true;
	while (loop) {
		letterIndex = Math.floor(Math.random() * (rooms.room1.currentWord.length - 1 - 0));
		// logger.info(letterIndex);
		if (rooms.room1.cache.indexes.indexOf(letterIndex) === -1) {
			rooms.room1.cache.indexes.push(letterIndex);
			loop = false;
			break;
		}
	}

	letter = rooms.room1.currentWord.charAt(letterIndex);
	rooms.room1.cache.letters.push(letter);
	io.emit("letter", { letter, index: letterIndex });
}
