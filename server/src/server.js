require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const { ensureSeedUsers } = require('./utils/ensureSeedUsers');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function startServer() {
  const connected = await connectDB(MONGODB_URI);
  if (connected) {
    await ensureSeedUsers();
  }

  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
}

startServer();
