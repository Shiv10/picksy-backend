import mongoose from "mongoose";

import db from "./db";
import { logger } from "../tools/loggers";

const roomSchema = new mongoose.Schema(
	{
		roomId: { type: String, required: true, unique: true },
		type: { type: String, required: true, default: " " },
		userCount: { type: Number, default: 0 },
		users: { type: Array, default: [] },
		roundNumber: { type: Number, default: 0 },
		turn: {
			start: { type: Boolean, default: false },
			timeStart: { type: Number, default: 0.0 },
			timeTotal: { type: Number, default: 0 },
		},
		currentWord: { type: String, default: "" },
		currentDrawer: { type: String, default: "" },
		currentDrawerId: { type: String, default: "" },
		points: { type: Object, default: {} },
		usersGuessed: { type: Number, default: 0 },
		usersGuessedName: { type: Array, default: [] },
		turnNumber: { type: Number, default: 0 },
		turnOn: { type: Boolean, default: false },
		wordRevealInterval: { type: Number, default: false },
		timeout: { type: Number, default: false },
		cleared: { type: Boolean, default: false },
		cache: {
			indexes: { type: Array, default: [] },
			letters: { type: Array, default: [] },
		},
		keys: { type: Array, default: [] },
		startCount: { type: Number, default: 0 },
	},
	{ timestamps: true },
);

const Room = db.model("Room", roomSchema);
export default Room;

export async function addUserToRoom(roomId, userInfo) {
	const { username, socketId } = userInfo;

	try {
		const room = await Room.findOne({ roomId });
		room.userCount += 1;
		room.users.push(userInfo);
	} catch (e) {
		logger.info("addUser2Room Failed");
		throw e;
	}
}
