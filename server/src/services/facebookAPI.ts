import axios from 'axios';
import { logger } from '../logger';

// Real Facebook and Instagram API Integration Service
export interface FacebookConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
  apiVersion: string;
}

export interface FacebookPage {
  id: string;
  name: string;
  accessToken: string;
  category: string;
  instagram_business_account?: {
    id: string;
  };
}

export interface FacebookPost {
  message: string;
  link?: string;
  media?: Array<{
    url: string;
    type: 'photo' | 'video';
  }>;
  scheduled_publish_time?: number;
}

export interface InstagramPost {
  image_url?: string;
  video_url?: string;
  caption: string;
  location_id?: string;
  user_tags?: Array<{
    username: string;
    x: number;
    y: number;
  }>;
}

export class FacebookAPIService {
  private config: FacebookConfig;
  private baseURL: string;

  constructor(config: FacebookConfig) {
    this.config = config;
    this.baseURL = `https://graph.facebook.com/v${config.apiVersion}`;
  }

  // Step 1: Generate OAuth URL for user authorization
  generateAuthURL(state: string, scopes: string[] = []): string {
    const defaultScopes = [
      'pages_manage_posts',
      'pages_read_engagement', 
      'instagram_basic',
      'instagram_content_publish',
      'business_management'
    ];
    
    const allScopes = [...defaultScopes, ...scopes].join(',');
    
    const params = new URLSearchParams({
      client_id: this.config.appId,
      redirect_uri: this.config.redirectUri,
      state: state,
      scope: allScopes,
      response_type: 'code'
    });

    return `https://www.facebook.com/v${this.config.apiVersion}/dialog/oauth?${params.toString()}`;
  }

