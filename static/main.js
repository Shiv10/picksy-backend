window.addEventListener("load", () => {
	const canvas = document.getElementById("canvas");
	const ctx = canvas.getContext("2d");
	// eslint-disable-next-line no-undef
	const socket = io("http://localhost:3002");
	let name = "";

	const messageCon = document.getElementById("message-container");
	const btn = document.getElementById("send-button");
	const msg = document.getElementById("message-input");
	canDraw = false;
	chat = true;

	while (true) {
		name = prompt("Enter your name");
		if (name != "") {
			socket.emit("new user", name);
			break;
		}
	}



	function send() {
		if (msg.value == "") return;
		socket.emit("message", { text: msg.value });
		messageCon.innerHTML += `<strong>${name}</strong>: ${msg.value}<br>`;
		msg.value = "";
	}

	btn.addEventListener("click", send);

	socket.on("message", (data) => {
		messageCon.innerHTML += `<strong>${data.name}</strong>: ${data.text}<br>`;
	});


	//Drawing fucntionality started
	canvas.height = 500;
	canvas.width = 500;

	let painting = false;

	function draw(e) {
		if (!painting) return;
		if (!canDraw) return;

		ctx.lineWidth = 5;
		ctx.lineCap = "round";

		ctx.lineTo(e.clientX, e.clientY);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(e.clientX, e.clientY);

		socket.emit("draw", { x: e.clientX, y: e.clientY });
	}

	function startPosition(e) {
		painting = true;
		draw(e);
	}

	function finishedPosition() {
		painting = false;
		ctx.beginPath();
		socket.emit("stop");
	}

	socket.on("draw", (data) => {
		ctx.lineWidth = 5;
		ctx.lineCap = "round";

		ctx.lineTo(data.x, data.y);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(data.x, data.y);
	});

	socket.on("stop", () => {
		ctx.beginPath();
	});

	canvas.addEventListener("mousedown", startPosition);
	canvas.addEventListener("mouseup", finishedPosition);
	canvas.addEventListener("mousemove", draw);

	const clrbtn = document.getElementById("clear-canvas");
	clrbtn.addEventListener("click", clearCanvas);
	function clearCanvas() {
		if (!canDraw) return;
		socket.emit("canvas-cleared");
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}

	socket.on("canvas-cleared", () => {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	});

	//drawing functionality ends

	selectWord = (data) => {
		console.log("selected");
		console.log("You can draw!");
		canDraw = true;
		d1 = document.getElementById("o1");
		d2 = document.getElementById("o2");
		d3 = document.getElementById("o3");
		se = document.getElementById("sel")


		d1.value = data.w1;
		d2.value = data.w2;
		d3.value = data.w3;

		d1.innerHTML = data.w1;
		d2.innerHTML = data.w2;
		d3.innerHTML = data.w3;

		wh = document.getElementById("word-holder");
		selectBtn.style.display = "inline";

		selectBtn.addEventListener("click", () => {
			selectBtn.style.display = "none";
			socket.emit("word-selected", { word: se.value });
			wh.innerHTML = "The word you selected is " + se.value;
		});
	}

	selectBtn = document.getElementById("chose")
	socket.on("word-selection", (data) => {
		selectWord(data);
	});

	dispTime = document.getElementById("timer");

	socket.on("word-selected", (data) => {
		const timeStamp = new Date();
		ct = Math.floor(timeStamp.getTime() / 1000);
		console.log("Time of round start: " + data.time);
		console.log("Current time is " + ct);
		dispName = document.getElementById("drawer");
		dispName.innerHTML = data.name + " is drawing!";

		//Timer funtionality
		t = setInterval(countDown, 1000);
		p = 81 - (ct - data.time);
		function countDown() {
			p--;
			dispTime.innerHTML = p
			if (p <= 0) {
				dispTime.innerHTML = "Turn Over"
				clearInterval(t);
			}
		};
	});

	socket.on("turn-end", () => {
		canDraw = false;
		console.log("Turn end!");
	});

	socket.on("round-end", () => {
		dispTime.innerHTML = "<strong>Round has ended!</strong>";
	});

	socket.on("word-guessed", (data) => {
		messageCon.innerHTML += data.name + " guessed the word!<br>";
	});

	socket.on("start-game", () => {
		console.log("game started");
	});

});