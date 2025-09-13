const mongoose = require('mongoose');
const HomePage = require('./crud-operations/models/HomePage');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto-portfolio');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Initialize using the model's built-in method
const initializeHomePage = async () => {
  try {
    const data = await HomePage.initializeDefaultData();
    console.log('✅ HomePage data initialized successfully');
    console.log('📊 Platform stats:', data.platformStats);
    return data;
  } catch (error) {
    console.error('❌ Error initializing home page data:', error);
    throw error;
  }
};

// Main function
const main = async () => {
  try {
    await connectDB();
    await initializeHomePage();
    console.log('🎉 Home page initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Home page initialization failed:', error);
    process.exit(1);
  }
};

// Run the script
main();
