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

	wh = document.getElementById("word-holder");
	dispName = document.getElementById("drawer");
	selectWord = (data) => {
		console.log("selected");
		console.log("You can draw!");
		canDraw = true;
		dispName.innerHTML = "Your Turn!";
		d1 = document.getElementById("o1");
		d2 = document.getElementById("o2");
		d3 = document.getElementById("o3");
		se = document.getElementById("sel");

		d1.value = data.w1;
		d2.value = data.w2;
		d3.value = data.w3;

		d1.innerHTML = data.w1;
		d2.innerHTML = data.w2;
		d3.innerHTML = data.w3;

		selectBtn = document.getElementById("chose1");

		if (data.round == 0) {
			selectBtn1 = document.getElementById("chose1");
			selectBtn1.style.display = "inline";
			selectBtn1.addEventListener("click", () => {
				selectBtn1.style.display = "none";
				socket.emit("word-selected", { word: se.value });
				wh.innerHTML = "The word you selected is " + se.value;
			});
		} else if (data.round == 1) {
			selectBtn2 = document.getElementById("chose2");
			selectBtn2.style.display = "inline";
			selectBtn2.addEventListener("click", () => {
				selectBtn2.style.display = "none";
				socket.emit("word-selected", { word: se.value });
				wh.innerHTML = "The word you selected is " + se.value;
			});
		} else if (data.round == 2) {
			selectBtn3 = document.getElementById("chose3");
			selectBtn3.style.display = "inline";
			selectBtn3.addEventListener("click", () => {
				selectBtn3.style.display = "none";
				socket.emit("word-selected", { word: se.value });
				wh.innerHTML = "The word you selected is " + se.value;
			});
		}
	};

	socket.on("word-selection", (data) => {
		selectWord(data);
	});

	dispTime = document.getElementById("timer");

	socket.on("word-selected", (data) => {
		const timeStamp = new Date();
		ct = Math.floor(timeStamp.getTime() / 1000);
		console.log("Time of round start: " + data.time);
		console.log("Current time is " + ct);
		dispName.innerHTML = data.name + " is drawing!";
		drawerDisconnedted = false;

		socket.on("drawer-disconnected", () => {
			drawerDisconnedted = true;
		});

		//Timer funtionality
		t = setInterval(countDown, 1000);
		p = 31 - (ct - data.time);
		function countDown() {
			p--;
			dispTime.innerHTML = p;
			if (p <= 0 || drawerDisconnedted) {
				console.log("drawer gone!");
				dispTime.innerHTML = "Turn Over";
				dispName.innerHTML = "";
				clearInterval(t);
			}
		}
	});

	socket.on("turn-end", () => {
		canDraw = false;
		console.log("Turn end!");
		wh.innerHTML = "";
		dispName.innerHTML = "";
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
