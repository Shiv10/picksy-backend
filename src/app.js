import "./models/db";

import express from "express";
import http from "http";
import { urlencoded, json } from "body-parser";
import cors from "cors";

import { logger } from "./tools/loggers";
import constants from "./tools/constants";
import corsHandler from "./actions/middlewares";

import socketHandler from "./routes/socketHandler";
import game from "./routes/game";

export const app = express();
export const server = http.Server(app);

socketHandler(server, constants.corsOptions);

app.set("view engine", "ejs");
app.set("views", `${__dirname}/../public/views`);
app.use("/static", express.static(`${__dirname}/../public/static`));

app.use(cors(corsHandler));
app.use(urlencoded({ extended: false }));
app.use(json());

app.use("/game", game); // The page where you play the game

app.get("/", (req, res) => {
	res.render("roomSelection");
});
