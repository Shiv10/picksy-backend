/* eslint-disable no-use-before-define */
const socketio = require("socket.io");
const constants = require("../tools/constants");

const { logger } = require("../tools/loggers");

const users = {}; // socket_id -> username

let keys = [];
const words = [
	"pen",
	"paper",
	"glasses",
	"bottle",
	"keyboard",
	"sun",
	"hills",
	"glue",
	"keys",
	"box",
];
let userCount = 0;

const room = {
	roundNumber: 0,
	turn: {
		start: false,
		timeStart: 0.0,
	},
	currentWord: "",
	currentDrawer: "",
	currentDrawerId: "",
	drawStackX: [],
	drawStackY: [],
};
let turn = 0;
let turnOn = false;

module.exports.listen = (app) => {
	const io = socketio.listen(app);

	io.on("connection", (socket) => {
		logger.info(JSON.stringify(constants));
		socket.on("new user", (name) => {
			logger.info("user connected");
			users[socket.id] = name;
			// logger.info(users);
			// logger.info(names);
			keys = Object.values(users);
			userCount += 1;
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
			setTimeout(turnChange, 10000, io);
		});

		socket.on("message", (data) => {
			if (data.text === room.currentWord) {
				logger.info(`${users[socket.id]} guessed!`);
				io.emit("word-guessed", { name: users[socket.id] });
			} else {
				socket.broadcast.emit("message", {
					name: users[socket.id],
					text: data.text,
				});
			}
		});

		socket.on("draw", (data) => {
			room.drawStackX.push(data.x);
			room.drawStackY.push(data.y);
			socket.broadcast.emit("draw", data);
		});

		socket.on("stop", () => {
			socket.broadcast.emit("stop");
		});

		socket.on("canvas-cleared", () => {
			socket.broadcast.emit("canvas-cleared");
		});

		socket.on("disconnect", () => {
			logger.info(users[socket.id] + " disconnected");
			if (users[socket.id] == room.currentDrawer) {
				console.log("Drawer disconnected!");
			}
			delete users[socket.id];
			userCount--;
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
	userIds = Object.keys(users);
	for (i = 0; i < userCount; i++) {
		if (users[userIds[i]] == room.currentDrawer) {
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
	logger.info("Round end!")
	logger.info(constants.roundNum);
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
	room.drawStackX = [];
	room.drawStackY = [];
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

	drawId = "";
	userIds = Object.keys(users);
	for (i = 0; i < userCount; i++) {
		if (users[userIds[i]] == name) {
			drawId = userIds[i];
			break;
		}
	}

	let l = room.drawStackX.length;
	for (i = 0; i < l; i++) {
		io.to(drawId).emit("draw", { x: room.drawStackX[i], y: room.drawStackY[i] });
	}
	io.to(drawId).emit("stop");
}
