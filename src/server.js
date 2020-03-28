// require("./models/db");

import express from "express";
import { urlencoded, json } from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import cors from "cors";

import { logger } from "./tools/loggers";
// const register = require("./routes/register.js");
import rooms from "./routes/rooms";
import waitingRoom from "./routes/waiting";
import auth from "./routes/auth";

require("dotenv").config();

const app = express();
const server = require("http").Server(app);
const io = require("./routes/game").listen(server, {
	handlePreflightRequest: (req, res) => {
		const headers = {
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
			"Access-Control-Allow-Origin": "http://localhost:3001", // or the specific origin you want to give access to,
			"Access-Control-Allow-Credentials": true,
		};
		res.writeHead(200, headers);
		res.end();
	},
});

const port = parseInt(process.env.PORT, 10) || 3001;

process.env.JWT_SECRET = "abcd";
if (!process.env.JWT_SECRET) {
	logger.error("Fatal Error: JWT_SECRET not defined");
	process.exit(1);
}

app.set("view engine", "ejs");
app.set("views", `${__dirname}/../public/views`);
app.use("/static", express.static(`${__dirname}/../public/static`));

const whitelist = ["http://localhost:3001", "http://localhost:3002"];
const corsOptions = {
	origin(origin, callback) {
		if (whitelist.indexOf(origin) !== -1 || !origin) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(session({ secret: "Shh, its a secret!" }));

app.use("/rooms", rooms);
app.use("/waitingRoom", waitingRoom);
app.use("/index", auth);

app.get("/", (req, res) => {
	res.render("landingPage");
});
app.listen(port, () => {
	logger.info(`Express server started at port: ${port}`);
});

server.listen(port + 1, () => {
	logger.info(`Sockets server started at port: ${port + 1}`);
});
