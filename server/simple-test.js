const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    status: 'OK', 
    message: 'Simple HTTP server working!',
    timestamp: new Date().toISOString()
  }));
});

server.listen(3002, '0.0.0.0', () => {
  console.log('🚀 Simple HTTP server running on port 3002');
  console.log('📊 Test: http://localhost:3002/');
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

process.on('SIGINT', () => {
  console.log('\nShutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
