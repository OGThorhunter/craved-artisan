import { Request, Response } from 'express';
import { productOverview } from '../services/product-analytics.service';
import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, any>({ ttl: 30_000, max: 200 });

export async function getProductOverview(req: Request, res: Response) {
  const { vendorId, productId } = req.params;
  const { from, to } = req.query as any;
  const key = `po:${vendorId}:${productId}:${from || ""}:${to || ""}`;
  
  if (cache.has(key)) return res.json(cache.get(key));
  
  const data = await productOverview(vendorId, productId, { 
    from: from ? new Date(from) : undefined, 
    to: to ? new Date(to) : undefined 
  });
  
  cache.set(key, data); 
  res.json(data);
}
