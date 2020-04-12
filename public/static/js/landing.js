/* eslint-disable import/extensions */
import { socketURL, httpURL } from "./config.js";

$(document).ready(() => {
	$("#play").click((e) => {
		e.preventDefault();
		if ($("#username").val() === "") {
			$("#error").html("!Username is required");
			return;
		}

		$.post("/game/getID", {
			username: $("#username").val(),
			createNew: false,
		}, (response) => {
			if (response.success === true) {
				window.location.replace(`/game/lobby/?roomId=${response.data.roomId}&username=${response.data.username}`);
			}
		});
	});
});
