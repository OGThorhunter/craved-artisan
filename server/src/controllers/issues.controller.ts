import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { addMessage } from '../services/messages.service';

export async function createIssue(req: Request, res: Response) {
  const userId = req.session?.user?.id || "dev-user-id";
  const { conversationId, orderId, type, notes } = req.body;

  try {
    // Create the issue
    const issue = await prisma.orderIssue.create({
      data: {
        conversationId,
        orderId,
        type,
        notes
      }
    });

    // Add system message to conversation
    await addMessage({
      conversationId,
      senderRole: 'system',
      senderId: 'system',
      body: `Issue opened: ${type}${notes ? ` - ${notes}` : ''}`
    });

    res.status(201).json(issue);
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ error: 'Failed to create issue' });
  }
}

export async function updateIssue(req: Request, res: Response) {
  const userId = req.session?.user?.id || "dev-user-id";
  const { id } = req.params;
  const { status, notes } = req.body;

  try {
    // Get the issue
    const issue = await prisma.orderIssue.findUnique({
      where: { id },
      include: { conversation: true }
    });

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Update the issue
    const updatedIssue = await prisma.orderIssue.update({
      where: { id },
      data: {
        status,
        notes,
        updatedAt: new Date()
      }
    });

    // Add system message to conversation
    await addMessage({
      conversationId: issue.conversationId,
      senderRole: 'system',
      senderId: 'system',
      body: `Issue ${status}${notes ? ` - ${notes}` : ''}`
    });

    res.json(updatedIssue);
  } catch (error) {
    console.error('Error updating issue:', error);
    res.status(500).json({ error: 'Failed to update issue' });
  }
}
