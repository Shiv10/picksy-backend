/* eslint-disable no-use-before-define */
const socketio = require("socket.io");

const { logger } = require("../tools/loggers");

const users = {};
const names = {};
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
	drawStackX: [],
	drawStackY: []
};
let turn = 0;
let turnOn = false;

module.exports.listen = (app) => {
	const io = socketio.listen(app);

	io.on("connection", (socket) => {
		socket.on("new user", (name) => {
			logger.info("user connected");
			names[name] = socket;
			users[socket.id] = name;
			// logger.info(users);
			// logger.info(names);
			keys = Object.keys(names);
			userCount += 1;
			if (turnOn) {
				previousDrawing(io, name)
			}
		});

		keys = Object.keys(names);
		if (keys.length + 1 === 2) {
			io.emit("start-game");
			room.turn.start = true;
			changeTurn(io);
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
			setTimeout(turnChange, 82000, io);
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
			delete names[users[socket.id]];
			delete users[socket.id];
		});
	});

	return io;
};

function changeTurn() {
	if (!room.turn.start) return;

	room.currentDrawer = Object.keys(names)[turn];
	const n1 = Math.floor(Math.random() * 10);
	const n2 = Math.floor(Math.random() * 10);
	const n3 = Math.floor(Math.random() * 10);
	names[room.currentDrawer].emit("word-selection", {
		w1: words[n1],
		w2: words[n2],
		w3: words[n3],
		round: room.roundNumber
	});
	room.turn.start = false;
}

function roundChange(io) {
	names[room.currentDrawer].emit("turn-end");
	io.emit("canvas-cleared");
	io.emit("round-end");
	room.roundNumber += 1;
	if (room.roundNumber < 3) {
		turn = 0;
		room.turn.start = true;
		turnOn = true;
		changeTurn();
	}
}

function turnChange(io) {
	logger.info("turn over!");
	room.drawStackX = [];
	room.drawStackY = [];
	turn += 1;
	if (turn === userCount) {
		roundChange(io);
		turnOn = false;
	} else {
		names[room.currentDrawer].emit("turn-end");
		io.emit("canvas-cleared");
		room.turn.start = true;
		changeTurn();
	}
}

function previousDrawing(io, name) {
	let l = room.drawStackX.length;
	for (i = 0; i < l; i++) {
		names[name].emit("draw", { x: room.drawStackX[i], y: room.drawStackY[i] })
	}
}
