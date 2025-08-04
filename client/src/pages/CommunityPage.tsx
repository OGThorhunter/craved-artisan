'use client';

import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Clock, 
  Heart, 
  MessageCircle, 
  Plus,
  Search,
  Filter,
  Bookmark,
  Share2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Mock forum data
const forumCategories = [
  {
    id: 1,
    name: 'General Discussion',
    description: 'General topics about local food and community',
    icon: MessageSquare,
    color: 'bg-brand-maroon',
    topics: 45,
    posts: 234
  },
  {
    id: 2,
    name: 'Vendor Tips & Tricks',
    description: 'Share advice and best practices for vendors',
    icon: TrendingUp,
    color: 'bg-brand-green',
    topics: 32,
    posts: 189
  },
  {
    id: 3,
    name: 'Recipe Exchange',
    description: 'Share and discover local recipes',
    icon: Heart,
    color: 'bg-orange-500',
    topics: 67,
    posts: 412
  },
  {
    id: 4,
    name: 'Event Planning',
    description: 'Coordinate and discuss local events',
    icon: Users,
    color: 'bg-purple-500',
    topics: 28,
    posts: 156
  },
  {
    id: 5,
    name: 'Local News',
    description: 'Stay updated on local food community news',
    icon: Clock,
    color: 'bg-blue-500',
    topics: 23,
    posts: 98
  },
  {
    id: 6,
    name: 'Marketplace Feedback',
    description: 'Share experiences and feedback about vendors',
    icon: MessageCircle,
    color: 'bg-teal-500',
    topics: 41,
    posts: 203
  }
];

const recentDiscussions = [
  {
    id: 1,
    title: 'Best sourdough starter tips for beginners?',
    author: 'Sarah M.',
    category: 'Recipe Exchange',
    replies: 12,
    views: 89,
    lastActivity: '2 hours ago',
    isPinned: true,
    isHot: true
  },
  {
    id: 2,
    title: 'Upcoming Locust Grove Market - who\'s going?',
    author: 'Mike T.',
    category: 'Event Planning',
    replies: 8,
    views: 45,
    lastActivity: '4 hours ago',
    isPinned: false,
    isHot: false
  },
  {
    id: 3,
    title: 'New vendor spotlight: Elderberry & Sage Apothecary',
    author: 'Emma L.',
    category: 'Local News',
    replies: 15,
    views: 123,
    lastActivity: '6 hours ago',
    isPinned: false,
    isHot: true
  },
  {
    id: 4,
    title: 'Pricing strategies for small batch products',
    author: 'David K.',
    category: 'Vendor Tips & Tricks',
    replies: 23,
    views: 167,
    lastActivity: '1 day ago',
    isPinned: false,
    isHot: false
  },
  {
    id: 5,
    title: 'Favorite local honey sources?',
    author: 'Lisa P.',
    category: 'General Discussion',
    replies: 19,
    views: 94,
    lastActivity: '1 day ago',
    isPinned: false,
    isHot: false
  }
];

export default function CommunityPage() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredDiscussions = recentDiscussions.filter(discussion => {
    const matchesSearch = discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         discussion.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || discussion.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-brand-beige">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-brand-charcoal mb-2">Community Forum</h1>
              <p className="text-brand-grey">Connect, share, and learn with your local food community</p>
            </div>
            {isAuthenticated && (
              <Link
                href="/community/new-topic"
                className="mt-4 md:mt-0 bg-brand-maroon text-white px-6 py-3 rounded-lg hover:bg-[#681b24] transition flex items-center gap-2 font-medium"
              >
                <Plus className="h-5 w-5" />
                New Topic
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-brand-beige p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-brand-grey" />
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-brand-beige rounded-lg focus:ring-2 focus:ring-brand-maroon focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-brand-beige rounded-lg focus:ring-2 focus:ring-brand-maroon focus:border-transparent"
                title="Filter by category"
              >
                <option value="all">All Categories</option>
                {forumCategories.map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
              <button className="px-4 py-3 border border-brand-beige rounded-lg hover:bg-brand-cream transition flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-brand-beige p-6">
              <h2 className="text-xl font-semibold text-brand-charcoal mb-4">Forum Categories</h2>
              <div className="space-y-3">
                {forumCategories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <Link
                      key={category.id}
                      href={`/community/category/${category.id}`}
                      className="block p-4 rounded-lg hover:bg-brand-cream transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${category.color} text-white`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-brand-charcoal group-hover:text-brand-maroon transition">
                            {category.name}
                          </h3>
                          <p className="text-sm text-brand-grey">{category.description}</p>
                          <div className="flex gap-4 mt-2 text-xs text-brand-grey">
                            <span>{category.topics} topics</span>
                            <span>{category.posts} posts</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Discussions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-brand-beige">
              <div className="p-6 border-b border-brand-beige">
                <h2 className="text-xl font-semibold text-brand-charcoal">Recent Discussions</h2>
              </div>
              
              {filteredDiscussions.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-brand-grey mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-brand-charcoal mb-2">No discussions found</h3>
                  <p className="text-brand-grey">Try adjusting your search or filter criteria</p>
                </div>
              ) : (
                <div className="divide-y divide-brand-beige">
                  {filteredDiscussions.map((discussion) => (
                    <motion.div
                      key={discussion.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 hover:bg-brand-cream transition"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {discussion.isPinned && (
                              <span className="bg-brand-maroon text-white text-xs px-2 py-1 rounded">Pinned</span>
                            )}
                            {discussion.isHot && (
                              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded">Hot</span>
                            )}
                            <span className="text-sm text-brand-grey bg-brand-beige px-2 py-1 rounded">
                              {discussion.category}
                            </span>
                          </div>
                          
                          <Link
                            href={`/community/discussion/${discussion.id}`}
                            className="block"
                          >
                            <h3 className="text-lg font-medium text-brand-charcoal hover:text-brand-maroon transition mb-2">
                              {discussion.title}
                            </h3>
                          </Link>
                          
                          <div className="flex items-center gap-4 text-sm text-brand-grey">
                            <span>by {discussion.author}</span>
                            <span>{discussion.replies} replies</span>
                            <span>{discussion.views} views</span>
                            <span>{discussion.lastActivity}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            className="p-2 text-brand-grey hover:text-brand-maroon transition"
                            title="Bookmark discussion"
                          >
                            <Bookmark className="h-4 w-4" />
                          </button>
                          <button 
                            className="p-2 text-brand-grey hover:text-brand-maroon transition"
                            title="Share discussion"
                          >
                            <Share2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Community Stats */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-brand-beige p-6">
          <h2 className="text-xl font-semibold text-brand-charcoal mb-4">Community Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-maroon">1,234</div>
              <div className="text-sm text-brand-grey">Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-green">567</div>
              <div className="text-sm text-brand-grey">Topics</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-charcoal">2,890</div>
              <div className="text-sm text-brand-grey">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">89</div>
              <div className="text-sm text-brand-grey">Online Now</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 