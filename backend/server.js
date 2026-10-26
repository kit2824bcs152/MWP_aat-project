const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check / welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'College Course Management REST API is active',
    version: '1.0.0',
    endpoints: {
      dashboard: '/api/dashboard/stats',
      courses: '/api/courses',
      students: '/api/students',
      faculty: '/api/faculty',
      enrollments: '/api/enrollments'
    }
  });
});

// API Routes
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/faculty', require('./routes/facultyRoutes'));
app.use('/api/enrollments', require('./routes/enrollmentRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// 404 and Error Handler Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`[Server] API Base URL: http://localhost:${PORT}/api`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
