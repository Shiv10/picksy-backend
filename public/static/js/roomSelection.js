/* eslint-disable import/extensions */
/* eslint-disable no-undef */
import { socketURL } from "./config.js";

$(document).ready(() => {
	const socket = io(`${socketURL}/room-data`);
	socket.on("info", (data) => {
		for (let i = 0; i < data.roomList.length; i += 1) {
			console.log(`${data.roomList[i]}: ${data.playersInRooms[i]}`);
		}
	});
	let count = 0;
	const join = document.getElementById("join");
	const room = document.getElementById("room");
	join.addEventListener("click", () => {
		if (count > 0) return;
		if (room.value === "") return;
		$.ajax({
			url: "/home/getRoomId",
			type: "post",
			data: { roomId: room.value },
			dataType: "application/json",
			complete: () => {
				window.location.replace("/gameLobby");
			},
		});
		count += 1;
	});
});
