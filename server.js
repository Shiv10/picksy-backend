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
app.use(session({ secret: "Shh, its a secret!" }));
app.use(bodyparser.json());
app.use("/rooms", rooms);

// app.use(
// bodyparser.urlencoded({
// extended: true,
// }),
// bodyparser.json(),
// );

app.get("/", (req, res) => {
	res.render("landingPage");
});
app.listen(port, () => {
	logger.info(`Express server started at port: ${port}`);
});

server.listen(port + 1, () => {
	logger.info(`Sockets server started at port: ${port + 1}`);
});
