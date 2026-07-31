const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Allow both native Expo dev origin and web dev origin during development
const defaultOrigin = 'http://localhost:19006';
const allowedOrigins = [
  defaultOrigin,
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:8083', // Admin App
];

app.get('/', (req, res) => {
  res.json({ message: 'Urbanvendor API is running' });
});

// 🔥 Test Firebase Connection
app.get('/api/test-firebase', async (req, res) => {
  try {
    const { db, admin } = require('./config/firebase');
    await db.collection('test_collection').doc('test_doc').set({
      message: 'Firebase is working!',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ success: true, message: 'Firebase write successful! Check Firestore console.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
