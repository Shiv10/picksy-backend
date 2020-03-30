import { Schema } from "mongoose";

const scoreSchema = new Schema({
	userId: {
		type: String,
		required: true,
		index: true,
		unique: true,
	},
	points: {
		type: Number,
		required: true,
	},
});

export default scoreSchema;
