window.addEventListener("load", () => {
	const canvas = document.getElementById("canvas");
	const ctx = canvas.getContext("2d");
	// eslint-disable-next-line no-undef
	const socket = io("http://localhost:3002");
	const name = prompt("Enter your name!");
	const users = {};

	const messageCon = document.getElementById("message-container");
	const btn = document.getElementById("send-button");
	const msg = document.getElementById("message-input");

	function send() {
		socket.emit("message", { text: msg.value });
		messageCon.innerHTML += `<strong>${name}</strong>: ${msg.value}<br>`;
		msg.value = "";
	}

	btn.addEventListener("click", send);

	socket.on("message", (data) => {
		messageCon.innerHTML += `<strong>${data.name}</strong>: ${data.text}<br>`;
	});

	socket.emit("new user", name);

	canvas.height = 500;
	canvas.width = 500;

	let painting = false;

	function draw(e) {
		if (!painting) return;

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
});
