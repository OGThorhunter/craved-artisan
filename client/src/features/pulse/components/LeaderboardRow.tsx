import React from 'react';
import type { LeaderboardRow as LeaderboardRowType } from '../types';

interface LeaderboardRowProps {
  product: LeaderboardRowType;
  rank: number;
}

export function LeaderboardRow({ product, rank }: LeaderboardRowProps) {
  return (
    <div className="bg-white rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-[#5B6E02] text-white rounded-full flex items-center justify-center text-sm font-bold">
          {rank}
        </div>
        <div>
          <h4 className="font-medium text-[#333]">{product.name}</h4>
          <p className="text-sm text-[#777]">Qty: {product.qty}</p>
        </div>
      </div>
      <div className="text-right">
        <div className="font-semibold text-[#333]">${product.revenue.toLocaleString()}</div>
      </div>
    </div>
  );
}
