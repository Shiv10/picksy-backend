/* eslint-disable import/extensions */
/* eslint-disable no-undef */
import { socketURL } from "./config.js";

$(document).ready(() => {
	const roomId = $("#roomId");
	const socket = io(`${socketURL}/waitSpace`, { query: `userRoom=${roomId}` });
	let count = 0;
	$("button").click((e) => {
		if (count > 0) return;
		socket.emit("start", roomId);
		count += 1;
	});
	socket.on("redirect", () => {
		window.location.replace(`/game?${roomId}`);
	});
});
