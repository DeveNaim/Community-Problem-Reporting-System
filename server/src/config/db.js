const dns = require('dns');
const mongoose = require('mongoose');

const READY_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

let lastConnectionError = null;
let listenersAttached = false;

function attachConnectionListeners() {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on('connected', () => {
    lastConnectionError = null;
    console.log(
      `[MongoDB] Connected: ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}`
    );
  });

  mongoose.connection.on('error', (err) => {
    lastConnectionError = err.message;
    console.error(`[MongoDB] Connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Disconnected from database.');
  });

  const gracefulExit = async (signal) => {
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        console.log(`[MongoDB] Connection closed through ${signal}`);
      }
    } finally {
      process.exit(0);
    }
  };

  process.once('SIGINT', () => gracefulExit('SIGINT'));
  process.once('SIGTERM', () => gracefulExit('SIGTERM'));
}

/**
 * Initializes the Mongoose connection with production-ready pool and timeout settings.
 */
async function connectDB(uri) {
  const targetUri = uri || process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cprs';
  const maxPoolSize = Number(process.env.MONGO_MAX_POOL_SIZE) || 10;
  const serverSelectionTimeoutMS = Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 8000;

  // Resolve SRV DNS records on networks/ISPs that fail with default system DNS
  if (targetUri.startsWith('mongodb+srv://')) {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (dnsErr) {
      // Ignore if environment restricts custom DNS servers
    }
  }

  mongoose.set('strictQuery', true);
  attachConnectionListeners();

  try {
    await mongoose.connect(targetUri, {
      maxPoolSize,
      serverSelectionTimeoutMS,
      autoIndex: process.env.NODE_ENV !== 'production',
    });
    return true;
  } catch (err) {
    lastConnectionError = err.message;
    console.error(`[MongoDB] Initial connection failed: ${err.message}`);
    console.error(
      '[MongoDB] API is running in database-standby/review mode. Start MongoDB or set MONGODB_URI in server/.env to enable persistence.'
    );
    return false;
  }
}

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

function getDbStatus() {
  const stateCode = mongoose.connection.readyState;
  return {
    state: READY_STATES[stateCode] || 'unknown',
    readyState: stateCode,
    host: stateCode === 1 ? mongoose.connection.host : null,
    database: stateCode === 1 ? mongoose.connection.name : null,
    error: stateCode === 1 ? null : lastConnectionError,
  };
}

module.exports = connectDB;
module.exports.isDbConnected = isDbConnected;
module.exports.getDbStatus = getDbStatus;
