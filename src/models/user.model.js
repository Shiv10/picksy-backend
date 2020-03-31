import mongoose from "mongoose";
import db from "./db";

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
		},
		email: {
			type: String,
			unique: true,
			index: true,
		},
		google: {
			id: { type: String, unique: true },
			token: { type: String },
			email: { type: String, unique: true },
			name: { type: String },
			displayName: { type: String },
			photo: { type: String },
		},
		roles: {
			type: [String],
			default: ["user"],
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

const User = db.model("User", userSchema);
export default User;
