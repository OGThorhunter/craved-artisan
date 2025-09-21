import { Brain, Lightbulb, Target, TrendingUp, Heart, Star, Zap, Users, Award } from 'lucide-react';

export interface QuoteData {
  quote: string;
  author: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  variant: 'default' | 'success' | 'warning' | 'info' | 'purple' | 'pink';
  category: 'success' | 'growth' | 'perseverance' | 'innovation' | 'leadership' | 'motivation';
}

export const motivationalQuotes: QuoteData[] = [
  // Success & Achievement
  {
    quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    icon: Brain,
    variant: 'default',
    category: 'success'
  },
  {
    quote: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    icon: Target,
    variant: 'success',
    category: 'success'
  },
  {
    quote: "Don't be afraid to give up the good to go for the great.",
    author: "John D. Rockefeller",
    icon: TrendingUp,
    variant: 'info',
    category: 'success'
  },

  // Growth & Learning
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    icon: Heart,
    variant: 'pink',
    category: 'growth'
  },
  {
    quote: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs",
    icon: Lightbulb,
    variant: 'warning',
    category: 'innovation'
  },
  {
    quote: "Your limitation—it's only your imagination.",
    author: "Unknown",
    icon: Zap,
    variant: 'purple',
    category: 'growth'
  },

  // Perseverance & Resilience
  {
    quote: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    icon: Star,
    variant: 'pink',
    category: 'perseverance'
  },
  {
    quote: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle",
    icon: Lightbulb,
    variant: 'warning',
    category: 'perseverance'
  },
  {
    quote: "Success is walking from failure to failure with no loss of enthusiasm.",
    author: "Winston Churchill",
    icon: TrendingUp,
    variant: 'success',
    category: 'perseverance'
  },

  // Leadership & Teamwork
  {
    quote: "The greatest leader is not necessarily the one who does the greatest things. He is the one that gets the people to do the greatest things.",
    author: "Ronald Reagan",
    icon: Users,
    variant: 'info',
    category: 'leadership'
  },
  {
    quote: "Leadership is the capacity to translate vision into reality.",
    author: "Warren Bennis",
    icon: Target,
    variant: 'default',
    category: 'leadership'
  },

  // Motivation & Inspiration
  {
    quote: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
    icon: Zap,
    variant: 'purple',
    category: 'motivation'
  },
  {
    quote: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
    icon: Lightbulb,
    variant: 'warning',
    category: 'motivation'
  },
  {
    quote: "Excellence is not a skill, it's an attitude.",
    author: "Ralph Marston",
    icon: Award,
    variant: 'success',
    category: 'motivation'
  }
];

// Helper function to get a random quote
export const getRandomQuote = (): QuoteData => {
  return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
};

// Helper function to get a quote by category
export const getQuoteByCategory = (category: QuoteData['category']): QuoteData => {
  const categoryQuotes = motivationalQuotes.filter(quote => quote.category === category);
  return categoryQuotes[Math.floor(Math.random() * categoryQuotes.length)];
};

// Helper function to get a specific quote by author
export const getQuoteByAuthor = (author: string): QuoteData | undefined => {
  return motivationalQuotes.find(quote => quote.author.toLowerCase().includes(author.toLowerCase()));
};









