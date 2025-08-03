import React from 'react';

export const TailwindTest: React.FC = () => {
  return (
    <div className="p-8">
      <div className="p-10 bg-brand-cream-dark text-brand-green text-2xl font-serif mb-4">
        ✅ Tailwind is working — Craved Artisan style!
      </div>
      <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
        ✅ Tailwind CSS Test - Red Box
      </div>
      <div className="bg-brand-green text-white p-4 rounded-lg mb-4">
        ✅ Brand Green Test - Custom Color
      </div>
      <div className="bg-brand-cream text-foreground p-4 rounded-lg border border-gray-300">
        ✅ Brand Cream Test - Custom Background
      </div>
    </div>
  );
}; 