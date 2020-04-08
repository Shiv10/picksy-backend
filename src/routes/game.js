import express from "express";

import { createPrivateRoom, getPublicRoom } from "../actions/roomCalls";
import { Room } from "../models";

const router = express.Router();

router.post("/getID", async (req, res) => {
	if (!req.body.username || !req.body.createNew) {
		return res.json({
			success: false,
		});
	}

	const { username, createNew } = req.body;
	let roomId;

	if (createNew) {
		roomId = await createPrivateRoom();
	} else {
		roomId = await getPublicRoom();
	}

	return res.json({
		success: true,
		roomId,
		username,
	});
});

router.get("/", async (req, res) => {
	if (!req.query.roomId || !req.body.username) return res.redirect("/");
	const { roomId } = req.query;
	const { username } = req.body;

	const isStarted = (await Room.findOne({ roomId })).turnOn;
	if (isStarted === false) {
		return res.render("gameLobby", { username, roomId });
	}
	if (isStarted === true) {
		return res.render("game", { username, roomId });
	}
	return res.json({
		success: false,
	});
});

export default router;
