import User from "../models";
import constants from "../tools/constants";

const whitelist = process.env.NODE_ENV === "production" ? constants.url : constants.urlDev;

export default {
	origin(origin, callback) {
		if (whitelist.indexOf(origin) !== -1 || !origin) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
};
