const socketio = require("socket.io");
const { logger } = require("../tools/loggers");

const users = {};
names = {};
const keys=[]
words=["pen","paper","glasses","bottle","keyboard","sun","hills","glue","keys","box"]
uc = 0;

const room ={
	roundNumber: 0,
	turn : {
		start: false,
		timeStart: 0.0
	},
	currentWord : "",
	currentDrawer : ""
}
turn =0 ;
turnOn = false;

module.exports.listen = (app) => {
	const io = socketio.listen(app);

	io.on("connection", (socket) => {
		// logger.info("Client connected");
		// gameStart (initial)
		// RoundStart (drawer select)
		// wordSelection (send timestamp, (give 5 secs), give word options, select the word)

		// - broadcast Timer (send timestamp)
		// - canvas Draw (send matrix to all clients)

		// playerJoin (create stack, add draw points to it, emit the stack, contents)
		// chat MessageChannel (correct, wrong, close guesses all handled here)
		// display score (score at end of each round)

		socket.on("new user", (name)=>{
			logger.info("user connected");
			names[name] = socket;
			users[socket.id] = name;
			//logger.info(users);
			// console.log(names);
			keys=Object.keys(names);
			uc++;

		});

		keys=Object.keys(names);
		if((keys.length+1)==2){
			io.emit("start-game");
			room.turn.start = true;
			changeTurn();
		}

		function changeTurn(){
			if(!room.turn.start) return;

			room.currentDrawer = keys[turn];
			n1 = Math.floor(Math.random()*10);
			n2 = Math.floor(Math.random()*10);
			n3 = Math.floor(Math.random()*10);
			names[room.currentDrawer].emit("word-selection",{w1: words[n1], w2: words[n2], w3: words[n3]});
			room.turn.start = false;
		};

		
		if((keys.length+1)>2){
			socket.emit("start-game");
			if(turnOn){
				socket.emit("word-selected",{name: room.currentDrawer, time: room.turn.timeStart});
			}
			
		}

		socket.on("word-selected",(data)=>{
			const timeStamp= new Date();
			console.log(data.word);
			room.currentWord = data.word;
			ct = Math.floor(timeStamp.getTime()/1000);
			room.turn.timeStart = ct;
			io.emit("word-selected",{name: room.currentDrawer, time: ct});
			turnOn = true;
			setTimeout(turnChange,82000);
			function turnChange(){
				console.log("turn over!");
				turn++;
				if(turn==uc){
					roundChange();
					turnOn = false;
				}
				//names[room.currentDrawer].emit("round-end");
				else{
					names[room.currentDrawer].emit("turn-end");
					io.emit("canvas-cleared");
					room.turn.start=true;
					changeTurn();
				}
			};
		});

		function roundChange(){
			names[room.currentDrawer].emit("turn-end");
			io.emit("round-end");
			room.roundNumber++;
		}

		socket.on("message", (data) => {
			if(data.text == room.currentWord){
				console.log(users[socket.id]+" guessed!");
				io.emit("word-guessed",{name: users[socket.id]});
			}
			else{
				socket.broadcast.emit("message", {
					name: users[socket.id],
					text: data.text
				});
			}
			
		});
		
		socket.on("draw", (data)=>{
			socket.broadcast.emit("draw", data);
		});

		socket.on("stop", ()=>{
			socket.broadcast.emit("stop");
		});

		socket.on("canvas-cleared",()=>{
			socket.broadcast.emit("canvas-cleared");
		})

		socket.on("disconnect", ()=>{
			logger.info("disconnected");
			delete names[users[socket.id]];
			// console.log(names);
			delete users[socket.id];
		});


	});

	return io;
};
