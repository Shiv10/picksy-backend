/* eslint-disable import/extensions */
import { socketURL } from "./config.js";

$(document).ready(() => {
	$("#play").click((e) => {
		e.preventDefault();
		if (!$("#username")) {
			$("error").html("!Username is required");
		}
		const data = {
			username,
			createNew: false,
		};

		$.ajax({
			type: "POST",
			data,
			contentType: "application/json",
			url: "/game",
			success: (response) => {
				if (response.success) {
					window.replace(`/game=${response.data}`);
				} else {
					window.replace("/");
				}
			},
		});
	});
});
