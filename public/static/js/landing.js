/* eslint-disable import/extensions */
import { socketURL, httpURL } from "./config.js";

$(document).ready(() => {
	$("#play").click((e) => {
		e.preventDefault();
		if ($("#username").val() === "") {
			$("#error").html("!Username is required");
			return;
		}

		$.get("/game/getID", {
			username: $("#username").val(),
			createNew: false,
		}, (data) => {
			document.write(data);
		});
	});
});
