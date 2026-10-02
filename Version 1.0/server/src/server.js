const mongoose = require('mongoose');
const app = require('./app');
const { port, mongoUri } = require('./config');

function maskMongoUri(uri) {
  if (!uri) return 'not configured';
  return uri.replace(/mongodb:\/\/([^:]+):([^@]+)@/, 'mongodb://***:***@');
}

async function start() {
  try {
    if (!mongoUri) {
      throw new Error('MONGO_URI is not configured. Add mongodb://127.0.0.1:27017/kai_db to your .env file.');
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });

    console.log(`[MongoDB] Connected successfully: ${maskMongoUri(mongoUri)}`);
    app.listen(port, () => console.log(`Kai API listening on ${port}`));
  } catch (error) {
    console.error('[MongoDB] Connection failed:', error.message);
    console.error('[MongoDB] Check that mongod is running locally, then verify the MONGO_URI in server/.env.');
    process.exit(1);
  }
}

if (require.main === module) start();
module.exports = { start };
