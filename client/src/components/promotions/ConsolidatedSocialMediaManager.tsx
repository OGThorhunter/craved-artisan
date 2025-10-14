import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

// Consolidated types based on the new database models
interface SocialMediaPost {
  id: string;
  campaignId?: string;
  content: string;
  platforms: string[];
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED';
  scheduledAt?: string;
  publishedAt?: string;
  hashtags?: string[];
  productTags?: string[];
  location?: string;
  mediaUrls?: string[];
  engagementData?: {
    likes: number;
    comments: number;
    shares: number;
    impressions: number;
    reach: number;
  };
  createdAt: string;
  updatedAt: string;
  campaign?: {
    id: string;
    name: string;
    type: string;
  };
  assets?: SocialMediaAsset[];
  analytics?: SocialMediaAnalytics[];
}

interface SocialMediaAsset {
  id: string;
  postId?: string;
  name: string;
  type: 'IMAGE' | 'VIDEO' | 'GIF';
  url: string;
  thumbnailUrl?: string;
  dimensions?: { width: number; height: number };
  duration?: number;
  size: number;
  tags?: string[];
  folder?: string;
  createdAt: string;
}

interface ContentTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  hashtags?: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  vendor?: {
    id: string;
    storeName: string;
  };
}

interface SocialMediaAnalytics {
  id: string;
  postId: string;
  platform: string;
  date: string;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  engagementRate: number;
}

