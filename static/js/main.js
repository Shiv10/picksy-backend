/* eslint-disable no-inner-declarations */
/* eslint-disable no-alert */
/* eslint-disable no-console */
/* eslint-disable no-use-before-define */

// eslint-disable-next-line no-undef
const socket = io(`${window.location.hostname}:3002`);
let name = "";

// eslint-disable-next-line no-constant-condition
while (true) {
	name = prompt("Enter your name");
	if (name !== "") {
		socket.emit("new user", name);
		break;
	}
}

window.addEventListener("load", () => {
	if (name === null) {
		const mainDiv = document.getElementById("main");
		const disconnectMessage = document.getElementById("no-name");
		disconnectMessage.innerHTML = "Please refresh and join again with a name!";
		mainDiv.style.display = "none";
		socket.disconnect();
		return;
	}
	const canvas = document.getElementById("canvas");
	const ctx = canvas.getContext("2d");
	// eslint-disable-next-line no-undef

	const messageCon = document.getElementById("message-container");
	const btn = document.getElementById("send-button");
	const msg = document.getElementById("message-input");
	let canDraw = false;
	const chat = true;
	const wordCon = document.getElementById("word-reveal");

	function send() {
		const timeStamp = new Date();
		const ct = Math.floor(timeStamp.getTime() / 1000);
		if (msg.value === "") return;
		socket.emit("message", { text: msg.value, time: ct });
		messageCon.innerHTML += `<strong>${name}</strong>: ${msg.value}<br>`;
		msg.value = "";
	}

	msg.addEventListener("keyup", (e) => {
		if (e.keyCode === 13) {
			e.preventDefault();
			btn.click();
		}
	});

	btn.addEventListener("click", send);

	socket.on("message", (data) => {
		messageCon.innerHTML += `<strong>${data.name}</strong>: ${data.text}<br>`;
	});

	// Drawing fucntionality started

	const color = "black";

	canvas.height = 500;
	canvas.width = 500;

	let painting = false;

	function draw(e) {
		if (!painting) return;
		if (!canDraw) return;

		const selectedColor = document.getElementById("colorPicker");

		ctx.strokeStyle = selectedColor.value;
		ctx.lineWidth = 5;
		ctx.lineCap = "round";
		const x = e.clientX - 17;
		const y = e.clientY - 17;
		ctx.lineTo(x, y);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(x, y);

		socket.emit("draw", { x, y, color: selectedColor.value });
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
		ctx.strokeStyle = data.color;

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

	// drawing functionality ends

	const wh = document.getElementById("word-holder");
	const dispName = document.getElementById("drawer");
	const selectWord = (data) => {
		console.log("selected");
		console.log("You can draw!");
		dispName.innerHTML = "Your Turn!";
		const d1 = document.getElementById("o1");
		const d2 = document.getElementById("o2");
		const d3 = document.getElementById("o3");
		const se = document.getElementById("sel");

		d1.value = data.w1;
		d2.value = data.w2;
		d3.value = data.w3;

		d1.innerHTML = data.w1;
		d2.innerHTML = data.w2;
		d3.innerHTML = data.w3;

		let selected = false;
		if (data.round === 0) {
			setTimeout(autoSelect, 10000);

			function autoSelect() {
				if (selected) return;
				selectBtn1.click();
			}

			const selectBtn1 = document.getElementById("chose1");
			selectBtn1.style.display = "inline";
			selectBtn1.addEventListener("click", () => {
				selectBtn1.style.display = "none";
				socket.emit("word-selected", { word: se.value });
				wh.innerHTML = `The word you selected is ${se.value}`;
				selected = true;
			});
		} else if (data.round === 1) {
			setTimeout(autoSelect, 10000);

			function autoSelect() {
				if (selected) return;
				selectBtn2.click();
			}
			const selectBtn2 = document.getElementById("chose2");
			selectBtn2.style.display = "inline";
			selectBtn2.addEventListener("click", () => {
				selectBtn2.style.display = "none";
				socket.emit("word-selected", { word: se.value });
				wh.innerHTML = `The word you selected is ${se.value}`;
				selected = true;
			});
		} else if (data.round === 2) {
			setTimeout(autoSelect, 10000);

			function autoSelect() {
				if (selected) return;
				selectBtn3.click();
			}
			const selectBtn3 = document.getElementById("chose3");
			selectBtn3.style.display = "inline";
			selectBtn3.addEventListener("click", () => {
				selectBtn3.style.display = "none";
				socket.emit("word-selected", { word: se.value });
				wh.innerHTML = `The word you selected is ${se.value}`;
				selected = true;
			});
		}
	};

	socket.on("word-selection", (data) => {
		selectWord(data);
	});

	const dispTime = document.getElementById("timer");

	socket.on("word-selected", (data) => {
		if (name === data.name) {
			canDraw = true;
		}
		const timeStamp = new Date();
		const ct = Math.floor(timeStamp.getTime() / 1000);
		console.log(`Time of round start: ${data.time}`);
		console.log(`Current time is ${ct}`);
		dispName.innerHTML = `${data.name} is drawing!`;
		let nextTurn = false;

		socket.on("next-turn", () => {
			nextTurn = true;
		});

		// Timer funtionality
		const t = setInterval(countDown, 1000);
		let p = 81 - (ct - data.time);
		function countDown() {
			p -= 1;
			dispTime.innerHTML = p;
			if (p <= 0 || nextTurn) {
				dispTime.innerHTML = "Turn Over";
				dispName.innerHTML = "";
				wordCon.innerHTML = "";
				clearInterval(t);
			}

			if (p <= 20) {
				socket.emit("no-more-reveal");
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
		messageCon.innerHTML += `<p style = "color:green">${data.name} guessed the word!<br></p>`;
	});

	socket.on("similar-word", (data) => {
		messageCon.innerHTML += `<p style = "color:red">${data.text} is close!<br></p>`;
	});

	socket.on("start-game", () => {
		console.log("game started");
	});

	function revealLetter(data) {
		wordCon.innerHTML += `<strong>${data.letter}</strong> at index: ${data.index}<br>`;
	}

	socket.on("letter", revealLetter);

	function wordsRevealed(data) {
		for (let i = 0; i < data.letters.length; i += 1) {
			wordCon.innerHTML += `<strong>${data.letters[i]}</strong> at index: ${data.indexes[i]}<br>`;
		}
	}
	socket.on("revealed", wordsRevealed);

	function updateScoreboard(points) {
		const board = document.getElementById("scorecard");
		const keys = Object.keys(points);
		const l = keys.length;
		board.innerHTML = "";
		board.innerHTML = "<h4><strong>Scorecard</strong></h4>";
		for (let i = 0; i < l; i += 1) {
			board.innerHTML += `<p>${keys[i]}: ${points[keys[i]]}`;
		}
	}

	socket.on("update-scoreboard", updateScoreboard);
});
