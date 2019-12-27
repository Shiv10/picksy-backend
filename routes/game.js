const express = require("express");
const server = require("http").createServer().listen(3000);
const io = require("socket.io")(server, {
	path: "/game",
});

const logger = require("../tools/loggers");

const router = express.Router();

router.get("/", async (req, res) => {
	res.render("index");
});

io.on("connection", (client) => {
	logger.logger.info("User connected");
});

module.exports = router;
