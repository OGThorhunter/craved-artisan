import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Calendar,
  Grid3X3,
  BarChart3,
  MessageSquare,
  Send,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Target,
  FileText,
  Image,
  Link,
  Settings,
  MoreHorizontal,
  TrendingUp,
  X,
  List,
  Upload,
  Download,
  Share2,
  Heart,
  MessageCircle,
  ExternalLink,
  Filter,
  SortAsc,
  Sparkles,
  Brain,
  Hash,
  MapPin,
  Tag,
  Copy,
  Archive,
  Star,
  Folder,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Zap,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Video
} from 'lucide-react';

// Types
interface SocialPost {
  id: string;
  content: string;
  platforms: string[];
  status: 'draft' | 'scheduled' | 'publishing' | 'posted' | 'failed';
  scheduledAt?: string;
  publishedAt?: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    impressions: number;
    reach: number;
  };
  hashtags: string[];
  productTags: string[];
  mediaUrls: string[];
  location?: string;
  createdAt: string;
  updatedAt: string;
}

interface SocialAsset {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  dimensions?: { width: number; height: number };
  duration?: number;
  size: number;
  tags: string[];
  folder: string;
  createdAt: string;
}

interface CaptionSnippet {
  id: string;
  title: string;
  content: string;
  category: string;
  hashtags: string[];
  createdAt: string;
}

interface HashtagGroup {
  id: string;
  name: string;
  hashtags: string[];
  category: string;
  usageCount: number;
}

interface SocialThread {
  id: string;
  platform: string;
  type: 'comment' | 'dm';
  content: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    isVerified: boolean;
  };
  status: 'unread' | 'read' | 'replied' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  createdAt: string;
  replies: Array<{
    id: string;
    content: string;
    author: string;
    createdAt: string;
  }>;
}

interface SocialAnalytics {
  totalPosts: number;
  scheduled: number;
  engagementRate: number;
  reach: number;
  impressions: number;
  profileVisits: number;
  linkClicks: number;
  topPosts: SocialPost[];
  bestTimes: Array<{ platform: string; hour: number; engagement: number }>;
  hashtagPerformance: Array<{ hashtag: string; usage: number; engagement: number }>;
}

interface SocialMediaTabProps {
  posts: SocialPost[];
  assets: SocialAsset[];
  threads: SocialThread[];
  analytics: Partial<SocialAnalytics>;
  onPostCreate: (post: Partial<SocialPost>) => void;
  onPostUpdate: (post: SocialPost) => void;
  onPostDelete: (id: string) => void;
  onPostSchedule: (id: string, scheduledAt: string) => void;
  onAssetUpload: (asset: Partial<SocialAsset>) => void;
  onThreadReply: (threadId: string, reply: string) => void;
  onThreadAssign: (threadId: string, assignee: string) => void;
  isLoading: boolean;
}

