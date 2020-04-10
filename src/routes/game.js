import express from "express";

import { createPrivateRoom, getPublicRoom } from "../actions/roomCalls";
import { Room } from "../models";
import { logger } from "../tools/loggers";

const router = express.Router();

router.post("/getID", async (req, res) => {
	if (!req.body.username || !req.body.createNew) {
		return res.json({
			success: false,
		});
	}
	const { username, createNew } = req.body;

	try {
		let roomId;
		if (createNew === true) {
			roomId = await createPrivateRoom();
		}
		roomId = await getPublicRoom();

		return res.json({
			success: true,
			data: { username, roomId },
		});
	} catch (e) {
		res.json({
			success: false,
			data: "serverError",
		});
		throw e;
	}
});

router.get("/", async (req, res) => {
	if (!req.query.roomId || !req.query.username) return res.redirect("/");
	const { roomId, username } = req.query;

	const isStarted = (await Room.findOne({ roomId })).turnOn;
	if (isStarted === false) {
		return res.render("gameLobby", { username, roomId });
	}
	if (isStarted === true) {
		return res.render("game", { username, roomId });
	}
	return res.json({
		success: false,
		data: "serverError",
	});
});

export default router;
