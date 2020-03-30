import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
	res.render("index", { username: req.session.user.username, room: req.session.user.room });
});

export default router;
