import { prisma } from "../lib/prisma";

interface ListConversationsParams {
  vendorId?: string;
  customerId?: string;
  status?: string;
  q?: string;
  limit?: number;
  offset?: number;
}

interface CreateConversationParams {
  vendorId: string;
  customerId: string;
  subject?: string;
}

interface AddMessageParams {
  conversationId: string;
  senderRole: string;
  senderId: string;
  body: string;
  attachments?: string[];
}

export async function listConversations(params: ListConversationsParams) {
  const { vendorId, customerId, status, q, limit = 30, offset = 0 } = params;
  
  const where: any = {};
  
  if (vendorId) where.vendorId = vendorId;
  if (customerId) where.customerId = customerId;
  if (status && status !== 'all') where.status = status;
  if (q) {
    where.OR = [
      { subject: { contains: q, mode: 'insensitive' } },
      { messages: { some: { body: { contains: q, mode: 'insensitive' } } } }
    ];
  }
  
  const conversations = await prisma.conversation.findMany({
    where,
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { lastMessageAt: 'desc' },
    take: limit,
    skip: offset
  });
  
  return conversations;
}

export async function getConversation(id: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' }
      },
      issues: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });
  
  return conversation;
}

export async function createConversation(params: CreateConversationParams) {
  const { vendorId, customerId, subject } = params;
  
  const conversation = await prisma.conversation.create({
    data: {
      vendorId,
      customerId,
      subject: subject || `Conversation with ${customerId}`
    }
  });
  
  return conversation;
}

export async function addMessage(params: AddMessageParams) {
  const { conversationId, senderRole, senderId, body, attachments = [] } = params;
  
  // Analyze sentiment (naive implementation)
  const negativeWords = ['refund', 'angry', 'broken', 'late', 'bad', 'terrible', 'awful', 'disappointed'];
  const positiveWords = ['great', 'amazing', 'wonderful', 'perfect', 'love', 'excellent', 'fantastic'];
  
  let sentiment: string | null = null;
  const lowerBody = body.toLowerCase();
  
  if (negativeWords.some(word => lowerBody.includes(word))) {
    sentiment = 'negative';
  } else if (positiveWords.some(word => lowerBody.includes(word))) {
    sentiment = 'positive';
  } else {
    sentiment = 'neutral';
  }
  
  // Create the message
  const message = await prisma.message.create({
    data: {
      conversationId,
      senderRole,
      senderId,
      body,
      attachments,
      sentiment
    }
  });
  
  // Update conversation status and lastMessageAt
  let newStatus = 'open';
  if (senderRole === 'vendor') {
    newStatus = 'awaiting_customer';
  } else if (senderRole === 'customer') {
    newStatus = 'awaiting_vendor';
  }
  
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageAt: new Date(),
      status: newStatus
    }
  });
  
  return message;
}

export async function markRead(conversationId: string, userId: string) {
  // Mark all messages in the conversation as read by this user
  await prisma.message.updateMany({
    where: { conversationId },
    data: {
      readBy: {
        push: userId
      }
    }
  });
  
  return { success: true };
}
