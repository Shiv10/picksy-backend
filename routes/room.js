const router = require("express").Router();

router.get("/", (req, res) => {
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
	};
	res.render("roomSelection", { name: req.session.user.name });
});

module.exports = router;
