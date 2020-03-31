import express from "express";
import passport from "passport";

const router = express.Router();

router.get("/google", passport.authenticate("google", { scope: ["email profile"] }));

router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/" }), (req, res) => {
	// Authenticated successfully
	res.redirect("/home");
});

router.get("/logout", (req, res) => {
	req.logout();
	res.redirect("/");
});

export default router;
