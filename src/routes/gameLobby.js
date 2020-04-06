import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
	res.render("gameLobby", { username: req.session.user.username, room: req.session.user.roomId });
});

export default router;
