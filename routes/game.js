const socketio = require("socket.io");
const { logger } = require("../tools/loggers");

const users = {};
let socket;

const newUserConnected = (name) => {
	logger.info("user connected");
	users[socket.id] = name;
	logger.info(users);
};

const chatMessage = (data) => {
	socket.broadcast.emit("message", {
		name: users[socket.id],
		text: data.text,
	});
};

const canvasDraw = (data) => {
	// console.log(users[socket.id]+' drew');
	// console.log(data.x);
	// console.log(data.y);
	socket.broadcast.emit("draw", data);
};

const stop = () => {
	socket.broadcast.emit("stop");
};

const disconnect = () => {
	logger.info("disconnected");
	delete users[socket.id];
};

module.exports.listen = (app) => {
	const io = socketio.listen(app);

	io.sockets.on("connection", (soc) => {
		socket = soc;
		logger.info("Client connected");

		socket.on("new user", newUserConnected);
		socket.on("message", chatMessage);
		socket.on("draw", canvasDraw);
		socket.on("stop", stop);

		socket.on("disconnect", disconnect);
	});

	return io;
};
