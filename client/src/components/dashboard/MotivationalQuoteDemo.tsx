import React from 'react';
import MotivationalQuote from './MotivationalQuote';
import { motivationalQuotes } from '../../data/motivationalQuotes';

const MotivationalQuoteDemo: React.FC = () => {
  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Motivational Quote Variants</h2>
      
      {/* Default Variant */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Default (Blue)</h3>
        <MotivationalQuote
          quote="Success is not final, failure is not fatal: it is the courage to continue that counts."
          author="Winston Churchill"
        />
      </div>

      {/* Success Variant */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Success (Green)</h3>
        <MotivationalQuote
          quote="The way to get started is to quit talking and begin doing."
          author="Walt Disney"
          variant="success"
        />
      </div>

      {/* Warning Variant */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Warning (Yellow)</h3>
        <MotivationalQuote
          quote="Innovation distinguishes between a leader and a follower."
          author="Steve Jobs"
          variant="warning"
        />
      </div>

      {/* Info Variant */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Info (Cyan)</h3>
        <MotivationalQuote
          quote="The greatest leader is not necessarily the one who does the greatest things."
          author="Ronald Reagan"
          variant="info"
        />
      </div>

      {/* Purple Variant */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Purple</h3>
        <MotivationalQuote
          quote="The only impossible journey is the one you never begin."
          author="Tony Robbins"
          variant="purple"
        />
      </div>

      {/* Pink Variant */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Pink</h3>
        <MotivationalQuote
          quote="The only way to do great work is to love what you do."
          author="Steve Jobs"
          variant="pink"
        />
      </div>

      {/* Random Quote from Library */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Random Quote from Library</h3>
        <MotivationalQuote
          quote={motivationalQuotes[5].quote}
          author={motivationalQuotes[5].author}
          icon={motivationalQuotes[5].icon}
          variant={motivationalQuotes[5].variant}
        />
      </div>
    </div>
  );
};

export default MotivationalQuoteDemo;
