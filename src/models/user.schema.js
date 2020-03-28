const mongoose = require("mongoose");
const db = require("./db");

// https://stackoverflow.com/questions/42608919/mongoose-user-model-for-handling-local-and-social-auth-providers

const userSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
			index: true,
			unique: true,
		},
		facebook: {
			id: String,
			token: String,
			email: String,
			name: String,
		},
		google: {
			id: String,
			token: String,
			email: String,
			name: String,
		},
		points: {
			type: Number,
			default: 0,
		},
		matchesPlayed: {
			type: Number,
			default: 0,
		},
		currentRoom: {
			type: Number,
			default: "",
		},
	},
	{ timestamps: true },
);

const User = db.piksy.model("User", userSchema);
export default User;
