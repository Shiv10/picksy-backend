/* eslint-disable quote-props */
/* eslint-disable linebreak-style */
/* eslint-disable no-use-before-define */
import socketio from "socket.io";

import * as constants from "../tools/constants";
import { logger } from "../tools/loggers";
import { players, rooms } from "../actions/initFill";
import Game from "../actions/gameCalls";
import Room from "../actions/roomCalls";

module.exports.listen = (app) => {
	const io = socketio.listen(app);

	const waitSpace = io.of("/waitSpace");
	waitSpace.on("connection", (socket) => {
		logger.info("User Connected to Waiting room!");
		const room = socket.handshake.query.userRoom;
		socket.join(room);

		if (rooms[room].startCount > 1) {
			socket.emit("redirect");
		}
		socket.on("start", (clientRoom) => {
			rooms[clientRoom].startCount += 1;
			if (rooms[clientRoom].startCount > 1) {
				waitSpace.to(clientRoom).emit("redirect");
			}
		});
	});

	const gameSpace = io.of("/gameSpace");
	gameSpace.on("connection", (socket) => {
		logger.info("Connected to game");
		const room = socket.handshake.query.userRoom;
		const game = new Game({
			socket,
		});

		socket.join(room);

		socket.on("new user", (data) => {
			logger.info("user connected");
			game.initGame(socket, data);

			if (rooms[data.room].turnOn) {
				game.previousDrawing(gameSpace, data.name, data.room);
			}
			if (rooms[data.room].keys.length === 2) {
				gameSpace.to(data.room).emit("start-game");
				rooms[data.room].turn.start = true;
				game.selectDrawer(gameSpace, data.room);
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
			rooms[data.room].timeout = setTimeout(game.turnChange, constants.timeOfRound, gameSpace, data.room);
			const wordRevealTime = Math.floor(60 / Math.floor(rooms[data.room].currentWord.length / 2));
			rooms[data.room].wordRevealInterval = setInterval(game.revealLetter, wordRevealTime * 1000, gameSpace, data.room);
			rooms[data.room].cleared = false;
		});

		socket.on("message", (data) => {
			if (
				data.text === rooms[data.room].currentWord
				&& rooms[data.room].users[socket.id] !== rooms[data.room].currentDrawer
			) {
				if (rooms[data.room].usersGuessedName.includes(rooms[data.room].users[socket.id])) return;
				// eslint-disable-next-line no-undef
				t = data.time - rooms[data.room].turn.timeStart;
				rooms[data.room].points[rooms[data.room].users[socket.id]] += game.calculatePoints(data.time, data.room);
				rooms[data.room].usersGuessed += 1;
				rooms[data.room].usersGuessedName.push(rooms[data.room].users[socket.id]);
				gameSpace.to(data.room).emit("word-guessed", { name: rooms[data.room].users[socket.id] });
				if (rooms[data.room].usersGuessed === rooms[data.room].userCount - 1) {
					gameSpace.to(data.room).emit("next-turn");
					clearTimeout(rooms[data.room].timeout);
					game.turnChange(gameSpace, data.room);
				}
			} else {
				const similarity = game.checkSimilarity(data.text, data.room);
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
			const userRoom = players[socket.id];
			logger.info(`${rooms[userRoom].users[socket.id]} disconnected`);
			if (rooms[userRoom].userCount <= 2) {
				game.resetRoom(userRoom);
				gameSpace.to(userRoom).emit("leave");
				return;
			}
			// delete[room.points[socket.id]]; Scribble.io it doesn't remove user from scoreboard
			// on disconnection, but we can add this functionality
			rooms[userRoom].userCount -= 1;
			if (rooms[userRoom].users[socket.id] === rooms[userRoom].currentDrawer && rooms[userRoom].userCount > 1) {
				delete rooms[userRoom].users[socket.id];
				logger.info("Drawer disconnected!");
				game.drawerDisconnected(gameSpace, rooms[userRoom].timeout, userRoom);
			} else {
				delete rooms[userRoom].users[socket.id];
			}
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
