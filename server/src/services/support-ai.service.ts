import OpenAI from 'openai';
import { logger } from '../logger';

// Feature flags
const featureFlags = {
  aiSummarize: process.env.SUPPORT_AI_SUMMARIZE === 'true',
  aiAutoCategory: process.env.SUPPORT_AI_CATEGORY === 'true',
  aiSentiment: process.env.SUPPORT_AI_SENTIMENT === 'true',
  aiSuggestReply: process.env.SUPPORT_AI_REPLY === 'true',
};

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Classify ticket category and severity using AI
 */
export async function classifyTicket(subject: string, description: string) {
  if (!featureFlags.aiAutoCategory) {
    return null;
  }
  
  if (!openai) {
    logger.warn('OpenAI not configured, skipping AI classification');
    return null;
  }
  
  try {
    const prompt = `Analyze this support ticket and classify it.

Subject: ${subject}
Description: ${description}

Return a JSON object with:
- category: one of [ACCOUNT, ORDER, PAYMENT, INVENTORY, EVENT, TECH, COMPLIANCE, FEEDBACK, OTHER]
- severity: one of [LOW, NORMAL, HIGH, CRITICAL]
- reasoning: brief explanation

Consider severity based on:
- CRITICAL: System down, data loss, security breach, payment failures
- HIGH: Major feature broken, multiple users affected, urgent business impact
- NORMAL: Standard issues, feature requests, general inquiries
- LOW: Minor bugs, cosmetic issues, documentation requests`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });
    
    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    logger.info({
      category: result.category,
      severity: result.severity,
    }, '🤖 AI ticket classification complete');
    
    return result;
  } catch (error) {
    logger.error({ error }, '❌ AI classification failed');
    return null;
  }
}

/**
 * Summarize a support ticket thread in one sentence
 */
export async function summarizeThread(messages: Array<{ body: string; senderRole?: string | null }>) {
  if (!featureFlags.aiSummarize) {
    return null;
  }
  
  if (!openai) {
    logger.warn('OpenAI not configured, skipping AI summarization');
    return null;
  }
  
  try {
    const thread = messages
      .map((m, i) => `${i + 1}. ${m.senderRole || 'User'}: ${m.body}`)
      .join('\n');
    
    const prompt = `Summarize this support ticket conversation in ONE concise sentence (max 15 words).

${thread}

Summary:`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 50,
    });
    
    const summary = response.choices[0].message.content?.trim() || '';
    
    logger.info({ summary }, '🤖 AI thread summary generated');
    
    return summary;
  } catch (error) {
    logger.error({ error }, '❌ AI summarization failed');
    return null;
  }
}

/**
 * Suggest a reply to the latest message
 */
export async function suggestReply(
  ticketSubject: string,
  messages: Array<{ body: string; senderRole?: string | null }>
) {
  if (!featureFlags.aiSuggestReply) {
    return null;
  }
  
  if (!openai) {
    logger.warn('OpenAI not configured, skipping AI reply suggestion');
    return null;
  }
  
  try {
    const thread = messages
      .map((m) => `${m.senderRole || 'User'}: ${m.body}`)
      .join('\n\n');
    
    const prompt = `You are a helpful support agent for Craved Artisan, a marketplace for artisan food vendors.

Ticket: ${ticketSubject}

Conversation:
${thread}

Draft a professional, friendly, and helpful reply to the latest message. Be specific, empathetic, and solution-oriented. Keep it concise (2-3 sentences).

Reply:`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 150,
    });
    
    const suggestedReply = response.choices[0].message.content?.trim() || '';
    
    logger.info('🤖 AI reply suggestion generated');
    
    return suggestedReply;
  } catch (error) {
    logger.error({ error }, '❌ AI reply suggestion failed');
    return null;
  }
}

/**
 * Analyze sentiment of messages (detect angry/frustrated customers)
 */
export async function analyzeSentiment(body: string) {
  if (!featureFlags.aiSentiment) {
    return null;
  }
  
  if (!openai) {
    logger.warn('OpenAI not configured, skipping sentiment analysis');
    return null;
  }
  
  try {
    const prompt = `Analyze the sentiment of this support message.

Message: ${body}

Return JSON with:
- sentiment: one of [positive, neutral, frustrated, angry]
- urgency: one of [low, medium, high]
- reasoning: brief explanation`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });
    
    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    logger.info({
      sentiment: result.sentiment,
      urgency: result.urgency,
    }, '🤖 AI sentiment analysis complete');
    
    return result;
  } catch (error) {
    logger.error({ error }, '❌ AI sentiment analysis failed');
    return null;
  }
}

/**
 * Extract topic tags from ticket content
 */
export async function extractTags(subject: string, description: string) {
  if (!featureFlags.aiAutoCategory) {
    return [];
  }
  
  if (!openai) {
    logger.warn('OpenAI not configured, skipping tag extraction');
    return [];
  }
  
  try {
    const prompt = `Extract 2-4 relevant topic tags from this support ticket.

Subject: ${subject}
Description: ${description}

Return a JSON array of lowercase tags (e.g., ["refund", "shipping-delay", "payment"]).

Tags should be specific and actionable. Use hyphens for multi-word tags.

Tags:`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });
    
    const result = JSON.parse(response.choices[0].message.content || '{}');
    const tags = result.tags || [];
    
    logger.info({ tags }, '🤖 AI tags extracted');
    
    return tags;
  } catch (error) {
    logger.error({ error }, '❌ AI tag extraction failed');
    return [];
  }
}

/**
 * Get feature flags status
 */
export function getFeatureFlags() {
  return featureFlags;
}

