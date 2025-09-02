import React from 'react';
import type { SystemPill as SystemPillType } from '../types';

interface SystemPillProps {
  pill: SystemPillType;
}

export function SystemPill({ pill }: SystemPillProps) {
  const statusColors = {
    ok: 'bg-green-100 text-green-800',
    warn: 'bg-yellow-100 text-yellow-800',
    down: 'bg-red-100 text-red-800'
  };

  return (
    <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[pill.status]}`}>
      {pill.name}
    </div>
  );
}
