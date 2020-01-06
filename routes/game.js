const { logger } = require("../tools/loggers");

let gameSocket;
const rooms = {};
let words = [];

function randomProperty(object) {
	const keys = Object.keys(object);
	return keys[Math.floor(keys.length * Math.random())];
}

const playerJoinRoom = (data) => {
	const { gameID } = data;
	data.mySocketID = this.id;
	this.join(gameID.toString());
	this.in(gameID).emit("playerJoinedRoom", data);
};

const startNewMatch = (data) => {
	const { gameID } = data;
	try {
		const roomSize = io.sockets.adapter.rooms[gameID.toString()].length;
		// Will throw error on roomSize=0, as rooom isn't yet created
		if (roomSize >= 2) {
			rooms[data] = "playing";
			this.in(gameID).emit("newMatchStarted", data);
		}
	} catch (err) {
		const roomSize = 0;
	}
};

function createNewRound(data) {
	const gameID = Math.random() * 10 || 0;
	data.gameID = gameID;
	data.mySocketID = this.id;
	this.join(gameID.toString());
	this.emit("newRoundStarted", data);
}

function updatePlayerPlayersServer(data) {
	io.sockets.in(data[0].gameID).emit("updatePlayerPlayers", data);
}
function chatMessage(chatData) {
	io.sockets.in(chatData.gameID).emit("newChatMessage", chatData);
}
function startGame(data) {
	// logger.log(data);
	io.sockets.in(data).emit("prepareStartGame", {
		word: words.arr[Math.floor(words.arr.length * Math.random())],
	});
	rooms[data] = "playing";
}
function mousemove(data, drawerWindowSize) {
	this.broadcast.to(data.gameID).emit("isMoving", data, drawerWindowSize);
}
function gameEnd(data) {
	// {winner_name}
	// logger.info(data);
	rooms[data.gameID] = "waiting";
	io.sockets.in(data.gameID).emit("gameEnded", data.name);
}
function updateServerChatHistory(data, chatHistory) {
	io.sockets.in(data.gameID).emit("saveChatHistory", chatHistory);
}
function startDrawingTimer(data, turnLength, start) {
	io.sockets.in(data).emit("startTimer", turnLength, start);
}
function broadcastTimer(data, secs) {
	io.sockets.in(data).emit("updateTimer", secs);
}
function givePoints(data) {
	// logger.log(data.gameID);
	io.sockets.in(data.gameID).emit("updateUserPoints", data);
}
function broadcastNewColor(gameID, color) {
	io.sockets.in(gameID).emit("receiveNewColor", color);
}
function broadcastNewThickness(gameID, drawThickness) {
	io.sockets.in(gameID).emit("receiveNewDrawThickness", drawThickness);
}
function restartDrawPath(data) {
	io.sockets.in(data).emit("restartPath");
}
function updateTurn(data) {
	this.broadcast.to(data.gameID).emit("updatePlayerTurn", data);
}
function clearCurrentCanvas(data) {
	io.sockets.in(data).emit("clearDrawingCanvas");
}
function playerLeft(data, userInformation) {
	io.sockets.in(data).emit("userHasLeft", userInformation);
}
const endGameLobby = (data) => {
	io.sockets.in(data).emit("gameEndedLobby");
};

const initGame = (socket, wordList) => {
	// client --> server --> clients (chat message from client)
	gameSocket = socket;
	words = wordList;

	gameSocket.emit("connected", { message: "You are connected!" });

	// Host Events
	gameSocket.on("startNewMatch", startNewMatch);
	gameSocket.on("createNewRound", createNewRound);
	gameSocket.on("playerJoinRoom", playerJoinRoom);
	gameSocket.on("updatePlayerPlayersServer", updatePlayerPlayersServer);
	gameSocket.on("chatMessage", chatMessage);
	gameSocket.on("startGame", startGame);
	gameSocket.on("mousemove", mousemove);
	gameSocket.on("gameEnd", gameEnd);
	gameSocket.on("updateServerChatHistory", updateServerChatHistory);
	gameSocket.on("startDrawingTimer", startDrawingTimer);
	gameSocket.on("givePoints", givePoints);
	gameSocket.on("broadcastTimer", broadcastTimer);
	gameSocket.on("broadcastNewColor", broadcastNewColor);
	gameSocket.on("broadcastNewThickness", broadcastNewThickness);
	gameSocket.on("restartDrawPath", restartDrawPath);
	gameSocket.on("updateTurn", updateTurn);
	gameSocket.on("clearCurrentCanvas", clearCurrentCanvas);
	gameSocket.on("playerLeft", playerLeft);
	gameSocket.on("endGameLobby", endGameLobby);
};

const gameRouter = (io) => {
	logger.info(io);
};

module.exports = { gameRouter };
