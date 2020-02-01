const socketio = require("socket.io");
const { logger } = require("../tools/loggers");

const users = {};









module.exports.listen = (app) => {
	const io = socketio.listen(app);

	io.on("connection", (socket) => {
		// logger.info("Client connected");

		socket.on("new user", (name)=>{
			logger.info("user connected");
			users[socket.id] = name;
			//logger.info(users);
			console.log(users);
		});
		socket.on("message", (data) => {
			socket.broadcast.emit("message", {
				name: users[socket.id],
				text: data.text,
			});
		});
		socket.on("draw", (data)=>{
			socket.broadcast.emit("draw", data);
		});

		socket.on("stop", ()=>{
			socket.broadcast.emit("stop");
		});

		socket.on("disconnect", ()=>{
			logger.info("disconnected");
			delete users[socket.id];

		});


	});

	return io;
};
