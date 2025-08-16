import React from 'react';
import { Quote } from 'lucide-react';

const businessQuotes = [
  {
    quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    quote: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson"
  },
  {
    quote: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  },
  {
    quote: "Success usually comes to those who are too busy to be looking for it.",
    author: "Henry David Thoreau"
  },
  {
    quote: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney"
  },
  {
    quote: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle"
  },
  {
    quote: "The only limit to our realization of tomorrow will be our doubts of today.",
    author: "Franklin D. Roosevelt"
  },
  {
    quote: "What you get by achieving your goals is not as important as what you become by achieving your goals.",
    author: "Zig Ziglar"
  },
  {
    quote: "The best revenge is massive success.",
    author: "Frank Sinatra"
  },
  {
    quote: "I find that the harder I work, the more luck I seem to have.",
    author: "Thomas Jefferson"
  },
  {
    quote: "Success is walking from failure to failure with no loss of enthusiasm.",
    author: "Winston Churchill"
  },
  {
    quote: "The difference between a successful person and others is not a lack of strength, not a lack of knowledge, but rather a lack in will.",
    author: "Vince Lombardi"
  },
  {
    quote: "Your time is limited, don't waste it living someone else's life.",
    author: "Steve Jobs"
  },
  {
    quote: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    author: "Nelson Mandela"
  },
  {
    quote: "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson"
  },
  {
    quote: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt"
  },
  {
    quote: "Everything you've ever wanted is on the other side of fear.",
    author: "George Addair"
  },
  {
    quote: "Success is not the key to happiness. Happiness is the key to success. If you love what you are doing, you will be successful.",
    author: "Albert Schweitzer"
  },
  {
    quote: "The road to success and the road to failure are almost exactly the same.",
    author: "Colin Davis"
  },
  {
    quote: "Success is not in what you have, but who you are.",
    author: "Bo Bennett"
  },
  {
    quote: "The only way to achieve the impossible is to believe it is possible.",
    author: "Charles Kingsleigh"
  },
  {
    quote: "Don't be afraid to give up the good to go for the great.",
    author: "John D. Rockefeller"
  },
  {
    quote: "The secret of success is to do the common thing uncommonly well.",
    author: "John D. Rockefeller Jr."
  },
  {
    quote: "I never dreamed about success. I worked for it.",
    author: "Estée Lauder"
  },
  {
    quote: "The most difficult thing is the decision to act, the rest is merely tenacity.",
    author: "Amelia Earhart"
  },
  {
    quote: "You miss 100% of the shots you don't take.",
    author: "Wayne Gretzky"
  },
  {
    quote: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb"
  },
  {
    quote: "Success is not just about making money. It's about making a difference.",
    author: "Unknown"
  },
  {
    quote: "The only place where success comes before work is in the dictionary.",
    author: "Vidal Sassoon"
  },
  {
    quote: "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.",
    author: "Steve Jobs"
  },
  {
    quote: "The future depends on what you do today.",
    author: "Mahatma Gandhi"
  },
  {
    quote: "It always seems impossible until it's done.",
    author: "Nelson Mandela"
  },
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    quote: "Success is not the key to happiness. Happiness is the key to success.",
    author: "Albert Schweitzer"
  },
  {
    quote: "The best revenge is massive success.",
    author: "Frank Sinatra"
  },
  {
    quote: "I find that the harder I work, the more luck I seem to have.",
    author: "Thomas Jefferson"
  },
  {
    quote: "Success is walking from failure to failure with no loss of enthusiasm.",
    author: "Winston Churchill"
  },
  {
    quote: "The difference between a successful person and others is not a lack of strength, not a lack of knowledge, but rather a lack in will.",
    author: "Vince Lombardi"
  },
  {
    quote: "Your time is limited, don't waste it living someone else's life.",
    author: "Steve Jobs"
  },
  {
    quote: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    author: "Nelson Mandela"
  },
  {
    quote: "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson"
  },
  {
    quote: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt"
  },
  {
    quote: "Everything you've ever wanted is on the other side of fear.",
    author: "George Addair"
  }
];

const InspirationalQuote: React.FC = () => {
  // Get a random quote on each render
  const randomQuote = businessQuotes[Math.floor(Math.random() * businessQuotes.length)];

  return (
    <div className="bg-gradient-to-r from-[#5B6E02] to-[#8B4513] rounded-lg shadow-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <Quote className="w-5 h-5 text-white/80" />
        </div>
        <div className="flex-1">
          <blockquote className="text-white text-lg font-medium italic leading-relaxed">
            "{randomQuote.quote}"
          </blockquote>
          <cite className="block text-white/80 text-sm mt-2 not-italic">
            — {randomQuote.author}
          </cite>
        </div>
      </div>
    </div>
  );
};

export default InspirationalQuote;
