/* eslint-disable max-len */
/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const config = require('./config');

const { MONGO_DATABASE_USERNAME, MONGO_DATABASE_PASSWORD, MONGO_DATABASE_HOST, MONGO_DATABASE_NAME } = process.env;

// Build MongoDB connection URL based on environment and credentials
let mongoURL;

if (process.env.ENV !== 'dev') {
  // Production: AWS remote database
  mongoURL = `${MONGO_DATABASE_HOST}/${MONGO_DATABASE_NAME}?authSource=%24external&authMechanism=MONGODB-AWS&retryWrites=true&w=majority`;
} else if (MONGO_DATABASE_USERNAME && MONGO_DATABASE_PASSWORD) {
  // Development: with authentication
  mongoURL = `mongodb://${MONGO_DATABASE_USERNAME}:${MONGO_DATABASE_PASSWORD}@${MONGO_DATABASE_HOST}:27017/${MONGO_DATABASE_NAME}`;
} else {
  // Development: without authentication (local MongoDB)
  mongoURL = `mongodb://${MONGO_DATABASE_HOST}:27017/${MONGO_DATABASE_NAME}`;
}

const connect = () =>
  mongoose
    .set('strictQuery', false)
    .connect(mongoURL, config)
    .then(() => {
      console.log('[MongoDB] CONNECTED!');
      console.log(`[MongoDB] Database: ${MONGO_DATABASE_NAME}`);
      console.log(`[MongoDB] Host: ${MONGO_DATABASE_HOST}`);
    })
    .catch(err => {
      console.error(err.message);
      console.error(`[MongoDB] ERROR: CONNECTION FAILED`);
      console.error(`[MongoDB] Connection String: ${mongoURL}`);
      process.exit(1);
    });

connect();

module.exports = mongoose.connection;
