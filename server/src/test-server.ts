import express from 'express';

const app = express();
const PORT = 3001;

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ts: Date.now(), message: 'Test server running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server listening on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});
