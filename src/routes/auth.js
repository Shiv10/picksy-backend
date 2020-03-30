import express from "express";
import passport from "passport";

const router = express.Router();

router.get("/google", passport.authenticate("google", { scope: ["openid email profile"] }));

router.get(
	"/google/callback",
	passport.authenticate("google", {
		failureRedirect: "/auth",
	}),
	(req, res) => {
		// Authenticated successfully
		res.redirect("/");
	},
);
