import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
	if (req.query.session !== undefined) {
		res.render("roomSelection", { username: req.session.user.username });
		return;
	}
	req.session.user = {
		name: "Rohan Mukherjee",
		username: "roerohan",
		email: "rohan.mukherjee2018@vitstudent.ac.in",
		mobile: 7980619447,
		regNo: "18BCE0221",
		gender: "M",
		scope: ["user", "csi"],
		iat: 1583605452,
		exp: 1584037452,
		room: "",
	};
	res.render("roomSelection", { username: req.session.user.username });
});

router.post("/", (req, res) => {
	req.session.user.room = req.body.room;
	res.end();
});

export default router;
