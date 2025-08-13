import type { Request, Response } from "express";
import { prisma } from "../db/prisma";

export async function healthz(_req: Request, res: Response) { 
  res.json({ ok: true, ts: new Date().toISOString() }); 
}

export async function readyz(_req: Request, res: Response) {
  try { 
    await prisma.$queryRaw`SELECT 1`; 
    res.json({ ok: true }); 
  } catch (e) { 
    res.status(503).json({ ok: false, reason: "db" }); 
  }
}
