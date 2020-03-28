const mongoose = require("mongoose");
const responseSchema = require("./response.schema");
const db = require("./db");

const gameSchema = new mongoose.Schema({
	drawerId: {
		type: String,
		required: true,
	},
	reponses: {
		type: [responseSchema],
		required: true,
	},
	drawerPoints: {
		type: Number,
		default: 0,
	},
	suggestedWords: {
		type: [String],
		default: [],
	},
	choosenWord: {
		type: String,
		default: "",
	},
});

const Game = db.piksy.model("Game", gameSchema);
export default Game;
