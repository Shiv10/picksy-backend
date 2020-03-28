const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
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
	permission: {
		type: String,
		default: "open",
		enum: ["ban", "open"],
	},
});

module.exports = {
	schema: scoreSchema,
	model: mongoose.model("Score", scoreSchema),
};