const ConsolidatedSocialMediaManager: React.FC = () => {
  // Consolidated state management - eliminates duplicate state across components
  const [activeView, setActiveView] = useState<'posts' | 'assets' | 'templates' | 'analytics'>('posts');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [folderFilter, setFolderFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SocialMediaPost | null>(null);

  const queryClient = useQueryClient();

  // Consolidated API calls - reduces redundant HTTP requests
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['social-media-posts', { status: statusFilter, platform: platformFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (platformFilter !== 'all') params.append('platform', platformFilter);
      
      const response = await fetch(`/api/vendor/social-media/posts?${params}`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      const result = await response.json();
      return result.data || [];
    }
  });

  const { data: assets, isLoading: assetsLoading } = useQuery({
    queryKey: ['social-media-assets', { folder: folderFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (folderFilter !== 'all') params.append('folder', folderFilter);
      
      const response = await fetch(`/api/vendor/social-media/assets?${params}`);
      if (!response.ok) throw new Error('Failed to fetch assets');
      const result = await response.json();
      return result.data || [];
    }
  });

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['content-templates'],
    queryFn: async () => {
      const response = await fetch('/api/vendor/social-media/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      const result = await response.json();
      return result.data || [];
    }
  });

  // Consolidated mutations - eliminates duplicate API calls
  const createPostMutation = useMutation({
    mutationFn: async (postData: Partial<SocialMediaPost>) => {
      const response = await fetch('/api/vendor/social-media/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      if (!response.ok) throw new Error('Failed to create post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-media-posts'] });
      setShowCreateModal(false);
    }
  });

  const updatePostMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SocialMediaPost> }) => {
      const response = await fetch(`/api/vendor/social-media/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-media-posts'] });
      setShowEditModal(false);
    }
  });

  const publishPostMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/vendor/social-media/posts/${id}/publish`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to publish post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-media-posts'] });
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/vendor/social-media/posts/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-media-posts'] });
    }
  });

  const createAssetMutation = useMutation({
    mutationFn: async (assetData: Partial<SocialMediaAsset>) => {
      const response = await fetch('/api/vendor/social-media/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assetData)
      });
      if (!response.ok) throw new Error('Failed to create asset');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-media-assets'] });
    }
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: Partial<ContentTemplate>) => {
      const response = await fetch('/api/vendor/social-media/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      });
      if (!response.ok) throw new Error('Failed to create template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-templates'] });
    }
  });

  // Consolidated filtering logic
  const getFilteredPosts = () => {
    if (!posts) return [];
    
    return posts.filter((post: SocialMediaPost) => {
      const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (post.hashtags && post.hashtags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      
      const matchesStatus = statusFilter === 'all' || post.status === statusFilter.toUpperCase();
      
      const matchesPlatform = platformFilter === 'all' || post.platforms.includes(platformFilter.toUpperCase());
      
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const now = new Date();
        const postDate = new Date(post.createdAt);
        const daysDiff = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (dateFilter) {
          case 'today':
            matchesDate = daysDiff === 0;
            break;
          case 'week':
            matchesDate = daysDiff <= 7;
            break;
          case 'month':
            matchesDate = daysDiff <= 30;
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesPlatform && matchesDate;
    });
  };

  const getFilteredAssets = () => {
    if (!assets) return [];
    
    return assets.filter((asset: SocialMediaAsset) => {
      const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (asset.tags && asset.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      
      const matchesFolder = folderFilter === 'all' || asset.folder === folderFilter;
      
      return matchesSearch && matchesFolder;
    });
  };

  const getFilteredTemplates = () => {
    if (!templates) return [];
    
    return templates.filter((template: ContentTemplate) => {
      return template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             template.content.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  // Consolidated handlers
  const handleCreatePost = () => {
    setSelectedPost(null);
    setShowCreateModal(true);
  };

  const handleEditPost = (post: SocialMediaPost) => {
    setSelectedPost(post);
    setShowEditModal(true);
  };

  const handleDeletePost = (post: SocialMediaPost) => {
    if (confirm(`Are you sure you want to delete "${post.content.substring(0, 50)}..."?`)) {
      deletePostMutation.mutate(post.id);
    }
  };

  const handlePublishPost = (post: SocialMediaPost) => {
    publishPostMutation.mutate(post.id);
  };

  const handleSchedulePost = (post: SocialMediaPost) => {
    setSelectedPost(post);
    setShowScheduleModal(true);
  };

  const handlePreviewPost = (post: SocialMediaPost) => {
    setSelectedPost(post);
    setShowPreviewModal(true);
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const items = activeView === 'posts' ? getFilteredPosts() : 
                  activeView === 'assets' ? getFilteredAssets() : 
                  getFilteredTemplates();
    
    setSelectedItems(
      selectedItems.length === items.length ? [] : items.map((item: any) => item.id)
    );
  };

  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'delete':
        if (confirm(`Delete ${selectedItems.length} items?`)) {
          selectedItems.forEach(id => {
            if (activeView === 'posts') {
              deletePostMutation.mutate(id);
            }
            // Add other bulk actions as needed
          });
          setSelectedItems([]);
        }
        break;
      case 'publish':
        if (activeView === 'posts') {
          selectedItems.forEach(id => publishPostMutation.mutate(id));
          setSelectedItems([]);
        }
        break;
    }
  };

  // Platform icon helper
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'twitter':
      case 'x': return <Twitter className="w-4 h-4" />;
      case 'youtube': return <Youtube className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Consolidated rendering functions
  const renderPostCard = (post: SocialMediaPost) => (
    <div key={post.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectedItems.includes(post.id)}
            onChange={() => handleSelectItem(post.id)}
            className="rounded"
            title="Select post"
            aria-label="Select post"
          />
          <div className="flex space-x-1">
            {post.platforms.map((platform: string) => (
              <div key={platform} className="p-1 bg-gray-100 rounded">
                {getPlatformIcon(platform)}
              </div>
            ))}
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
          {post.status}
        </span>
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-900 line-clamp-3">{post.content}</p>
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.hashtags.slice(0, 3).map((tag: string, index: number) => (
              <span key={index} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                #{tag}
              </span>
            ))}
            {post.hashtags.length > 3 && (
              <span className="text-xs text-gray-500">+{post.hashtags.length - 3} more</span>
            )}
          </div>
        )}
      </div>

      {post.engagementData && (
        <div className="flex justify-between text-xs text-gray-500 mb-3">
          <span className="flex items-center space-x-1">
            <Heart className="w-3 h-3" />
            <span>{post.engagementData.likes}</span>
          </span>
          <span className="flex items-center space-x-1">
            <MessageCircle className="w-3 h-3" />
            <span>{post.engagementData.comments}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Share2 className="w-3 h-3" />
            <span>{post.engagementData.shares}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>{post.engagementData.impressions}</span>
          </span>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handlePreviewPost(post)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Preview"
          >
            <Eye className="w-3 h-3" />
          </button>
          <button
            onClick={() => handleEditPost(post)}
            className="p-1 text-gray-600 hover:bg-gray-50 rounded"
            title="Edit"
          >
            <Edit className="w-3 h-3" />
          </button>
          {post.status === 'DRAFT' && (
            <button
              onClick={() => handlePublishPost(post)}
              className="p-1 text-green-600 hover:bg-green-50 rounded"
              title="Publish"
            >
              <Send className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={() => handleDeletePost(post)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderAssetCard = (asset: SocialMediaAsset) => (
    <div key={asset.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <input
          type="checkbox"
          checked={selectedItems.includes(asset.id)}
          onChange={() => handleSelectItem(asset.id)}
          className="rounded"
          title="Select asset"
          aria-label="Select asset"
        />
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          asset.type === 'IMAGE' ? 'bg-green-100 text-green-800' :
          asset.type === 'VIDEO' ? 'bg-blue-100 text-blue-800' :
          'bg-purple-100 text-purple-800'
        }`}>
          {asset.type}
        </span>
      </div>

      <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
        {asset.type === 'IMAGE' ? (
          <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
        ) : asset.type === 'VIDEO' ? (
          <video src={asset.url} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Video className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-sm text-gray-900 truncate">{asset.name}</h4>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{(asset.size / 1024 / 1024).toFixed(1)} MB</span>
          {asset.dimensions && (
            <span>{asset.dimensions.width}×{asset.dimensions.height}</span>
          )}
        </div>
        {asset.tags && asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {asset.tags.slice(0, 2).map((tag: string, index: number) => (
              <span key={index} className="text-xs bg-gray-100 px-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderTemplateCard = (template: ContentTemplate) => (
    <div key={template.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <input
          type="checkbox"
          checked={selectedItems.includes(template.id)}
          onChange={() => handleSelectItem(template.id)}
          className="rounded"
          title="Select template"
          aria-label="Select template"
        />
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          template.isPublic ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {template.isPublic ? 'Public' : 'Private'}
        </span>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-sm text-gray-900">{template.name}</h4>
        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{template.category}</span>
        <p className="text-xs text-gray-600 line-clamp-3">{template.content}</p>
        
        {template.hashtags && template.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {template.hashtags.slice(0, 3).map((tag: string, index: number) => (
              <span key={index} className="text-xs text-blue-600">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex justify-between text-xs text-gray-500">
          <span>{new Date(template.createdAt).toLocaleDateString()}</span>
          <button className="text-blue-600 hover:text-blue-800">
            Use Template
          </button>
        </div>
      </div>
    </div>
  );

  const getCurrentData = () => {
    switch (activeView) {
      case 'posts':
        return getFilteredPosts();
      case 'assets':
        return getFilteredAssets();
      case 'templates':
        return getFilteredTemplates();
      default:
        return [];
    }
  };

  const isLoading = postsLoading || assetsLoading || templatesLoading;
  const currentData = getCurrentData();

  return (
    <div className="space-y-6">
      {/* Consolidated Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Social Media Management</h1>
          <p className="text-gray-600">Create, schedule, and manage your social media content</p>
        </div>
        <button
          onClick={handleCreatePost}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Post</span>
        </button>
      </div>

      {/* Consolidated Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'posts', label: 'Posts', icon: MessageSquare },
            { id: 'assets', label: 'Assets', icon: Image },
            { id: 'templates', label: 'Templates', icon: FileText },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeView === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Consolidated Filters */}
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Search ${activeView}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {activeView === 'posts' && (
            <>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Filter by status"
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
                <option value="failed">Failed</option>
              </select>

              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Filter by platform"
                aria-label="Filter by platform"
              >
                <option value="all">All Platforms</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="twitter">Twitter/X</option>
                <option value="youtube">YouTube</option>
              </select>
            </>
          )}

          {activeView === 'assets' && (
            <select
              value={folderFilter}
              onChange={(e) => setFolderFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Filter by folder"
              aria-label="Filter by folder"
            >
              <option value="all">All Folders</option>
              <option value="products">Products</option>
              <option value="behind-scenes">Behind the Scenes</option>
              <option value="events">Events</option>
              <option value="seasonal">Seasonal</option>
            </select>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {selectedItems.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{selectedItems.length} selected</span>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Delete
              </button>
              {activeView === 'posts' && (
                <button
                  onClick={() => handleBulkAction('publish')}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Publish
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Consolidated Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : currentData.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No {activeView} found
          </h3>
          <p className="text-gray-600 mb-4">
            Get started by creating your first {activeView.slice(0, -1)}.
          </p>
          <button
            onClick={handleCreatePost}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create {activeView === 'posts' ? 'Post' : activeView === 'assets' ? 'Asset' : 'Template'}
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedItems.length === currentData.length}
                onChange={handleSelectAll}
                className="rounded"
                title="Select all items"
                aria-label="Select all items"
              />
              <span className="text-sm text-gray-600">
                {currentData.length} {activeView}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentData.map((item: any) => {
              switch (activeView) {
                case 'posts':
                  return renderPostCard(item);
                case 'assets':
                  return renderAssetCard(item);
                case 'templates':
                  return renderTemplateCard(item);
                default:
                  return null;
              }
            })}
          </div>
        </>
      )}

      {/* Consolidated Modals would be added here */}
    </div>
  );
};

export default ConsolidatedSocialMediaManager;
