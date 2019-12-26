const mongoose = require("mongoose");
const responseSchema = require("./response.schema");
const db = require("./db");

const gameSchema = new mongoose.Schema({
	reponse: {
		type: [responseSchema],
		required: true,
	},
	suggestedWords: {
		type: [String],
		default: [],
	},
	choosenWord: {
		type: String,
		default: "",
	},
	points: {
		type: Number,
		default: 0,
	},
	matchesPlayed: {
		type: Number,
		default: 0,
	},
});

const Game = db.pic20.model("Game", gameSchema);
export default Game;
