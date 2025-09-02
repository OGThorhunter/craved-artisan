const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());

app.get('/api/health', (req: any, res: any) => {
  res.json({ ok: true, ts: Date.now(), message: 'Minimal server running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Minimal server listening on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});
