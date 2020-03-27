import { logger } from "../tools/loggers";

export default class Room {
	constructor(options) {
		this.socket = options.socket;
		this.rooms = options.rooms;
	}

	getRoomInfo() {
		const roomList = Object.keys(this.rooms);
		const info = [];
		for (let i = 0; i < roomList.length; i += 1) {
			info[i] = this.rooms[roomList[i]].userCount;
		}
		return info;
	}
}
