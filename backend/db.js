const mongoose = require('mongoose');
const mongoURI = "mongodb://localhost:27017/StoreItem";

const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB connection successful");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
};

module.exports = connectToMongo;
