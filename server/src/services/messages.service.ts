import prisma from '../lib/prisma';

export interface CreateConversationParams {
  vendorProfileId: string;
  customerId: string;
  subject?: string;
}

export interface AddMessageParams {
  conversationId: string;
  senderRole: 'vendor' | 'customer';
  senderId: string;
  body: string;
  attachments?: string[];
}

export async function getConversations(vendorProfileId: string, { limit = 20, offset = 0 } = {}) {
  // Conversation and Message models not available in current schema
  throw new Error("Messaging functionality not available in current schema");
  
  // TODO: Restore when models are properly implemented
  /*
  const conversations = await prisma.conversation.findMany({
    where: { vendorProfileId },
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
  */
}

export async function getConversation(id: string) {
  // Conversation model not available in current schema
  throw new Error("Messaging functionality not available in current schema");
  
  // TODO: Restore when models are properly implemented
  /*
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
  */
}

export async function createConversation(params: CreateConversationParams) {
  // Conversation model not available in current schema
  throw new Error("Messaging functionality not available in current schema");
  
  // TODO: Restore when models are properly implemented
  /*
  const { vendorProfileId, customerId, subject } = params;
  
  const conversation = await prisma.conversation.create({
    data: {
      vendorProfileId,
      customerId,
      subject: subject || `Conversation with ${customerId}`
    }
  });
  
  return conversation;
  */
}

export async function addMessage(params: AddMessageParams) {
  // Message and Conversation models not available in current schema
  throw new Error("Messaging functionality not available in current schema");
  
  // TODO: Restore when models are properly implemented
  /*
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
  */
}

export async function markRead(conversationId: string, userId: string) {
  // Message model not available in current schema
  throw new Error("Messaging functionality not available in current schema");
  
  // TODO: Restore when models are properly implemented
  /*
  // Mark all messages in the conversation as read by this user
  await prisma.message.updateMany({
    where: { conversationId },
    data: {
      readBy: {
        push: userId
      }
    }
  });
  */
}
