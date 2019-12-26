const mongoose = require('mongoose');
const { logger } = require('../tools/loggers');

const initConnections = () => {
	mongoose.set('debug', true);
	const db = mongoose.createConnection(
		process.env.MONGO_URL && process.env.PIC20_DB
			? `${process.env.MONGO_URL}/${process.env.PIC20_DB}`
			: 'mongodb://localhost:27017/pic20',
		{
			useFindAndModify: false,
			useNewUrlParser: true,
			useCreateIndex: true,
			useUnifiedTopology: true,
		},
	);

	const accountsDB = db.useDb(
		process.env.ACCOUNTS_DB ? process.env.ACCOUNTS_DB : 'accounts',
	);

	db.on('error', logger.error.bind(logger, 'connection error:'));
	db.once('open', () => {
		logger.info('Connected to MongoDB Instance');
	});

	return {
		accounts: accountsDB,
		pic20: db,
	};
};

module.exports = initConnections();
