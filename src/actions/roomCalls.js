/* eslint-disable no-await-in-loop */
import shortid from "shortid";

import { logger } from "../tools/loggers";
import { Room } from "../models";

export async function createPrivateRoom() {
	const newRoom = new Room();
	const shortId = `PVT:${await shortid.generate()}`;
	newRoom.roomId = shortId;
	newRoom.type = "PVT";
	await newRoom.save();

	return shortId;
}

export async function getPublicRoom() {
	const roomId = await getMostFilledRoom();
	return roomId;
}

async function getMostFilledRoom() {
	let { roomId } = await Room.findOne({ userCount: { $lt: 10 } }, { userCount: 1, roomId: 1 });

	if (!roomId) {
		const newRoom = new Room();
		roomId = `PUB:${shortid.generate()}`;
		newRoom.roomId = roomId;
		newRoom.type = "PUB";
		await newRoom.save();
	}
	return roomId;
}
