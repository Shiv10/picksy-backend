/* eslint-disable no-undef */
$(document).ready(() => {
	let count = 0;
	$("button").click((e) => {
		if (count > 0) return;
		const t = e.target.id;
		console.log(t);
		$.ajax({
			url: "/rooms",
			type: "post",
			data: { room: t },
			dataType: "json",
			complete: () => {
				// called when complete
				console.log("process complete");
				window.location.replace("/waitingRoom");
			},
		});
		count += 1;
	});
});
