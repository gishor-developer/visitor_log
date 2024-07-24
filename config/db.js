const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

const connectMongoDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME
    });
    mongoose.set('debug', true);

    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to db');
    });

    mongoose.connection.on('error', (err) => {
      console.log(err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose connection is disconnected.');
    });

    console.log('MongoDB connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectMongoDB;