require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");

// Import database models
const models = require("./startup/model");

// Import routes
const otpRoutes = require("./application/routes/otp.routes");
const giftRoutes = require("./application/routes/gift.routes");

const app = express();

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: '*'
}));

// Body parsers
app.use(express.json({ 
  limit: "16kb",
  verify: (req, res, buf) => {
    try {
      if (buf && buf.length > 0 && req.get('content-type')?.includes('application/json')) {
        JSON.parse(buf);
      }
    } catch (e) {
      res.status(400).json({
        status: "error",
        message: "Invalid JSON format",
        error_code: "INVALID_JSON"
      });
      throw new Error('Invalid JSON');
    }
  }
}));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Health check root endpoint
app.get("/", (req, res) => {
  return res.status(200).json({
    message: "SMS Server for Glamex OTP Service",
    status: "running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint (direct)
const otpController = require("./application/controller/otp.controller");
app.get("/health", (req, res) => otpController.healthCheck(req, res));

// Mount OTP routes
app.use("/otp", otpRoutes);

// Mount Gift routes
app.use("/gift", giftRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  return res.status(404).json({
    statusCode: 404,
    message: "Route not found",
    success: false,
    error_code: "NOT_FOUND",
    data: null,
  });
});

// Generic error handler (must be last)
app.use((err, req, res, next) => {
  console.error('❌ [SMS Server] Unhandled error:', err);
  
  return res.status(500).json({
    statusCode: 500,
    message: err.message || "Internal server error",
    success: false,
    error_code: "INTERNAL_SERVER_ERROR",
    data: null,
  });
});

const PORT = process.env.SMS_SERVER_PORT || 8081;
const HOST = process.env.SMS_SERVER_HOST || '0.0.0.0'; // Bind to all interfaces for network access

// Create HTTP server
const server = http.createServer(app);

server.listen(PORT, HOST, () => {
  console.log(`📱 SMS Server running on ${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database connection established successfully.`);
  console.log(`Main endpoint: POST http://localhost:${PORT}/otp/generate`);
  console.log(`Network endpoint: POST http://192.168.1.3:${PORT}/otp/generate`);
  console.log(`Health check: GET http://localhost:${PORT}/health`);
});

module.exports = app;

