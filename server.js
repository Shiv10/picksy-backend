require("dotenv").config();
// require("./models/db");

const express = require("express");
const bodyparser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const app = express();
const server = require("http").Server(app);
const io = require("./routes/game").listen(server);

const { logger } = require("./tools/loggers");
// const register = require("./routes/register.js");
const rooms = require("./routes/room");
const waitingRoom = require("./routes/waiting");

const port = parseInt(process.env.PORT, 10) || 3001;

process.env.JWT_SECRET = "abcd";
if (!process.env.JWT_SECRET) {
	logger.error("Fatal Error: JWT_SECRET not defined");
	process.exit(1);
}

app.set("view engine", "ejs");
app.set("views", `${__dirname}/views`);
app.use("/static", express.static("static"));

app.use(cookieParser());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(session({ secret: "Shh, its a secret!" }));

app.use("/rooms", rooms);
app.use("/waitingRoom", waitingRoom);

app.get("/", (req, res) => {
	res.render("index");
});
app.listen(port, () => {
	logger.info(`Express server started at port: ${port}`);
});

server.listen(port + 1, () => {
	logger.info(`Sockets server started at port: ${port + 1}`);
});
