import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
	res.render("game", { username: req.session.user.username, room: req.query.roomId });
});

export default router;