  // Step 2: Exchange authorization code for access token
  async exchangeCodeForToken(code: string): Promise<{
    access_token: string;
    token_type: string;
    expires_in?: number;
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/oauth/access_token`, {
        params: {
          client_id: this.config.appId,
          client_secret: this.config.appSecret,
          redirect_uri: this.config.redirectUri,
          code: code
        }
      });

      logger.info('Facebook access token obtained successfully');
      return response.data;
    } catch (error) {
      logger.error('Failed to exchange code for Facebook token:', error);
      throw new Error('Facebook token exchange failed');
    }
  }

  // Step 3: Get long-lived user access token (60 days)
  async getLongLivedToken(shortToken: string): Promise<{
    access_token: string;
    token_type: string;
    expires_in: number;
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: this.config.appId,
          client_secret: this.config.appSecret,
          fb_exchange_token: shortToken
        }
      });

      logger.info('Long-lived Facebook token obtained');
      return response.data;
    } catch (error) {
      logger.error('Failed to get long-lived Facebook token:', error);
      throw error;
    }
  }

  // Step 4: Get user's Facebook pages with page access tokens
  async getUserPages(userAccessToken: string): Promise<FacebookPage[]> {
    try {
      const response = await axios.get(`${this.baseURL}/me/accounts`, {
        params: {
          access_token: userAccessToken,
          fields: 'id,name,access_token,category,instagram_business_account{id}'
        }
      });

      logger.info(`Retrieved ${response.data.data.length} Facebook pages`);
      return response.data.data;
    } catch (error) {
      logger.error('Failed to get Facebook pages:', error);
      throw error;
    }
  }

  // Step 5: Publish post to Facebook page
  async publishToFacebookPage(
    pageId: string, 
    pageAccessToken: string, 
    post: FacebookPost
  ): Promise<{ id: string; post_id: string }> {
    try {
      const postData: any = {
        message: post.message,
        access_token: pageAccessToken
      };

      // Add link if provided
      if (post.link) {
        postData.link = post.link;
      }

      // Handle scheduled publishing
      if (post.scheduled_publish_time) {
        postData.scheduled_publish_time = post.scheduled_publish_time;
        postData.published = false;
      }

      // Handle media attachments
      if (post.media && post.media.length > 0) {
        if (post.media.length === 1) {
          // Single media item
          const media = post.media[0];
          if (media.type === 'photo') {
            postData.url = media.url;
          } else if (media.type === 'video') {
            postData.source = media.url;
          }
        } else {
          // Multiple media items - create album
          const mediaIds = await this.uploadMultipleMedia(pageId, pageAccessToken, post.media);
          postData.attached_media = mediaIds.map(id => ({ media_fbid: id }));
        }
      }

      const endpoint = post.media?.some(m => m.type === 'video') ? 'videos' : 'feed';
      const response = await axios.post(`${this.baseURL}/${pageId}/${endpoint}`, postData);

      logger.info(`Facebook post published successfully: ${response.data.id}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to publish Facebook post:', error);
      throw error;
    }
  }

  // Step 6: Publish to Instagram Business Account
  async publishToInstagram(
    instagramAccountId: string,
    pageAccessToken: string,
    post: InstagramPost
  ): Promise<{ id: string }> {
    try {
      // Step 1: Create media container
      const mediaData: any = {
        caption: post.caption,
        access_token: pageAccessToken
      };

      if (post.image_url) {
        mediaData.image_url = post.image_url;
      } else if (post.video_url) {
        mediaData.video_url = post.video_url;
        mediaData.media_type = 'VIDEO';
      }

      if (post.location_id) {
        mediaData.location_id = post.location_id;
      }

      if (post.user_tags && post.user_tags.length > 0) {
        mediaData.user_tags = JSON.stringify(post.user_tags);
      }

      const containerResponse = await axios.post(
        `${this.baseURL}/${instagramAccountId}/media`,
        mediaData
      );

      const containerId = containerResponse.data.id;

      // Step 2: Publish the media container
      const publishResponse = await axios.post(
        `${this.baseURL}/${instagramAccountId}/media_publish`,
        {
          creation_id: containerId,
          access_token: pageAccessToken
        }
      );

      logger.info(`Instagram post published successfully: ${publishResponse.data.id}`);
      return publishResponse.data;
    } catch (error) {
      logger.error('Failed to publish Instagram post:', error);
      throw error;
    }
  }

  // Helper: Upload multiple media items for Facebook albums
  private async uploadMultipleMedia(
    pageId: string,
    pageAccessToken: string,
    mediaItems: Array<{ url: string; type: 'photo' | 'video' }>
  ): Promise<string[]> {
    const uploadPromises = mediaItems.map(async (media) => {
      const response = await axios.post(`${this.baseURL}/${pageId}/photos`, {
        url: media.url,
        published: false,
        access_token: pageAccessToken
      });
      return response.data.id;
    });

    return Promise.all(uploadPromises);
  }

  // Get post analytics and insights
  async getPostInsights(
    postId: string,
    accessToken: string,
    metrics: string[] = ['post_impressions', 'post_engaged_users', 'post_clicks']
  ): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/${postId}/insights`, {
        params: {
          metric: metrics.join(','),
          access_token: accessToken
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to get post insights:', error);
      throw error;
    }
  }

  // Validate access token and get token info
  async validateToken(accessToken: string): Promise<{
    app_id: string;
    is_valid: boolean;
    expires_at?: number;
    scopes: string[];
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/debug_token`, {
        params: {
          input_token: accessToken,
          access_token: `${this.config.appId}|${this.config.appSecret}`
        }
      });

      return response.data.data;
    } catch (error) {
      logger.error('Failed to validate Facebook token:', error);
      throw error;
    }
  }

  // Refresh page access token (if needed)
  async refreshPageToken(pageId: string, userAccessToken: string): Promise<string> {
    try {
      const response = await axios.get(`${this.baseURL}/${pageId}`, {
        params: {
          fields: 'access_token',
          access_token: userAccessToken
        }
      });

      return response.data.access_token;
    } catch (error) {
      logger.error('Failed to refresh page token:', error);
      throw error;
    }
  }
}

// Factory function to create configured Facebook API service
export const createFacebookAPI = (config: FacebookConfig): FacebookAPIService => {
  return new FacebookAPIService(config);
};

// Default configuration (should be moved to environment variables)
export const getDefaultFacebookConfig = (): FacebookConfig => {
  return {
    appId: process.env.FACEBOOK_APP_ID || '',
    appSecret: process.env.FACEBOOK_APP_SECRET || '',
    redirectUri: process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:5174/auth/facebook/callback',
    apiVersion: '18.0'
  };
};
