import { Request, Response } from 'express';
import { 
  listConversations, 
  getConversation, 
  createConversation, 
  addMessage, 
  markRead 
} from '../services/messages.service';
import { publish } from '../services/sse';

export async function list(req: Request, res: Response) {
  const userId = req.session?.user?.id || "dev-user-id";
  const role = req.session?.user?.role || "vendor";
  const { vendorId, customerId, status, q, limit, offset } = req.query;

  try {
    // Enforce access control
    if (role === 'vendor') {
      if (!vendorId || vendorId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (role === 'customer') {
      if (!customerId || customerId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const conversations = await listConversations({
      vendorId: vendorId as string,
      customerId: customerId as string,
      status: status as string,
      q: q as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined
    });

    res.json(conversations);
  } catch (error) {
    console.error('Error listing conversations:', error);
    res.status(500).json({ error: 'Failed to list conversations' });
  }
}

export async function get(req: Request, res: Response) {
  const userId = req.session?.user?.id || "dev-user-id";
  const role = req.session?.user?.role || "vendor";
  const { id } = req.params;

  try {
    const conversation = await getConversation(id);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Enforce access control
    if (role === 'vendor' && conversation.vendorId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    } else if (role === 'customer' && conversation.customerId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
}

export async function create(req: Request, res: Response) {
  const userId = req.session?.user?.id || "dev-user-id";
  const role = req.session?.user?.role || "vendor";
  const { vendorId, customerId, subject } = req.body;

  try {
    // Enforce access control
    if (role === 'vendor' && vendorId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    } else if (role === 'customer' && customerId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const conversation = await createConversation({
      vendorId,
      customerId,
      subject
    });

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
}

export async function postMessage(req: Request, res: Response) {
  const userId = req.session?.user?.id || "dev-user-id";
  const role = req.session?.user?.role || "vendor";
  const { id: conversationId } = req.params;
  const { body, attachments } = req.body;

  try {
    // Get conversation to check access
    const conversation = await getConversation(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Enforce access control
    if (role === 'vendor' && conversation.vendorId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    } else if (role === 'customer' && conversation.customerId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const message = await addMessage({
      conversationId,
      senderRole: role,
      senderId: userId,
      body,
      attachments
    });

    // Publish to SSE
    publish(conversation.vendorId, 'message', {
      conversationId,
      message
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Error posting message:', error);
    res.status(500).json({ error: 'Failed to post message' });
  }
}

export async function markRead(req: Request, res: Response) {
  const userId = req.session?.user?.id || "dev-user-id";
  const role = req.session?.user?.role || "vendor";
  const { id: conversationId } = req.params;

  try {
    // Get conversation to check access
    const conversation = await getConversation(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Enforce access control
    if (role === 'vendor' && conversation.vendorId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    } else if (role === 'customer' && conversation.customerId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await markRead(conversationId, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking as read:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
}
