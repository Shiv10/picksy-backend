const express = require("express");
const http = require("http").createServer(express);
const io = require("socket.io")(http);

const logger = require("../tools/loggers");

const router = express.Router();

router.get("/", async (req, res) => {
	res.send("Working");
});

io.on("connection", (socket) => {
	logger.info("User connected");
});

module.exports = router;
