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
	const roomId = getMostFilledRoom();
	return roomId;
}

async function getMostFilledRoom() {
	const cursor = Room.find({ count: { $lt: 10 } });
	let document;
	let roomId;
	// eslint-disable-next-line no-cond-assign, no-await-in-loop
	while ((document = await cursor.next())) {
		roomId = document;
		break;
	}

	if (!roomId) {
		const newRoom = new Room();
		roomId = `PUB:${shortid.generate()}`;
		newRoom.roomId = roomId;
		newRoom.type = "PUB";
		await newRoom.save();
	}

	return roomId;
}
