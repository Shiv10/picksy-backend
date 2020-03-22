/* eslint-disable quote-props */
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
	room2: {
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
	room3: {
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
	room4: {
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
	room5: {
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
	room6: {
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
	room7: {
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
	room8: {
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
	room9: {
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
	room10: {
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
	room11: {
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
	room12: {
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
	io.on("connection", (socket) => {
		const room = socket.handshake.query.userRoom;
		socket.join(room);
		socket.on("new user", (data) => {
			logger.info("user connected");
			rooms[data.room].users[socket.id] = data.name;
			rooms[data.room].keys = Object.values(rooms[data.room].users);
			rooms[data.room].userCount += 1;
			rooms[data.room].points[data.name] = 0;
			if (rooms[data.room].turnOn) {
				previousDrawing(io, data.name, data.room);
			}
			if (rooms[data.room].keys.length === 2) {
				io.emit("start-game");
				rooms[data.room].turn.start = true;
				selectDrawer(io, data.room);
			}

			if (rooms[data.room].keys.length > 2) {
				socket.emit("start-game");
				if (rooms[data.room].turnOn) {
					socket.emit("word-selected", {
						name: rooms[data.room].currentDrawer,
						time: rooms[data.room].turn.timeStart,
					});
				}
			}
		});

		socket.on("word-selected", (data) => {
			const timeStamp = new Date();
			logger.info(data.word);
			rooms[data.room].currentWord = data.word;
			const ct = Math.floor(timeStamp.getTime() / 1000);
			rooms[data.room].turn.timeStart = ct;
			io.to(data.room).emit("word-selected", { name: rooms[data.room].currentDrawer, time: ct });
			rooms[data.room].turnOn = true;
			rooms[data.room].timeout = setTimeout(turnChange, constants.timeOfRound, io, data.room);
			const wordRevealTime = Math.floor(60 / Math.floor(rooms[data.room].currentWord.length / 2));
			rooms[data.room].wordRevealInterval = setInterval(revealLetter, wordRevealTime * 1000, io, data.room);
			rooms[data.room].cleared = false;
		});

		socket.on("message", (data) => {
			if (
				data.text === rooms[data.room].currentWord && rooms[data.room].users[socket.id] !== rooms[data.room].currentDrawer
			) {
				if (rooms[data.room].usersGuessedName.includes(rooms[data.room].users[socket.id])) return;
				// eslint-disable-next-line no-undef
				t = data.time - rooms[data.room].turn.timeStart;
				rooms[data.room].points[rooms[data.room].users[socket.id]] += calculatePoints(data.time);
				rooms[data.room].usersGuessed += 1;
				rooms[data.room].usersGuessedName.push(rooms[data.room].users[socket.id]);
				io.emit("word-guessed", { name: rooms[data.room].users[socket.id] });
				if (rooms[data.room].usersGuessed === rooms[data.room].userCount - 1) {
					io.emit("next-turn");
					clearTimeout(rooms[data.room].timeout);
					turnChange(io, data.room);
				}
			} else {
				const similarity = checkSimilarity(data.text);
				if (similarity >= 0.55) {
					io.to(data.room).emit("similar-word", { text: data.text });
				} else {
					socket.to(data.room).broadcast.emit("message", {
						name: rooms[data.room].users[socket.id],
						text: data.text,
					});
				}
			}
		});

		socket.on("fill", (data) => {
			rooms[data.room].cache.fillStackX.push(data.x);
			rooms[data.room].cache.fillStackY.push(data.y);
			rooms[data.room].cache.fillColor.push(data.color);
			socket.to(data.room).broadcast.emit("fill", data);
		});

		socket.on("draw", (data) => {
			rooms[data.room].cache.drawStackX.push(data.x);
			rooms[data.room].cache.drawStackY.push(data.y);
			rooms[data.room].cache.colorStack.push(data.color);
			socket.to(data.room).broadcast.emit("draw", data);
		});

		socket.on("stop", (data) => {
			socket.to(data.room).broadcast.emit("stop");
		});

		socket.on("canvas-cleared", (data) => {
			socket.to(data.room).broadcast.emit("canvas-cleared");
		});

		socket.on("no-more-reveal", (data) => {
			clearInterval(rooms[data.room].wordRevealInterval);
			rooms[data.room].cache.indexes = [];
			rooms[data.room].cache.letters = [];
			rooms[data.room].cleared = true;
		});

		socket.on("disconnect", () => {
			logger.info(`${rooms.room1.users[socket.id]} disconnected`);
			// delete[room.points[socket.id]]; Scribble.io it doesn't remove user from scoreboard
			// on disconnection, but we can add this functionality
			rooms.room1.userCount -= 1;
			if (rooms.room1.users[socket.id] === rooms.room1.currentDrawer && rooms.room1.userCount > 1) {
				delete rooms.room1.users[socket.id];
				logger.info("Drawer disconnected!");
				drawerDisconnected(io, rooms.room1.timeout);
			} else {
				delete rooms.room1.users[socket.id];
			}
		});
	});

	return io;
};

function selectDrawer(io, room) {
	// 1. Selects drawer
	// 2. Generates random words
	// 3. Emits event to drawer with the random word and round number.
	logger.info(room);
	if (!rooms.room.turn.start) return;

	rooms.room.currentDrawer = Object.values(rooms.room.users)[rooms.room.turnNumber];
	// logger.info(room.currentDrawer);
	const userIds = Object.keys(rooms.room.users);

	for (let i = 0; i < rooms.room.userCount; i += 1) {
		if (rooms.room.users[userIds[i]] === rooms.room.currentDrawer) {
			rooms.room.currentDrawerId = userIds[i];
			break;
		}
	}

	const shuffledWords = words
		.map((x) => ({ x, r: Math.random() }))
		.sort((a, b) => a.r - b.r)
		.map((a) => a.x)
		.slice(0, constants.wordSelOptions);

	io.to(rooms.room.currentDrawerId).emit("word-selection", {
		w1: shuffledWords[0],
		w2: shuffledWords[1],
		w3: shuffledWords[2],
		round: rooms.room.roundNumber,
	});
	rooms.room.turn.start = false;
}

function roundChange(io, room) {
	// 1. Changer round, shifts to next round.
	// 2. Cleares canvas

	io.to(rooms.room.currentDrawerId).emit("turn-end");
	io.to(room).emit("canvas-cleared");
	io.to(room).emit("round-end");
	logger.info("Round end!");
	rooms.room.roundNumber += 1;
	if (rooms.room.roundNumber < constants.roundNum) {
		rooms.room.turnNumber = 0;
		rooms.room.turn.start = true;
		rooms.room.turnOn = true;
		selectDrawer(io, room);
	}
}

function turnChange(io, room) {
	// 1. Mover the turn to the next client
	// 2. When all clients have had turns, then round is changed.

	logger.info("turn over!");
	rooms.room.currentWord = "";
	rooms.room.cache.drawStackX = [];
	rooms.room.cache.drawStackY = [];
	rooms.room.cache.colorStack = [];
	rooms.room.cache.fillStackX = [];
	rooms.room.cache.fillStackY = [];
	rooms.room.cache.fillColor = [];
	rooms.room.usersGuessedName = [];
	rooms.room.points[rooms.room.currentDrawer] += Math.floor(rooms.room.turn.timeTotal / (rooms.room.userCount - 1)) * constants.drawerPointFactor;
	rooms.room.turn.timeTotal = 0;
	rooms.room.usersGuessed = 0;
	if (!rooms.room.cleared) {
		clearInterval(rooms.room.wordRevealInterval);
		rooms.room.cleared = true;
		rooms.room.cache.indexes = [];
		rooms.room.cache.letters = [];
	}
	io.to(room).emit("update-scoreboard", rooms.room.points);
	rooms.room.turnNumber += 1;
	if (rooms.room.turnNumber === rooms.room.userCount) {
		roundChange(io, room);
		rooms.room.turnOn = false;
	} else {
		io.to(rooms.room.currentDrawerId).emit("turn-end");
		io.to(room).emit("canvas-cleared");
		rooms.room.turn.start = true;
		selectDrawer(io, room);
	}
}

function previousDrawing(io, name, currentRoom) {
	// 1. Pushes the drawStack to the new client.

	let drawId = "";
	logger.info(currentRoom);
	const userIds = Object.keys(rooms.currentRoom.users);
	for (let i = 0; i < rooms.currentRoom.userCount; i += 1) {
		if (rooms.currentRoom.users[userIds[i]] === name) {
			drawId = userIds[i];
			break;
		}
	}
	const l = rooms.currentRoom.cache.drawStackX.length;
	for (let i = 0; i < l; i += 1) {
		io.to(drawId).emit("draw", {
			x: rooms.currentRoom.cache.drawStackX[i],
			y: rooms.currentRoom.cache.drawStackY[i],
			color: rooms.currentRoom.cache.colorStack[i],
		});
	}

	for (let i = 0; i < rooms.currentRoom.cache.fillStackX.length; i += 1) {
		io.to(drawId).emit("fill", {
			x: rooms.currentRoom.cache.fillStackX[i],
			y: rooms.currentRoom.cache.fillStackY[i],
			color: rooms.currentRoom.cache.fillColor[i],
		});
	}
	io.to(drawId).emit("stop");
	io.to(drawId).emit("revealed", {
		letters: rooms.currentRoom.cache.letters,
		indexes: rooms.currentRoom.cache.indexes,
	});
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

function revealLetter(io, room) {
	let letter = "";
	let letterIndex;
	let loop = true;
	while (loop) {
		letterIndex = Math.floor(Math.random() * (rooms.room.currentWord.length - 1 - 0));
		// logger.info(letterIndex);
		if (rooms.room.cache.indexes.indexOf(letterIndex) === -1) {
			rooms.room.cache.indexes.push(letterIndex);
			loop = false;
			break;
		}
	}

	letter = rooms.room.currentWord.charAt(letterIndex);
	rooms.room.cache.letters.push(letter);
	io.to(room).emit("letter", { letter, index: letterIndex });
}
