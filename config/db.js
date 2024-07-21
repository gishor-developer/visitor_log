const mongoose = require('mongoose');

// mongoose.Promise = Promise;

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;
// console.log(MONGODB_URI);

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME,
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // useFindAndModify: false,
      // useCreateIndex: true,
    });
    mongoose.set('debug', true);

    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to db')
    })

    mongoose.connection.on('error', (err) => {
      console.log(err.message)
    })

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose connection is disconnected.')
    })

    console.log('MongoDB connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

// const mongoose = require('mongoose')

// mongoose
//   .connect(process.env.MONGODB_URI, {
//     dbName: process.env.DB_NAME,
//     // useNewUrlParser: true,
//     // useUnifiedTopology: true,
//     // useFindAndModify: false,
//     // useCreateIndex: true,
//   })
//   .then(() => {
//     console.log('mongodb connected.')
//   })
//   .catch((err) => console.log(err.message))

// mongoose.connection.on('connected', () => {
//   console.log('Mongoose connected to db')
// })

// mongoose.connection.on('error', (err) => {
//   console.log(err.message)
// })

// mongoose.connection.on('disconnected', () => {
//   console.log('Mongoose connection is disconnected.')
// })

// process.on('SIGINT', async () => {
//   await mongoose.connection.close()
//   process.exit(0)
// })