require("dotenv").config();
require("./models/db");

const express = require("express");
const path = require("path");
const bodyparser = require("body-parser");
const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const { logger } = require("./tools/loggers");
const gameRouter = require("./routes/game");

const port = process.env.PORT || 3000;

if (!process.env.JWT_SECRET) {
	logger.error("Fatal Error: JWT_SECRET not defined");
	process.exit(1);
}

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.set("views", "./views");
app.use(
	bodyparser.urlencoded({
		extended: true,
	}),
	bodyparser.json(),
);

// Socket stuff
io.on("connection", (client) => {
	logger.info("Client Connected");

	require("pathToSocketRoutesFile1")(client);
	require("pathToSocketRoutesFile2")(client);
	require("pathToSocketRoutesFileN")(client);

	return io;
});

server.listen(port, () => {
	logger.info(`Express server started at port: ${port}`);
});

app.use("/game", gameRouter);
