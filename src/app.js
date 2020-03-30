import "./models/db";

import express from "express";
import http from "http";
import { urlencoded, json } from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import cors from "cors";

import { logger } from "./tools/loggers";
import constants from "./tools/constants";
import socketHandler from "./routes/game";
// const register = require("./routes/register.js");
import rooms from "./routes/rooms";
import waitingRoom from "./routes/waiting";
import auth from "./routes/auth";

export const app = express();
export const server = http.Server(app);

socketHandler(server, constants.corsOptions);

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
