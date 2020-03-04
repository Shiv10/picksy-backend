const route = require("express").Router();

route.get("/rooms", (req, res) => {
	res.send("landingPage");
});

module.exports = route;
