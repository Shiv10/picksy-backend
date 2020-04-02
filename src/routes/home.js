import express from "express";
import { logger } from "express-winston";
import * as initVals from "../actions/initFill";


const router = express.Router();

router.get("/", (req, res) => {
	if (req.query.session !== undefined) {
		res.render("roomSelection", { username: req.session.user.username });
		return;
	}
	res.render("roomSelection", { username: req.session.user.username });
});

router.post("/currRoom", (req, res) => {
	req.session.user.room = req.body.room;
	res.end();
});

router.post("/", (req, res) => {
	req.session.user.username = req.body.name;
	res.end();
});
export default router;
