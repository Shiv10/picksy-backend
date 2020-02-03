const socketio = require("socket.io");
const { logger } = require("../tools/loggers");

const users = {};
keys=[]
words=["pen","paper","glasses","bottle","keyboard","sun","hills","glue","keys","box"]

module.exports.listen = (app) => {
	const io = socketio.listen(app);

	io.on("connection", (socket) => {
		// logger.info("Client connected");

		socket.on("new user", (name)=>{
			logger.info("user connected");
			users[socket.id] = name;
			//logger.info(users);
			console.log(users);
			keys=Object.keys(users);
		
			if(keys.length>2){
				console.log("Begin game");
				num = Math.floor(10*Math.random());
				 w = words[num];
				console.log(w);
				io.emit("start",{word:w, name:users[keys[0]]});
			}

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

		socket.on("matched",(data)=>{
			socket.broadcast.emit("matched",data)
		})

	});

	return io;
};
