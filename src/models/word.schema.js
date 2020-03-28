const mongoose = require("mongoose");
const db = require("./db");

const wordSchema = new mongoose.Schema({
	message: {
		type: String,
		required: true,
		index: true,
		unique: true,
	},
	points: {
		type: Number,
		default: 100,
	},
	timesUsed: {
		type: Number,
		default: 0,
	},
});

const Word = db.piksy.model("Word", wordSchema);
export default Word;
