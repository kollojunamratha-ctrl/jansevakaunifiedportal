const mongoose = require("mongoose");

let isConnected = false;

async function connectMongo() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    return false;
  }

  if (isConnected) {
    return true;
  }

  await mongoose.connect(mongoUri, {
    autoIndex: true
  });

  isConnected = true;
  return true;
}

module.exports = { connectMongo };
