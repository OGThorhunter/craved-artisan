import { Response } from 'express';
import { EventEmitter } from 'events';

// Store EventEmitter instances per vendorId
const vendorEmitters = new Map<string, EventEmitter>();

export function subscribe(vendorId: string, res: Response) {
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', vendorId })}\n\n`);

  // Get or create EventEmitter for this vendor
  let emitter = vendorEmitters.get(vendorId);
  if (!emitter) {
    emitter = new EventEmitter();
    vendorEmitters.set(vendorId, emitter);
  }

  // Handle new messages
  const messageHandler = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  emitter.on('message', messageHandler);

  // Keep connection alive with periodic pings
  const keepAlive = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'ping', timestamp: Date.now() })}\n\n`);
  }, 30000); // Every 30 seconds

  // Handle client disconnect
  res.on('close', () => {
    clearInterval(keepAlive);
    emitter?.off('message', messageHandler);
    
    // Clean up emitter if no more listeners
    if (emitter && emitter.listenerCount('message') === 0) {
      vendorEmitters.delete(vendorId);
    }
  });

  // Handle errors
  res.on('error', () => {
    clearInterval(keepAlive);
    emitter?.off('message', messageHandler);
  });
}

export function publish(vendorId: string, event: string, data: any) {
  const emitter = vendorEmitters.get(vendorId);
  if (emitter) {
    emitter.emit(event, { type: event, ...data, timestamp: Date.now() });
  }
}
