import passport from "passport";
import { OAuth2Strategy as GoogleStrategy } from "passport-google-oauth";
import User from "../models";

const whitelist = ["http://localhost:3001", "http://localhost:3002"];

export const corsHandler = {
	origin(origin, callback) {
		if (whitelist.indexOf(origin) !== -1 || !origin) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
};

export const ensureAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	return res.redirect("/");
};

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: process.env.CALLBACK_URL,
		},

		async (accessToken, refreshToken, profile, done) => {
			const currUser = User.findOne({ "google.id": profile.id });

			if (currUser === "undefined") {
				const newUser = new User({
					username: profile.displayName.toLowerCase(),
					email: profile.emails[0].value,
					google: {
						id: profile.id,
						token: accessToken,
						email: profile.emails[0].value,
						name: `${profile.name.givenName} ${profile.name.familyName}`,
						displayName: profile.displayName,
						photo: profile.photos[0].value,
					},
				});

				await newUser.save();
			}
		},
	),
);
