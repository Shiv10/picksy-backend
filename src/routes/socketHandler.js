/* eslint-disable quote-props */
/* eslint-disable linebreak-style */
/* eslint-disable no-use-before-define */
import socketio from "socket.io";
import redis from "redis";

import constants from "../tools/constants";
import { logger } from "../tools/loggers";
import { players, rooms } from "../actions/initFill";
import Game from "../actions/gameCalls";
import Room from "../actions/roomCalls";
import RoomStore from "../models/room.model";

// const client = redis.createClient({
// 	host: process.env.REDIS_HOST,
// 	password: process.env.REDIS_PASSWORD,
// });

// client.flushall();

export default (app) => {
	const io = socketio.listen(app);

	const waitSpace = io.of("/waitSpace");
	waitSpace.on("connection", async (socket) => {
		logger.info("User Connected to Waiting room!");

		const { username, room } = socket.handshake.query;
		await socket.join(room);

		logger.info(JSON.stringify(socket.rooms));
		logger.info(JSON.stringify(io.sockets.adapter.rooms));
		if (!io.sockets.adapter.rooms[room].storage) {
			initStorage(io, room);
		}

		storage(io, room).users[socket.id] = username;
		const allUsersInRoom = storage(io, room).storage.users.values();

		waitSpace.to(room).emit("users-list", {
			users: allUsersInRoom,
		});

		if (storage(io, room).keys.length > 1) {
			socket.emit("redirect");
		}

		socket.on("start", () => {
			storage(io, room).startCount += 1;
			if (storage(io, room).startCount > 1) {
				waitSpace.to(room).emit("redirect");
			}
		});

		socket.on("disconnect", () => {
			storage(io, room).startCount -= 1;
		});
	});

	const gameSpace = io.of("/gameSpace");
	gameSpace.on("connection", (socket) => {
		logger.info("Connected to game");
		const { room } = socket.handshake;
		const gamePlay = new Game({
			socket,
		});
		socket.join(room);

		socket.on("new user", (data) => {
			logger.info("user connected");
			gamePlay.initGame(data);

			if (rooms[data.room].turnOn) {
				gamePlay.previousDrawing(gameSpace, data.name, data.room);
				gameSpace.to(rooms[data.room].currentDrawerId).emit("send-data");
			}

			if (rooms[data.room].keys.length === 2) {
				gameSpace.to(data.room).emit("start-game");
				rooms[data.room].turn.start = true;
				gamePlay.selectDrawer(gameSpace, data.room);
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
			gameSpace.to(data.room).emit("word-selected", { name: rooms[data.room].currentDrawer, time: ct });
			rooms[data.room].turnOn = true;
			rooms[data.room].timeout = setTimeout(
				() => {
					gamePlay.turnChange(gameSpace, data.room);
				},
				constants.timeOfRound,
				gameSpace,
				data.room,
			);
			const wordRevealTime = Math.floor(60 / Math.floor(rooms[data.room].currentWord.length / 2));
			rooms[data.room].wordRevealInterval = setInterval(
				gamePlay.revealLetter,
				wordRevealTime * 1000,
				gameSpace,
				data.room,
			);
			rooms[data.room].cleared = false;
		});

		socket.on("message", (data) => {
			if (
				data.text === rooms[data.room].currentWord
				&& rooms[data.room].users[socket.id] !== rooms[data.room].currentDrawer
			) {
				if (rooms[data.room].usersGuessedName.includes(rooms[data.room].users[socket.id])) return;
				rooms[data.room].points[rooms[data.room].users[socket.id]] += gamePlay.calculatePoints(data.time, data.room);
				rooms[data.room].usersGuessed += 1;
				rooms[data.room].usersGuessedName.push(rooms[data.room].users[socket.id]);
				gameSpace.to(data.room).emit("word-guessed", { name: rooms[data.room].users[socket.id] });
				if (rooms[data.room].usersGuessed === rooms[data.room].userCount - 1) {
					gameSpace.to(data.room).emit("next-turn");
					clearTimeout(rooms[data.room].timeout);
					gamePlay.turnChange(gameSpace, data.room);
				}
			} else {
				const similarity = gamePlay.checkSimilarity(data.text, data.room);
				if (similarity >= 0.55) {
					gameSpace.to(data.room).emit("similar-word", { text: data.text });
				} else {
					socket.to(data.room).broadcast.emit("message", {
						name: rooms[data.room].users[socket.id],
						text: data.text,
					});
				}
			}
		});

		socket.on("fill", (data) => {
			socket.to(data.room).broadcast.emit("fill", data);
		});

		socket.on("draw", (data) => {
			socket.to(data.room).broadcast.emit("draw", data);
		});

		socket.on("undo", (data) => {
			socket.to(data.room).broadcast.emit("state", data);
		});

		socket.on("state", (data) => {
			gameSpace.to(data.room).emit("state", data);
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
			const userRoom = players[socket.id];
			logger.info(`${rooms[userRoom].users[socket.id]} disconnected`);
			if (rooms[userRoom].userCount <= 2) {
				gamePlay.resetRoom(userRoom);
				logger.info("Room variable reset");
				gameSpace.to(userRoom).emit("leave");
				return;
			}
			// delete[room.points[socket.id]]; Skribbl.io it doesn't remove user from scoreboard
			// on disconnection, but we can add this functionality
			rooms[userRoom].userCount -= 1;
			if (rooms[userRoom].users[socket.id] === rooms[userRoom].currentDrawer && rooms[userRoom].userCount > 1) {
				logger.info("Drawer disconnected!");
				gamePlay.drawerDisconnected(gameSpace, rooms[userRoom].timeout, userRoom);
			}
			delete rooms[userRoom].users[socket.id];
		});
	});

	const nsp = io.of("/room-data");
	nsp.on("connection", (socket) => {
		const room = new Room({
			socket,
			rooms,
		});

		logger.info("Client Connected");
		const playersInRooms = room.getRoomInfo();
		const roomList = Object.keys(rooms);
		socket.emit("info", { playersInRooms, roomList });
	});

	return io;
};

async function storage(io, roomId) {
	return io.sockets.adapter.rooms[roomId].storage;
}

async function initStorage(io, roomId) {
	const currStorage = {
		roomId,
		type: "PUB",
		userCount: 0,
		users: [],
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
		wordRevealInterval: false,
		timeout: false,
		cleared: false,
		cache: {
			indexes: [],
			letters: [],
		},
		keys: [],
		startCount: 0,
	};

	io.sockets.adapter.rooms[roomId].storage = currStorage;
}
