/* eslint-disable import/extensions */
import { socketURL } from "./config.js";

$(document).ready(() => {
	const roomId = $("#roomId").text();
	const username = $("#username").text();

	const param = `room=${roomId}&username=${username}`;

	const socket = io(`${socketURL}/waitSpace`, { query: param });
	console.log(roomId, username);
	let count = 0;

	$("#enter-game").click((e) => {
		if (count > 0) return;
		socket.emit("start");
		count += 1;
	});

	socket.on("users-list", (userInfo) => {
		console.log(userInfo.users);
	});

	socket.on("redirect", () => {
		window.location.replace(`/game?${roomId}`);
	});
});
