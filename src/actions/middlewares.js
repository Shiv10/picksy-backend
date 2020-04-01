import User from "../models";

const whitelist = ["http://localhost:3001", "http://localhost:3002"];

export default {
	origin(origin, callback) {
		if (whitelist.indexOf(origin) !== -1 || !origin) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
};
