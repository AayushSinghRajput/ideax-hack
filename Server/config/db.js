const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONDODB_URI);

    console.log(` MongoDB connected:`);
  } catch (error) {
    console.error(' MongoDB connection error:', error.message);
    process.exit(1); 
  }
};

module.exports = connectDB;
