const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const connectDB = require('./config/db');
const { initSocket } = require('./services/socketService');
const errorHandler = require('./middleware/errorHandler');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const organizerRoutes = require('./routes/organizerRoutes');

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Initialize Socket.IO
const io = initSocket(server);

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'EventIQ Backend Engine',
    timestamp: new Date(),
    socketConnected: !!io,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/organizer', organizerRoutes);

// Optional HTTP Trigger to seed database during demo
app.post('/api/seed', async (req, res, next) => {
  try {
    const { exec } = require('child_process');
    exec('node seed/seedData.js', (err, stdout, stderr) => {
      if (err) return res.status(500).json({ message: 'Seed failed', error: stderr });
      res.json({ message: 'Database seeded successfully', output: stdout });
    });
  } catch (error) {
    next(error);
  }
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 EventIQ Backend running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO initialized on port ${PORT}`);
  console.log(`==================================================`);
});
