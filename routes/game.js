const express = require("express");
const server = require("http").createServer(express());
const io = require("socket.io")(server);

const logger = require("../tools/loggers");

const router = express.Router();

router.get("/", (req, res) => {
	res.render("index");
});

module.exports = router;
