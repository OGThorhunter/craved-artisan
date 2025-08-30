const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(), 
    service: "craved-artisan-server", 
    mode: "TEST" 
  });
});

// Simple test endpoint
app.get("/test", (req, res) => {
  res.json({ message: "Server is working!" });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`🧪 Test: http://localhost:${PORT}/test`);
  console.log(`🌐 Bound to: 0.0.0.0:${PORT}`);
});

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});
