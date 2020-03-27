import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
	res.render("waitingRoom", { username: req.session.user.username, room: req.session.user.room });
});

export default router;
