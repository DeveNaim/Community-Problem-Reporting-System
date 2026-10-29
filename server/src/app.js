const express = require('express');
const cors = require('cors');
const path = require('path');

const { getDbStatus, isDbConnected } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.json({
    service: 'Community Problem Reporting System API',
    health: '/api/health',
    routeGroups: [
      '/api/auth',
      '/api/users',
      '/api/complaints',
      '/api/notifications',
      '/api/analytics',
      '/api/categories',
    ],
    client: 'http://localhost:5173',
  });
});

app.get('/api/health', (req, res) => {
  const dbInfo = getDbStatus();
  res.json({
    status: 'ok',
    service: 'Community Problem Reporting System API',
    db: isDbConnected() ? 'connected' : 'disconnected',
    database: dbInfo,
    timestamp: new Date().toISOString(),
  });
});

// Route groups per SRS Section 10
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/categories', categoryRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Central error handler (Section 6 Maintainability)
app.use((err, req, res, next) => {
  console.error(err);
  if (!isDbConnected() && (err.name === 'MongooseError' || err.name === 'MongoServerSelectionError')) {
    return res.status(503).json({
      message:
        'Database is not connected. Ensure MongoDB is running and MONGODB_URI is properly configured in server/.env.',
      db: 'disconnected',
    });
  }
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

module.exports = app;
