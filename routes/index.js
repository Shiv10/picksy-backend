const router = require("express").Router();

router.get("/", (req, res) => {
	res.render("index", { username: req.session.user.username, room: req.session.user.room });
});

module.exports = router;
