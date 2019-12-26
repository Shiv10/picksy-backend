const mongoose = require("mongoose");
const db = require("./db");

const participantSchema = new mongoose.Schema({
	participantId: {
		type: String,
		required: true,
		index: true,
		unique: true,
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

const Participant = db.pic20.model("Participant", participantSchema);
export default Participant;
