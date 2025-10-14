import React, { useState, useEffect } from 'react';
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Calendar,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Share,
  TrendingUp,
  Image as ImageIcon,
  Video,
  FileText,
  Link,
  Settings,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

// Future Enhancement: Real Facebook/Instagram API Integration for Publishing
interface SocialMediaAccount {
  id: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  username: string;
  followers: number;
  isConnected: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  permissions: string[];
}

interface SocialMediaPost {
  id: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  content: {
    text: string;
    media: Array<{
      type: 'image' | 'video';
      url: string;
      caption?: string;
    }>;
    hashtags: string[];
    mentions: string[];
    link?: string;
  };
  scheduledAt?: string;
  publishedAt?: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  analytics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    clicks: number;
    reach: number;
    engagement: number;
  };
  campaignId?: string;
  createdAt: string;
  updatedAt: string;
}

interface SocialMediaIntegrationProps {
  vendorId: string;
}

const SocialMediaIntegration: React.FC<SocialMediaIntegrationProps> = ({ vendorId }) => {
  const [connectedAccounts, setConnectedAccounts] = useState<SocialMediaAccount[]>([]);
  const [posts, setPosts] = useState<SocialMediaPost[]>([]);
  const [isComposing, setIsComposing] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  // Mock connected accounts data
  useEffect(() => {
    const mockAccounts: SocialMediaAccount[] = [
      {
        id: 'fb_001',
        platform: 'facebook',
        username: 'CravedArtisan',
        followers: 2450,
        isConnected: true,
        permissions: ['pages_manage_posts', 'pages_read_engagement'],
        expiresAt: '2025-11-14T00:00:00Z'
      },
      {
        id: 'ig_001', 
        platform: 'instagram',
        username: 'craved_artisan',
        followers: 1870,
        isConnected: true,
        permissions: ['instagram_basic', 'instagram_content_publish'],
        expiresAt: '2025-11-14T00:00:00Z'
      },
      {
        id: 'tw_001',
        platform: 'twitter',
        username: '@CravedArtisan',
        followers: 890,
        isConnected: false,
        permissions: []
      }
    ];
    
    setConnectedAccounts(mockAccounts);
  }, []);

  // Post composition form
  const [postForm, setPostForm] = useState({
    text: '',
    media: [] as File[],
    hashtags: [] as string[],
    mentions: [] as string[],
    link: '',
    scheduledAt: '',
    platforms: [] as string[]
  });

  const [hashtagInput, setHashtagInput] = useState('');
  const [mentionInput, setMentionInput] = useState('');

  // Real Facebook/Instagram API integration functions
  const connectFacebookAccount = async () => {
    try {
      // Initialize Facebook SDK
      window.FB.login((response: any) => {
        if (response.authResponse) {
          // Get long-lived token and page access tokens
          const { accessToken, userID } = response.authResponse;
          
          // Store tokens securely and update account status
          updateAccountConnection('facebook', {
            accessToken,
            isConnected: true,
            expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days
          });
          
          console.log('Facebook connected successfully');
        }
      }, {
        scope: 'pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish'
      });
    } catch (error) {
      console.error('Facebook connection failed:', error);
    }
  };

  const connectInstagramAccount = async () => {
    // Instagram uses Facebook's API - same connection flow
    await connectFacebookAccount();
  };

  const connectTwitterAccount = async () => {
    try {
      // Twitter API v2 OAuth2 flow
      const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.REACT_APP_TWITTER_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/twitter/callback')}&scope=tweet.read%20tweet.write%20users.read&state=state&code_challenge=challenge&code_challenge_method=plain`;
      
      window.open(authUrl, 'twitter-auth', 'width=500,height=700');
    } catch (error) {
      console.error('Twitter connection failed:', error);
    }
  };

  const updateAccountConnection = (platform: string, updates: Partial<SocialMediaAccount>) => {
    setConnectedAccounts(prev =>
      prev.map(account =>
        account.platform === platform
          ? { ...account, ...updates }
          : account
      )
    );
  };

  // Real API publishing functions
  const publishToFacebook = async (post: any) => {
    try {
      const fbAccount = connectedAccounts.find(acc => acc.platform === 'facebook');
      if (!fbAccount?.accessToken) throw new Error('Facebook not connected');

      const response = await fetch(`https://graph.facebook.com/me/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: post.text,
          link: post.link,
          access_token: fbAccount.accessToken
        })
      });

      const result = await response.json();
      if (result.error) throw new Error(result.error.message);
      
      return { success: true, postId: result.id };
    } catch (error) {
      console.error('Facebook publish failed:', error);
      return { success: false, error: error.message };
    }
  };

  const publishToInstagram = async (post: any) => {
    try {
      const igAccount = connectedAccounts.find(acc => acc.platform === 'instagram');
      if (!igAccount?.accessToken) throw new Error('Instagram not connected');

      // For Instagram, we need to create media container first, then publish
      const mediaResponse = await fetch(`https://graph.facebook.com/v18.0/{ig-user-id}/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: post.media[0]?.url, // Assuming first media item
          caption: post.text,
          access_token: igAccount.accessToken
        })
      });

      const mediaResult = await mediaResponse.json();
      if (mediaResult.error) throw new Error(mediaResult.error.message);

      // Publish the media
      const publishResponse = await fetch(`https://graph.facebook.com/v18.0/{ig-user-id}/media_publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creation_id: mediaResult.id,
          access_token: igAccount.accessToken
        })
      });

      const publishResult = await publishResponse.json();
      if (publishResult.error) throw new Error(publishResult.error.message);
      
      return { success: true, postId: publishResult.id };
    } catch (error) {
      console.error('Instagram publish failed:', error);
      return { success: false, error: error.message };
    }
  };

  const publishToTwitter = async (post: any) => {
    try {
      const twitterAccount = connectedAccounts.find(acc => acc.platform === 'twitter');
      if (!twitterAccount?.accessToken) throw new Error('Twitter not connected');

      const response = await fetch('/api/vendor/social-media/twitter/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${twitterAccount.accessToken}`
        },
        body: JSON.stringify({
          text: post.text,
          media: post.media
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      return { success: true, postId: result.data.id };
    } catch (error) {
      console.error('Twitter publish failed:', error);
      return { success: false, error: error.message };
    }
  };

  // Unified publishing function
  const publishPost = async () => {
    const selectedAccounts = connectedAccounts.filter(acc => 
      postForm.platforms.includes(acc.platform) && acc.isConnected
    );

    const publishPromises = selectedAccounts.map(async (account) => {
      let result;
      
      switch (account.platform) {
        case 'facebook':
          result = await publishToFacebook(postForm);
          break;
        case 'instagram':
          result = await publishToInstagram(postForm);
          break;
        case 'twitter':
          result = await publishToTwitter(postForm);
          break;
        default:
          result = { success: false, error: 'Unsupported platform' };
      }

      return {
        platform: account.platform,
        ...result
      };
    });

    const results = await Promise.all(publishPromises);
    
    // Handle results
    results.forEach(result => {
      if (result.success) {
        console.log(`Published to ${result.platform} successfully`);
      } else {
        console.error(`Failed to publish to ${result.platform}:`, result.error);
      }
    });

    // Reset form if all successful
    if (results.every(r => r.success)) {
      setPostForm({
        text: '',
        media: [],
        hashtags: [],
        mentions: [],
        link: '',
        scheduledAt: '',
        platforms: []
      });
      setIsComposing(false);
    }
  };

  const schedulePost = async () => {
    // Save post as scheduled in database
    const newPost: Partial<SocialMediaPost> = {
      content: {
        text: postForm.text,
        media: [], // Would handle file uploads
        hashtags: postForm.hashtags,
        mentions: postForm.mentions,
        link: postForm.link
      },
      scheduledAt: postForm.scheduledAt,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // API call to save scheduled post
    console.log('Scheduling post:', newPost);
    setIsComposing(false);
  };

  const addHashtag = () => {
    if (hashtagInput.trim() && !postForm.hashtags.includes(hashtagInput.trim())) {
      setPostForm(prev => ({
        ...prev,
        hashtags: [...prev.hashtags, hashtagInput.trim()]
      }));
      setHashtagInput('');
    }
  };

  const removeHashtag = (hashtag: string) => {
    setPostForm(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter(h => h !== hashtag)
    }));
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return <Facebook className="w-5 h-5" />;
      case 'instagram': return <Instagram className="w-5 h-5" />;
      case 'twitter': return <Twitter className="w-5 h-5" />;
      case 'linkedin': return <Linkedin className="w-5 h-5" />;
      default: return null;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'facebook': return 'text-blue-600';
      case 'instagram': return 'text-pink-600';
      case 'twitter': return 'text-sky-600';
      case 'linkedin': return 'text-blue-700';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Social Media Integration</h2>
            <p className="text-gray-600">Connect and publish to your social media accounts</p>
          </div>
          <button
            onClick={() => setIsComposing(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Create Post</span>
          </button>
        </div>

        {/* Connected Accounts */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {connectedAccounts.map((account) => (
            <div key={account.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`flex items-center space-x-2 ${getPlatformColor(account.platform)}`}>
                  {getPlatformIcon(account.platform)}
                  <span className="font-medium capitalize">{account.platform}</span>
                </div>
                {account.isConnected ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <p className="font-medium">{account.username}</p>
                <p className="text-gray-600">{account.followers.toLocaleString()} followers</p>
                
                {account.isConnected ? (
                  <div className="flex items-center justify-between">
                    <span className="text-green-600 text-xs">Connected</span>
                    <button className="text-xs text-gray-500 hover:text-gray-700">
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (account.platform === 'facebook') connectFacebookAccount();
                      else if (account.platform === 'instagram') connectInstagramAccount();
                      else if (account.platform === 'twitter') connectTwitterAccount();
                    }}
                    className="w-full py-1 px-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Post Composer Modal */}
      {isComposing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Create Social Media Post</h3>
                <button
                  onClick={() => setIsComposing(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Platform Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Platforms
                </label>
                <div className="flex flex-wrap gap-2">
                  {connectedAccounts
                    .filter(acc => acc.isConnected)
                    .map((account) => (
                      <label key={account.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={postForm.platforms.includes(account.platform)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPostForm(prev => ({
                                ...prev,
                                platforms: [...prev.platforms, account.platform]
                              }));
                            } else {
                              setPostForm(prev => ({
                                ...prev,
                                platforms: prev.platforms.filter(p => p !== account.platform)
                              }));
                            }
                          }}
                          className="sr-only"
                        />
                        <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 cursor-pointer ${
                          postForm.platforms.includes(account.platform)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <div className={getPlatformColor(account.platform)}>
                            {getPlatformIcon(account.platform)}
                          </div>
                          <span className="text-sm capitalize">{account.platform}</span>
                        </div>
                      </label>
                    ))}
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Content
                </label>
                <textarea
                  value={postForm.text}
                  onChange={(e) => setPostForm(prev => ({ ...prev, text: e.target.value }))}
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What would you like to share?"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {postForm.text.length}/280 characters
                </p>
              </div>

              {/* Hashtags */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hashtags
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add hashtag (without #)"
                  />
                  <button
                    onClick={addHashtag}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {postForm.hashtags.map((hashtag) => (
                    <span
                      key={hashtag}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      #{hashtag}
                      <button
                        onClick={() => removeHashtag(hashtag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Link */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link (Optional)
                </label>
                <input
                  type="url"
                  value={postForm.link}
                  onChange={(e) => setPostForm(prev => ({ ...prev, link: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>

              {/* Schedule */}
              <div className="mb-6">
                <label htmlFor="social-schedule-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule (Optional)
                </label>
                <input
                  id="social-schedule-input"
                  type="datetime-local"
                  value={postForm.scheduledAt}
                  onChange={(e) => setPostForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  title="Schedule post time"
                  aria-label="Schedule post time"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsComposing(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                {postForm.scheduledAt ? (
                  <button
                    onClick={schedulePost}
                    className="flex-1 py-2 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center space-x-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Schedule</span>
                  </button>
                ) : (
                  <button
                    onClick={publishPost}
                    disabled={postForm.platforms.length === 0 || !postForm.text.trim()}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Publish Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialMediaIntegration;
