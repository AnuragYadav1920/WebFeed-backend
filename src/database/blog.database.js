require('dotenv').config()
const mongoose = require("mongoose");
const {DB_NAME} = require('../constant.js')
const connectDatabase = async () => {
  try {
    const success = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    if(success){
      console.log('Database connected successfully')
    }
  } catch (error) {
    console.log('Database connection failed')
  }
};

module.exports = { connectDatabase };
