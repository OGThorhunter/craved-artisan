// React Query Keys for Event Coordinator System

export const queryKeys = {
  // Events
  events: {
    all: ['events'] as const,
    lists: () => [...queryKeys.events.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.events.lists(), filters] as const,
    details: () => [...queryKeys.events.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.events.details(), id] as const,
  },

  // Event Sessions
  sessions: {
    all: ['sessions'] as const,
    lists: () => [...queryKeys.sessions.all, 'list'] as const,
    list: (eventId: string) => [...queryKeys.sessions.lists(), eventId] as const,
    details: () => [...queryKeys.sessions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.sessions.details(), id] as const,
  },

  // Applications
  applications: {
    all: ['applications'] as const,
    lists: () => [...queryKeys.applications.all, 'list'] as const,
    list: (eventId: string, filters?: Record<string, any>) => 
      [...queryKeys.applications.lists(), eventId, filters] as const,
    details: () => [...queryKeys.applications.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.applications.details(), id] as const,
  },

  // Sales Windows
  salesWindows: {
    all: ['salesWindows'] as const,
    lists: () => [...queryKeys.salesWindows.all, 'list'] as const,
    list: (eventId: string) => [...queryKeys.salesWindows.lists(), eventId] as const,
    active: () => [...queryKeys.salesWindows.all, 'active'] as const,
  },

  // Analytics
  analytics: {
    all: ['analytics'] as const,
    event: (eventId: string) => [...queryKeys.analytics.all, 'event', eventId] as const,
    session: (sessionId: string) => [...queryKeys.analytics.all, 'session', sessionId] as const,
    funnel: (eventId: string) => [...queryKeys.analytics.all, 'funnel', eventId] as const,
    heatmap: (eventId: string) => [...queryKeys.analytics.all, 'heatmap', eventId] as const,
  },

  // Layout (Phase 2)
  layout: {
    all: ['layout'] as const,
    event: (eventId: string) => [...queryKeys.layout.all, 'event', eventId] as const,
    zones: (eventId: string) => [...queryKeys.layout.all, 'zones', eventId] as const,
    stalls: (eventId: string) => [...queryKeys.layout.all, 'stalls', eventId] as const,
  },

  // Inventory (Phase 4)
  inventory: {
    all: ['inventory'] as const,
    event: (eventId: string) => [...queryKeys.inventory.all, 'event', eventId] as const,
    holds: (eventId: string) => [...queryKeys.inventory.all, 'holds', eventId] as const,
    assignments: (eventId: string) => [...queryKeys.inventory.all, 'assignments', eventId] as const,
  },

  // Check-in (Phase 5)
  checkin: {
    all: ['checkin'] as const,
    event: (eventId: string) => [...queryKeys.checkin.all, 'event', eventId] as const,
    roster: (eventId: string) => [...queryKeys.checkin.all, 'roster', eventId] as const,
    incidents: (eventId: string) => [...queryKeys.checkin.all, 'incidents', eventId] as const,
  },

  // Financials (Phase 6)
  financials: {
    all: ['financials'] as const,
    event: (eventId: string) => [...queryKeys.financials.all, 'event', eventId] as const,
    payouts: (eventId: string) => [...queryKeys.financials.all, 'payouts', eventId] as const,
    reports: (eventId: string) => [...queryKeys.financials.all, 'reports', eventId] as const,
  },

  // Communications (Phase 7)
  communications: {
    all: ['communications'] as const,
    event: (eventId: string) => [...queryKeys.communications.all, 'event', eventId] as const,
    broadcasts: (eventId: string) => [...queryKeys.communications.all, 'broadcasts', eventId] as const,
    templates: () => [...queryKeys.communications.all, 'templates'] as const,
  },
} as const;
