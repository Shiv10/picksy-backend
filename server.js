require("dotenv").config();
require("./models/db");

const express = require("express");

const bodyparser = require("body-parser");
const { logger } = require("./tools/loggers");
const gameRouter = require("./routes/game");

const app = express();
const port = process.env.PORT || 3000;

if (!process.env.JWT_SECRET) {
	logger.error("Fatal Error: JWT_SECRET not defined");
	process.exit(1);
}

app.use(
	bodyparser.urlencoded({
		extended: true,
	}),
);

app.use(bodyparser.json());

app.listen(port, () => {
	logger.info(`Express server started at port: ${port}`);
});

app.use("/game", gameRouter);
