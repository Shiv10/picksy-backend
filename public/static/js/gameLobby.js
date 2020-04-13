/* eslint-disable import/extensions */
import { socketURL } from "./config.js";

$(document).ready(() => {
	const roomId = $("#roomId").text();
	const username = $("#username").text();

	const param = `room=${roomId}&username=${username}`;

	const socket = io(`${socketURL}/gameSpace`, { query: param });
	console.log(roomId, username);

	$("#enter-game").click((e) => {
		socket.emit("start");
	});

	socket.on("users-list", (userInfo) => {
		console.log(userInfo.users);
	});

	socket.on("redirect", (data) => {
		console.log(JSON.stringify(data));
		console.log(`/game/?roomId=${data.room}&username=${data.username}`);
		// window.location.replace(`/game/?roomId=${data.room}&username=${data.username}`);
		$.get(
			"/game",
			{
				roomId: data.room,
				username: data.username,
			},
			(response) => {
				if (response.success === true) {
					console.log(html);
					$("html").html(response.data);
				}
			},
		);
	});
});
