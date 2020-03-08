window.addEventListener("load", () => {
	const login = document.getElementById("login");
	login.addEventListener("click", () => {
		fetch("/rooms").then(() => {
			console.log("Welcome to rooms page");
		});
	});
});
