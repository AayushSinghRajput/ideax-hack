const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db');
const startScheduler = require("./config/scheduler");
require('./cron/dailyScraper');

const authRoutes = require('./routes/authRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const productRoutes = require('./routes/productRoutes');
const machineRoutes = require('./routes/machineRoutes');
const newsRoutes = require('./routes/newsRoutes');
const priceRoutes = require("./routes/priceRoutes");
const prebookingRoutes = require("./routes/prebookingRoutes");
const audioRoutes = require("./routes/audioRoutes");

dotenv.config();
const app = express();

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

startScheduler();

// Serve static files
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/products', productRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/news', newsRoutes);
app.use("/api/prices", priceRoutes);
app.use("/api/prebooking", prebookingRoutes);
app.use("/api/audio", audioRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('🌾 Backend server is running...');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle unhandled exceptions
process.on('unhandledRejection', (err) => console.error('❌ Unhandled Rejection:', err));
process.on('uncaughtException', (err) => console.error('❌ Uncaught Exception:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));