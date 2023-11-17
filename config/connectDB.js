const mongoose = require('mongoose');
require('dotenv').config();

const DB = process.env.DATABASE;

const connectDB = async () => {
    try {
      await mongoose.connect(DB);
      console.log("Connected to DB");
    } catch (error) {
      console.error(`Error connecting to db: ${error}`);
    }
  };
  
connectDB();
  