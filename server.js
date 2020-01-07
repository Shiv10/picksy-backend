require("dotenv").config();
require("./models/db");

const express = require("express");
const bodyparser = require("body-parser");

const app = express();
const server = require("http").Server(app);
const io = require("./routes/game").listen(server);

const { logger } = require("./tools/loggers");

const port = parseInt(process.env.PORT, 10) || 3000;

if (!process.env.JWT_SECRET) {
	logger.error("Fatal Error: JWT_SECRET not defined");
	process.exit(1);
}

app.set("view engine", "ejs");
app.set("views", `${__dirname}/views`);
app.use("/static", express.static("static"));
app.use(
	bodyparser.urlencoded({
		extended: true,
	}),
	bodyparser.json(),
);

app.get("/", (req, res) => {
	res.render("index");
});

app.listen(port, () => {
	logger.info(`Express server started at port: ${port}`);
});

server.listen(port + 1, () => {
	logger.info(`Sockets server started at port: ${port + 1}`);
});
