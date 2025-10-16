import { useEffect, useState, useCallback } from 'react';

interface SSEEvent {
  type: string;
  ticketId?: string;
  event?: string;
  data?: any;
  timestamp: string;
}

export function useSupportSSE() {
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Clear events older than 5 minutes to prevent memory leaks
  const clearOldEvents = useCallback(() => {
    setEvents(prev => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      return prev.filter(e => e.timestamp > fiveMinutesAgo);
    });
  }, []);
  
  useEffect(() => {
    let eventSource: EventSource | null = null;
    
    try {
      // Connect to SSE stream
      eventSource = new EventSource('/api/admin/support/stream', {
        withCredentials: true,
      });
      
      // Connection opened
      eventSource.onopen = () => {
        console.log('✅ Support SSE connected');
        setIsConnected(true);
        setError(null);
      };
      
      // Message received
      eventSource.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data) as SSEEvent;
          console.log('📡 Support SSE event:', event);
          
          // Ignore heartbeat events (don't add to events list)
          if (event.type === 'heartbeat') {
            return;
          }
          
          setEvents(prev => [...prev, event]);
        } catch (err) {
          console.error('Failed to parse SSE message:', err);
        }
      };
      
      // Error occurred
      eventSource.onerror = (err) => {
        console.error('❌ Support SSE error:', err);
        setIsConnected(false);
        setError('Connection lost. Retrying...');
        
        // EventSource will automatically try to reconnect
      };
      
    } catch (err) {
      console.error('Failed to create SSE connection:', err);
      setError('Failed to connect to real-time updates');
    }
    
    // Cleanup old events every minute
    const cleanupInterval = setInterval(clearOldEvents, 60000);
    
    // Cleanup on unmount
    return () => {
      if (eventSource) {
        console.log('🔌 Closing Support SSE connection');
        eventSource.close();
      }
      clearInterval(cleanupInterval);
    };
  }, [clearOldEvents]);
  
  // Get latest event for a specific ticket
  const getLatestTicketEvent = useCallback((ticketId: string): SSEEvent | null => {
    const ticketEvents = events.filter(e => e.ticketId === ticketId);
    return ticketEvents.length > 0 ? ticketEvents[ticketEvents.length - 1] : null;
  }, [events]);
  
  // Clear all events
  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);
  
  return {
    events,
    isConnected,
    error,
    getLatestTicketEvent,
    clearEvents,
  };
}

