import express from "express";
import { logger } from "express-winston";
import * as initVals from "../actions/initFill";


const router = express.Router();

router.get("/", (req, res) => {
	res.render("roomSelection", { username: req.session.user.username });
});

router.post("/", (req, res) => {
	req.session.user.username = req.body.name;
	res.end();
});

router.post("/getRoomId", (req, res) => {
	req.session.user.roomId = req.body.roomId;
	res.end();
});

export default router;
