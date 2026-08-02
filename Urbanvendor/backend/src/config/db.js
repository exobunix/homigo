try {
  const dns = require('dns');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  console.warn('Could not set custom DNS servers, proceeding with default:', err.message);
}
const mongoose = require('mongoose');


async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not set in .env');
  }

  mongoose.set('strictQuery', true);

  const dbName = uri.split('/').pop().split('?')[0];

  await mongoose.connect(uri, {
    dbName: dbName,
  });

  console.log('MongoDB connected');
}

module.exports = connectDB;
