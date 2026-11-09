const mongoose = require('mongoose');

let connecting = null;

async function connectDB(uri) {
  if (!uri) {
    throw new Error('MONGODB_URI is required for database connection');
  }
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (connecting) return connecting;

  mongoose.set('strictQuery', true);
  connecting = mongoose
    .connect(uri, {
      serverSelectionTimeoutMS: 15000,
      maxPoolSize: 10,
    })
    .then((conn) => {
      connecting = null;
      console.log(`[db] Connected to MongoDB (${conn.connection.name || 'default'})`);
      return conn.connection;
    })
    .catch((err) => {
      connecting = null;
      throw err;
    });

  return connecting;
}

function isReady() {
  return mongoose.connection.readyState === 1;
}

async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[db] Disconnected');
  }
}

module.exports = { connectDB, disconnectDB, isReady, mongoose };
