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

	const gameSpace = io.of("/gameSpace");
	gameSpace.on("connection", (socket) => {
		logger.info("Connected to game");
		logger.info("User Connected to Waiting room!");

		const { username, room } = socket.handshake.query;
		socket.join(room, () => {});

		if (!io.of("/gameSpace").adapter.rooms[room].storage) {
			initStorage(io, room);
			logger.info(JSON.stringify(io.of("/gameSpace").adapter.rooms[room].storage));
		}

		storage(io, room).users[socket.id] = username;
		const allUsersInRoom = storage(io, room).users.values();

		gameSpace.to(room).emit("users-list", {
			users: allUsersInRoom,
		});

		if (storage(io, room).keys.length > 1) {
			socket.emit("redirect", { room, username });
		}

		socket.on("start", () => {
			storage(io, room).startCount += 1;
			if (storage(io, room).startCount > 1) {
				gameSpace.to(room).emit("redirect", { room, username });
			}
		});



		const gamePlay = new Game({
			socket,
			io,
		});

		socket.on("new user", (data) => {
			logger.info("user connected");
			gamePlay.initGame(data);

			if (storage(io, room).turnOn) {
				gamePlay.previousDrawing(gameSpace, data.name, data.room);
				gameSpace.to(storage(io, room).currentDrawerId).emit("send-data");
			}

			if (storage(io, room).keys.length === 2) {
				gameSpace.to(data.room).emit("start-game");
				storage(io, room).turn.start = true;
				gamePlay.selectDrawer(gameSpace, data.room);
			}

			if (storage(io, room).keys.length > 2) {
				socket.emit("start-game");
				if (storage(io, room).turnOn) {
					socket.emit("word-selected", {
						name: storage(io, room).currentDrawer,
						time: storage(io, room).turn.timeStart,
					});
				}
			}
		});

		socket.on("word-selected", (data) => {
			const timeStamp = new Date();
			logger.info(data.word);
			storage(io, room).currentWord = data.word;
			const ct = Math.floor(timeStamp.getTime() / 1000);
			storage(io, room).turn.timeStart = ct;
			gameSpace.to(data.room).emit("word-selected", { name: storage(io, room).currentDrawer, time: ct });
			storage(io, room).turnOn = true;
			storage(io, room).timeout = setTimeout(
				() => {
					gamePlay.turnChange(gameSpace, data.room);
				},
				constants.timeOfRound,
				gameSpace,
				data.room,
			);
			const wordRevealTime = Math.floor(60 / Math.floor(storage(io, room).currentWord.length / 2));
			storage(io, room).wordRevealInterval = setInterval(
				gamePlay.revealLetter,
				wordRevealTime * 1000,
				gameSpace,
				data.room,
			);
			storage(io, room).cleared = false;
		});

		socket.on("message", (data) => {
			if (
				data.text === storage(io, room).currentWord
				&& storage(io, room).users[socket.id] !== storage(io, room).currentDrawer
			) {
				if (storage(io, room).usersGuessedName.includes(storage(io, room).users[socket.id])) return;
				storage(io, room).points[storage(io, room).users[socket.id]] += gamePlay.calculatePoints(data.time, data.room);
				storage(io, room).usersGuessed += 1;
				storage(io, room).usersGuessedName.push(storage(io, room).users[socket.id]);
				gameSpace.to(data.room).emit("word-guessed", { name: storage(io, room).users[socket.id] });
				if (storage(io, room).usersGuessed === storage(io, room).userCount - 1) {
					gameSpace.to(data.room).emit("next-turn");
					clearTimeout(storage(io, room).timeout);
					gamePlay.turnChange(gameSpace, data.room);
				}
			} else {
				const similarity = gamePlay.checkSimilarity(data.text, data.room);
				if (similarity >= 0.55) {
					gameSpace.to(data.room).emit("similar-word", { text: data.text });
				} else {
					socket.to(data.room).broadcast.emit("message", {
						name: storage(io, room).users[socket.id],
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
			clearInterval(storage(io, room).wordRevealInterval);
			storage(io, room).cache.indexes = [];
			storage(io, room).cache.letters = [];
			storage(io, room).cleared = true;
		});

		socket.on("disconnect", () => {
			logger.info(`${storage(io, room).users[socket.id]} disconnected`);
			if (storage(io, room).userCount <= 2) {
				gamePlay.resetRoom(room);
				logger.info("Room variable reset");
				gameSpace.to(room).emit("leave");
				return;
			}
			// delete[room.points[socket.id]]; Skribbl.io it doesn't remove user from scoreboard
			// on disconnection, but we can add this functionality
			storage(io, room).userCount -= 1;
			storage(io, room).startCount -= 1;

			if (storage(io, room).users[socket.id] === storage(io, room).currentDrawer && storage(io, room).userCount > 1) {
				logger.info("Drawer disconnected!");
				gamePlay.drawerDisconnected(gameSpace, storage(io, room).timeout, room);
			}
			delete storage(io, room).users[socket.id];
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

function storage(io, roomId) {
	return io.of("/gameSpace").adapter.rooms[roomId].storage;
}

function initStorage(io, roomId) {
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

	io.of("/gameSpace").adapter.rooms[roomId].storage = currStorage;
}
