export default {
	roundNum: 3,
	matchLen: 10000,
	wordSelOptions: 3,
	timeOfRound: 80000,
	playerPointFactor: 10,
	drawerPointFactor: 8,
	corsOptions: {
		handlePreflightRequest: (req, res) => {
			const headers = {
				"Access-Control-Allow-Headers": "Content-Type, Authorization",
				"Access-Control-Allow-Origin": "http://localhost:3001", // or the specific origin you want to give access to,
				"Access-Control-Allow-Credentials": true,
			};
			res.writeHead(200, headers);
			res.end();
		},
	},
};
