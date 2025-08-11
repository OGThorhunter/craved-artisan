import { Router } from "express";
import { 
  listConversations, 
  getConversation, 
  createConversation, 
  postMessage, 
  markRead 
} from "../controllers/messages.controller";

const router = Router();

// GET /api/messages/conversations?vendorId=&status=&q=
router.get("/conversations", listConversations);

// POST /api/messages/conversations
router.post("/conversations", createConversation);

// GET /api/messages/conversations/:id
router.get("/conversations/:id", getConversation);

// PATCH /api/messages/conversations/:id
router.patch("/conversations/:id", (req, res) => {
  // TODO: Implement update conversation
  res.status(501).json({ error: "Not implemented yet" });
});

// POST /api/messages/conversations/:id/message
router.post("/conversations/:id/message", postMessage);

// PATCH /api/messages/conversations/:id/read
router.patch("/conversations/:id/read", markRead);

// GET /api/messages/stream?vendorId=...
router.get("/stream", (req, res) => {
  const { vendorId } = req.query;
  if (!vendorId) {
    return res.status(400).json({ error: "vendorId is required" });
  }
  
  import('../services/sse').then(({ subscribe }) => {
    subscribe(vendorId as string, res);
  });
});

export default router;