const SocialMediaTab: React.FC<SocialMediaTabProps> = ({
  posts,
  assets,
  threads,
  analytics,
  onPostCreate,
  onPostUpdate,
  onPostDelete,
  onPostSchedule,
  onAssetUpload,
  onThreadReply,
  onThreadAssign,
  isLoading
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'planner' | 'library' | 'analytics' | 'inbox'>('planner');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [showComposer, setShowComposer] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [showAISuggestions, setShowAISuggestions] = useState(true);
  const [showConnections, setShowConnections] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  
  // Post creation state
  const [postForm, setPostForm] = useState({
    selectedPlatforms: [] as string[],
    content: '',
    hashtags: [] as string[],
    scheduledTime: null as Date | null,
    mediaFiles: [] as File[],
    productTags: [] as string[],
    location: '',
    linkUrl: ''
  });
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  // Mock data queries
  const { data: mockAnalytics = {
    totalPosts: 156,
    scheduled: 12,
    engagementRate: 4.2,
    reach: 2847,
    impressions: 12450,
    profileVisits: 892,
    linkClicks: 234
  } } = useQuery({
    queryKey: ['social-analytics'],
    queryFn: () => Promise.resolve({
      totalPosts: 156,
      scheduled: 12,
      engagementRate: 4.2,
      reach: 2847,
      impressions: 12450,
      profileVisits: 892,
      linkClicks: 234
    }),
  });

  const { data: mockSnippets = [] } = useQuery({
    queryKey: ['caption-snippets'],
    queryFn: () => Promise.resolve([]),
  });

  const { data: mockConnections = {
    facebook: { connected: false, lastSync: null, username: null },
    instagram: { connected: false, lastSync: null, username: null },
    twitter: { connected: false, lastSync: null, username: null },
    tiktok: { connected: false, lastSync: null, username: null },
    youtube: { connected: false, lastSync: null, username: null }
  } } = useQuery({
    queryKey: ['social-connections'],
    queryFn: () => Promise.resolve({
      facebook: { connected: false, lastSync: null, username: null },
      instagram: { connected: false, lastSync: null, username: null },
      twitter: { connected: false, lastSync: null, username: null },
      tiktok: { connected: false, lastSync: null, username: null },
      youtube: { connected: false, lastSync: null, username: null }
    }),
  });

  const { data: mockHashtagGroups = [] } = useQuery({
    queryKey: ['hashtag-groups'],
    queryFn: () => Promise.resolve([]),
  });

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-blue-400' },
    { id: 'tiktok', name: 'TikTok', icon: Video, color: 'text-black' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-600' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted': return 'bg-green-100 text-green-800';
      case 'publishing': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'posted': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'publishing': return <Send className="h-4 w-4 text-blue-500" />;
      case 'scheduled': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'draft': return <Edit className="h-4 w-4 text-gray-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
  const formatNumber = (num: number | undefined) => (num || 0).toLocaleString();

  const handleConnectPlatform = async (platformId: string) => {
    setConnectingPlatform(platformId);
    
    try {
      // Simulate the OAuth flow steps
      console.log(`Starting OAuth flow for ${platformId}...`);
      
      // Step 1: Generate OAuth URL (simulated)
      await new Promise(resolve => setTimeout(resolve, 500));
      const oauthUrl = `https://${platformId}.com/oauth/authorize?client_id=your_app_id&redirect_uri=${encodeURIComponent(window.location.origin + '/oauth/callback')}&scope=read,write&response_type=code&state=${platformId}`;
      
      // Step 2: Show what would happen in real implementation
      const shouldProceed = confirm(
        `This would redirect you to ${platformId}'s OAuth page:\n\n${oauthUrl}\n\nClick OK to simulate a successful connection, or Cancel to abort.`
      );
      
      if (shouldProceed) {
        // Step 3: Simulate callback handling and token exchange
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`OAuth callback received for ${platformId}`);
        
        // Step 4: Simulate storing tokens and updating connection status
        await new Promise(resolve => setTimeout(resolve, 500));
        
        alert(`✅ Successfully connected to ${platformId}!\n\nIn a real implementation:\n• OAuth tokens would be stored securely\n• Connection status would be updated in database\n• You could now schedule posts to this platform`);
      } else {
        console.log(`OAuth flow cancelled for ${platformId}`);
      }
      
    } catch (error) {
      console.error('Connection failed:', error);
      alert(`❌ Failed to connect to ${platformId}. Please try again.\n\nError: ${error}`);
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleDisconnectPlatform = async (platformId: string) => {
    const confirmed = confirm(
      `Are you sure you want to disconnect ${platformId}?\n\nThis will:\n• Revoke access tokens\n• Stop scheduled posts to this platform\n• Remove analytics data access`
    );
    
    if (confirmed) {
      try {
        console.log(`Disconnecting from ${platformId}...`);
        
        // Simulate API call to revoke tokens
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        alert(`✅ ${platformId} has been successfully disconnected!\n\nIn a real implementation:\n• OAuth tokens would be revoked\n• Connection status would be updated in database\n• Scheduled posts would be paused for this platform`);
        
        // Here you would typically:
        // 1. Call your API to revoke tokens: await api.delete(`/social/connections/${platformId}`)
        // 2. Update the connection status in your database
        // 3. Refresh the connections data: queryClient.invalidateQueries(['social-connections'])
        // 4. Pause any scheduled posts for this platform
        
      } catch (error) {
        console.error('Disconnect failed:', error);
        alert(`❌ Failed to disconnect ${platformId}. Please try again.\n\nError: ${error}`);
      }
    }
  };

  const handleCreatePost = async () => {
    if (!postForm.content.trim()) {
      alert('Please enter post content');
      return;
    }
    
    if (postForm.selectedPlatforms.length === 0) {
      alert('Please select at least one platform');
      return;
    }

    setIsCreatingPost(true);
    
    try {
      console.log('Creating post:', postForm);
      
      // Simulate API call to create post
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const postData = {
        id: Date.now().toString(),
        content: postForm.content,
        platforms: postForm.selectedPlatforms,
        hashtags: postForm.hashtags,
        scheduledTime: postForm.scheduledTime,
        status: postForm.scheduledTime ? 'scheduled' : 'posted',
        createdAt: new Date().toISOString(),
        mediaFiles: postForm.mediaFiles,
        productTags: postForm.productTags,
        location: postForm.location,
        linkUrl: postForm.linkUrl
      };
      
      // Call the parent component's handler
      onPostCreate(postData);
      
      alert(`✅ Post created successfully!\n\nPlatforms: ${postForm.selectedPlatforms.join(', ')}\nStatus: ${postForm.scheduledTime ? 'Scheduled' : 'Posted immediately'}\n\nIn a real implementation, this would:\n• Save to database\n• Schedule with social platforms\n• Update analytics tracking`);
      
      // Reset form and close modal
      setPostForm({
        selectedPlatforms: [],
        content: '',
        hashtags: [],
        scheduledTime: null,
        mediaFiles: [],
        productTags: [],
        location: '',
        linkUrl: ''
      });
      setShowComposer(false);
      
    } catch (error) {
      console.error('Post creation failed:', error);
      alert(`❌ Failed to create post. Please try again.\n\nError: ${error}`);
    } finally {
      setIsCreatingPost(false);
    }
  };

  const togglePlatformSelection = (platformId: string) => {
    setPostForm(prev => ({
      ...prev,
      selectedPlatforms: prev.selectedPlatforms.includes(platformId)
        ? prev.selectedPlatforms.filter(id => id !== platformId)
        : [...prev.selectedPlatforms, platformId]
    }));
  };

  const addHashtag = (hashtag: string) => {
    const cleanHashtag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;
    if (!postForm.hashtags.includes(cleanHashtag)) {
      setPostForm(prev => ({
        ...prev,
        hashtags: [...prev.hashtags, cleanHashtag]
      }));
    }
  };

  const removeHashtag = (hashtag: string) => {
    setPostForm(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter(h => h !== hashtag)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header with Sub-tabs */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Social Media</h2>
          <p className="text-gray-600 text-sm">Plan posts, manage engagement, and measure performance</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowConnections(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            title="Manage social media connections"
            aria-label="Manage social media connections"
          >
            <Settings className="h-4 w-4" />
            Connections
          </button>
          <button
            onClick={() => setShowComposer(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Create new social media post"
            aria-label="Create new social media post"
          >
            <Plus className="h-4 w-4" />
            Create Post
          </button>
          <button
            onClick={() => setShowAISuggestions(!showAISuggestions)}
            className={`p-2 rounded-lg transition-colors ${
              showAISuggestions ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
            }`}
            title="Toggle AI Suggestions"
          >
            <Sparkles className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200 bg-[#F7F2EC]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{mockAnalytics.totalPosts}</p>
              <p className="text-xs text-gray-500">Last 90 days</p>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200 bg-[#F7F2EC]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{mockAnalytics.scheduled}</p>
              <p className="text-xs text-gray-500">Future posts</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200 bg-[#F7F2EC]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
              <p className="text-2xl font-bold text-gray-900">{mockAnalytics.engagementRate}%</p>
              <p className="text-xs text-gray-500">Last 30 days</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200 bg-[#F7F2EC]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Reach</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(mockAnalytics.reach)}</p>
              <p className="text-xs text-gray-500">Last 30 days</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'planner', label: 'Planner', icon: Calendar, description: 'Calendar & queue' },
            { id: 'library', label: 'Library', icon: Grid3X3, description: 'Media & captions' },
            { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Performance' },
            { id: 'inbox', label: 'Inbox', icon: MessageSquare, description: 'Comments & DMs' },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeSubTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                title={tab.description}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* AI Suggestions Sidebar */}
      {showAISuggestions && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">AI Suggestions</h3>
            </div>
            <button
              onClick={() => setShowAISuggestions(false)}
              className="text-gray-400 hover:text-gray-600"
              title="Close AI suggestions"
              aria-label="Close AI suggestions panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2">
            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <p className="text-sm font-medium text-gray-900 mb-1">Post Ideas</p>
              <p className="text-xs text-gray-600">"Showcase your handmade soap collection with behind-the-scenes footage"</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <p className="text-sm font-medium text-gray-900 mb-1">Best Time to Post</p>
              <p className="text-xs text-gray-600">Instagram: 2-3 PM, Facebook: 6-8 PM (based on your audience)</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <p className="text-sm font-medium text-gray-900 mb-1">Hashtag Recommendations</p>
              <p className="text-xs text-gray-600">#handmade #artisan #localbusiness #atlanta #organic</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="space-y-6">
        {activeSubTab === 'planner' && (
          <div className="space-y-6">
            {/* Planner Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex bg-white rounded-lg p-1 shadow-sm border">
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'calendar'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Calendar
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'list'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <List className="h-4 w-4 inline mr-2" />
                    List
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Filter posts by status"
                  aria-label="Filter posts by status"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="posted">Posted</option>
                  <option value="failed">Failed</option>
                </select>

                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Filter posts by platform"
                  aria-label="Filter posts by platform"
                >
                  <option value="all">All Platforms</option>
                  {platforms.map(platform => (
                    <option key={platform.id} value={platform.id}>{platform.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Planner Content */}
            {viewMode === 'calendar' ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Calendar View</h3>
                  <p className="text-gray-600 mb-4">Drag and drop posts to reschedule them</p>
                  <p className="text-sm text-gray-500">Calendar implementation coming soon...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                    <p className="text-gray-600 mb-4">Create your first social media post to get started</p>
                    <button
                      onClick={() => setShowComposer(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="Create your first social media post"
                      aria-label="Create your first social media post"
                    >
                      <Plus className="h-4 w-4" />
                      Create Post
                    </button>
                  </div>
                ) : (
                  posts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Share2 className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center gap-1">
                                {post.platforms.map(platform => {
                                  const platformData = platforms.find(p => p.id === platform);
                                  const Icon = platformData?.icon || Globe;
                                  return (
                                    <div key={platform} className={`p-1 rounded ${platformData?.color || 'text-gray-600'}`}>
                                      <Icon className="h-4 w-4" />
                                    </div>
                                  );
                                })}
                              </div>
                              {getStatusIcon(post.status)}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                                {post.status}
                              </span>
                            </div>
                            <p className="text-gray-900 mb-2 line-clamp-2">{post.content}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>Likes: {post.engagement.likes}</span>
                              <span>Comments: {post.engagement.comments}</span>
                              <span>Shares: {post.engagement.shares}</span>
                              <span>Reach: {post.engagement.reach}</span>
                            </div>
                            {post.scheduledAt && (
                              <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                                <Clock className="h-4 w-4" />
                                <span>Scheduled for {formatDate(post.scheduledAt)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onPostSchedule(post.id, new Date().toISOString())}
                            className="p-2 text-green-600 hover:text-green-700 transition-colors"
                            title="Schedule Post"
                          >
                            <Clock className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onPostUpdate(post)}
                            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                            title="Edit Post"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onPostDelete(post.id)}
                            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                            title="Delete Post"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'library' && (
          <div className="space-y-6">
            {/* Library Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Folder className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">All Assets</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Upload new assets"
                  aria-label="Upload new assets to library"
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </button>
              </div>
            </div>

            {/* Library Content */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {assets.length === 0 ? (
                <div className="col-span-full bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No assets yet</h3>
                  <p className="text-gray-600 mb-4">Upload images and videos to build your content library</p>
                  <button 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Upload assets to library"
                    aria-label="Upload assets to library"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Assets
                  </button>
                </div>
              ) : (
                assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      {asset.type === 'image' ? (
                        <Image className="h-8 w-8 text-gray-400" />
                      ) : (
                        <Play className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">{asset.name}</p>
                    <p className="text-xs text-gray-500">{asset.type}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeSubTab === 'analytics' && (
          <div className="space-y-6">
            {/* Analytics Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Performance Analytics</h3>
                <p className="text-sm text-gray-600">Track your social media performance and engagement</p>
              </div>
              
              <div className="flex items-center gap-3">
                <select 
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Select time range"
                  aria-label="Select analytics time range"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
            </div>

            {/* Analytics KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Engagement Rate</h4>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{mockAnalytics.engagementRate}%</p>
                <p className="text-sm text-gray-600">+0.8% from last period</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Total Reach</h4>
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(mockAnalytics.reach)}</p>
                <p className="text-sm text-gray-600">+12% from last period</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Profile Visits</h4>
                  <ExternalLink className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(mockAnalytics.profileVisits)}</p>
                <p className="text-sm text-gray-600">+5% from last period</p>
              </div>
            </div>

            {/* Charts Placeholder */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="font-medium text-gray-900 mb-4">Engagement Over Time</h4>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Chart implementation coming soon...</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'inbox' && (
          <div className="space-y-6">
            {/* Inbox Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex bg-white rounded-lg p-1 shadow-sm border">
                  <button className="px-4 py-2 rounded-md text-sm font-medium bg-blue-500 text-white">
                    All
                  </button>
                  <button className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900">
                    Unread
                  </button>
                  <button className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900">
                    Needs Reply
                  </button>
                  <button className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900">
                    Priority
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Inbox Content */}
            <div className="space-y-4">
              {threads.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                  <p className="text-gray-600 mb-4">Engage with your audience through comments and DMs</p>
                </div>
              ) : (
                threads.map((thread) => (
                  <div
                    key={thread.id}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <img
                            src={thread.author.avatar}
                            alt={thread.author.name}
                            className="w-10 h-10 rounded-full"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900">{thread.author.name}</h4>
                            <span className="text-sm text-gray-500">@{thread.author.username}</span>
                            {thread.author.isVerified && (
                              <CheckCircle className="h-4 w-4 text-blue-500" />
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              thread.platform === 'instagram' ? 'bg-pink-100 text-pink-800' :
                              thread.platform === 'facebook' ? 'bg-blue-100 text-blue-800' :
                              thread.platform === 'twitter' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {thread.platform}
                            </span>
                          </div>
                          <p className="text-gray-900 mb-2">{thread.content}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{formatDate(thread.createdAt)}</span>
                            <span className="capitalize">{thread.type}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onThreadReply(thread.id, '')}
                          className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                          title="Reply"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onThreadAssign(thread.id, 'me')}
                          className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                          title="Assign"
                        >
                          <Users className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Post Composer Modal */}
      {showComposer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Create Post</h2>
                <button
                  onClick={() => setShowComposer(false)}
                  className="text-gray-500 hover:text-gray-700"
                  title="Close composer"
                  aria-label="Close post composer modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Platforms</label>
                <div className="flex flex-wrap gap-2">
                  {platforms.map((platform) => {
                    const Icon = platform.icon;
                    const isSelected = postForm.selectedPlatforms.includes(platform.id);
                    return (
                      <button
                        key={platform.id}
                        onClick={() => togglePlatformSelection(platform.id)}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                        title={`Select ${platform.name} for posting`}
                        aria-label={`Select ${platform.name} for posting`}
                      >
                        <Icon className="h-4 w-4" />
                        {platform.name}
                        {isSelected && <CheckCircle className="h-4 w-4 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
                {postForm.selectedPlatforms.length > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {postForm.selectedPlatforms.map(id => platforms.find(p => p.id === id)?.name).join(', ')}
                  </p>
                )}
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  rows={6}
                  value={postForm.content}
                  onChange={(e) => setPostForm(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Write your post content here..."
                  title="Enter your post content"
                  aria-label="Post content textarea"
                />
                <div className="mt-2 text-sm text-gray-500">
                  {postForm.content.length} characters
                </div>
              </div>

              {/* Hashtags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hashtags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {postForm.hashtags.map((hashtag) => (
                    <span key={hashtag} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {hashtag}
                      <button 
                        onClick={() => removeHashtag(hashtag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                        title={`Remove ${hashtag} hashtag`}
                        aria-label={`Remove ${hashtag} hashtag`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <button 
                    onClick={() => {
                      const hashtag = prompt('Enter hashtag (without #):');
                      if (hashtag?.trim()) addHashtag(hashtag.trim());
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-full text-sm text-gray-600 hover:bg-gray-50"
                    title="Add new hashtag"
                    aria-label="Add new hashtag"
                  >
                    <Plus className="h-3 w-3" />
                    Add hashtag
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  Popular: <button onClick={() => addHashtag('handmade')} className="text-blue-600 hover:underline">#handmade</button>, <button onClick={() => addHashtag('artisan')} className="text-blue-600 hover:underline">#artisan</button>, <button onClick={() => addHashtag('local')} className="text-blue-600 hover:underline">#local</button>
                </div>
              </div>

              {/* Media */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Media</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Drag and drop images or videos here</p>
                  <p className="text-sm text-gray-500">or click to browse</p>
                </div>
              </div>

              {/* Schedule */}
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleCreatePost()}
                  disabled={isCreatingPost}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isCreatingPost
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  title="Post immediately to selected platforms"
                  aria-label="Post immediately to selected platforms"
                >
                  {isCreatingPost ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Post Now
                    </>
                  )}
                </button>
                <button 
                  onClick={() => {
                    const dateTime = prompt('Enter date and time (YYYY-MM-DD HH:MM):');
                    if (dateTime) {
                      const scheduledDate = new Date(dateTime);
                      if (!isNaN(scheduledDate.getTime())) {
                        setPostForm(prev => ({ ...prev, scheduledTime: scheduledDate }));
                        handleCreatePost();
                      } else {
                        alert('Invalid date format. Please use YYYY-MM-DD HH:MM');
                      }
                    }
                  }}
                  disabled={isCreatingPost}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  title="Schedule post for later"
                  aria-label="Schedule post for later"
                >
                  <Clock className="h-4 w-4" />
                  Schedule
                </button>
                <button 
                  onClick={() => {
                    setPostForm(prev => ({ ...prev, scheduledTime: null }));
                    handleCreatePost();
                  }}
                  disabled={isCreatingPost}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  title="Save as draft"
                  aria-label="Save as draft"
                >
                  <Copy className="h-4 w-4" />
                  Save Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connections Modal */}
      {showConnections && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Social Media Connections</h3>
                <button
                  onClick={() => setShowConnections(false)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Close connections modal"
                  aria-label="Close connections modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <p className="text-gray-600 mb-6">
                Connect your social media accounts to start scheduling posts, managing engagement, and tracking analytics.
              </p>

              <div className="space-y-4">
                {platforms.map((platform) => {
                  const connection = mockConnections[platform.id as keyof typeof mockConnections];
                  const isConnected = connection?.connected || false;
                  const PlatformIcon = platform.icon;
                  
                  return (
                    <div key={platform.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <PlatformIcon className={`h-8 w-8 ${platform.color}`} />
                        <div>
                          <h4 className="font-medium text-gray-900">{platform.name}</h4>
                          <p className="text-sm text-gray-600">
                            {isConnected 
                              ? `Connected as @${connection.username || 'user'}`
                              : 'Not connected'
                            }
                          </p>
                          {isConnected && connection.lastSync && (
                            <p className="text-xs text-gray-500">
                              Last sync: {new Date(connection.lastSync).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isConnected ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm">Connected</span>
                            </div>
                            <button
                              onClick={() => handleDisconnectPlatform(platform.id)}
                              className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Disconnect account"
                              aria-label="Disconnect account"
                            >
                              Disconnect
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleConnectPlatform(platform.id)}
                            disabled={connectingPlatform === platform.id}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              connectingPlatform === platform.id
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                            title="Connect account"
                            aria-label="Connect account"
                          >
                            {connectingPlatform === platform.id ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                Connecting...
                              </div>
                            ) : (
                              'Connect'
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">What you can do with connected accounts:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Schedule posts across all platforms</li>
                  <li>• Monitor comments and direct messages</li>
                  <li>• Track engagement and analytics</li>
                  <li>• Respond to messages from one inbox</li>
                  <li>• Auto-sync content and media</li>
                </ul>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowConnections(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Learn more about social media integration"
                  aria-label="Learn more about social media integration"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialMediaTab;
