import express from 'express';
import cors from 'cors';
import { vendors, products } from './mocks/fixtures';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

const router = express.Router();

// Health check
router.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(), 
    service: "craved-artisan-server", 
    mode: "MOCK" 
  });
});

// GET /products
router.get("/products", (req, res) => {
  const limit = Math.min(parseInt(String(req.query.limit ?? "20"), 10) || 20, 100);
  const offset = parseInt(String(req.query.offset ?? "0"), 10) || 0;
  const slice = products.slice(offset, offset + limit);
  res.json({
    data: slice,
    meta: { total: products.length, limit, offset }
  });
});

// GET /products/:productId
router.get("/products/:productId", (req, res) => {
  const p = products.find(x => x.id === req.params.productId);
  if (!p) return res.status(404).json({ error: "Not found", message: `Product ${req.params.productId} not found` });
  res.json(p);
});

// GET /vendors/:vendorId
router.get("/vendors/:vendorId", (req, res) => {
  const v = vendors.find(x => x.id === req.params.vendorId);
  if (!v) return res.status(404).json({ error: "Not found", message: `Vendor ${req.params.vendorId} not found` });
  res.json(v);
});

// GET /vendors/:vendorId/products
router.get("/vendors/:vendorId/products", (req, res) => {
  const v = vendors.find(x => x.id === req.params.vendorId);
  if (!v) return res.status(404).json({ error: "Not found", message: `Vendor ${req.params.vendorId} not found` });
  const list = products.filter(p => p.vendorId === v.id);
  res.json({
    data: list,
    meta: { total: list.length }
  });
});

app.use(router);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found", message: `Route ${req.path} not found` });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock server running on port ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`📦 Products: http://localhost:${PORT}/products`);
  console.log(`🏪 Vendors: http://localhost:${PORT}/vendors/:vendorId`);
});
