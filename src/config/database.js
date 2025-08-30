require("dotenv").config();

const mongoose = require("mongoose");

const databaseURL = process.env.DATABASE_URL;

const connectDB = async () => {
  await mongoose.connect(databaseURL);
};

module.exports = connectDB;
