/* eslint-disable no-undef */
$(document).ready(() => {
	const room = document.getElementById("room");
	const roomVal = room.innerHTML;
	const socket = io(`${window.location.hostname}:3002/wait`, { query: `userRoom=${roomVal}` });
	let count = 0;
	$("button").click((e) => {
		if (count > 0) return;
		socket.emit("start", roomVal);
		count += 1;
	});
	socket.on("redirect", () => {
		window.location.replace("/index");
	});
});
