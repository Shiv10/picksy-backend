require("dotenv").config();
require("./models/db");

const express = require("express");
const path = require("path");
const bodyparser = require("body-parser");

const { logger } = require("./tools/loggers");
const gameRouter = require("./routes/game");

const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
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

//Socket stuff
io.on('connection', client => {
	logger.info('Client Connected');
	client.on('event', data => { logger.info('Some event happend'); });
	client.on('disconnect', () => { logger.info('Client disconnected'); });
});

server.listen(port, () => {
	logger.info(`Express server started at port: ${port}`);
});

app.use("/game", gameRouter);
