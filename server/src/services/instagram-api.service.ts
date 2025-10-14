import axios from 'axios';
import { logger } from '../logger';

export interface InstagramAccountInfo {
  id: string;
  username: string;
  name: string;
  biography?: string;
  website?: string;
  followers_count: number;
  follows_count: number;
  media_count: number;
  profile_picture_url: string;
}

export interface InstagramMediaData {
  image_url?: string;
  video_url?: string;
  caption: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  children?: Array<{
    image_url?: string;
    video_url?: string;
    media_type: 'IMAGE' | 'VIDEO';
  }>;
  location_id?: string;
  user_tags?: Array<{
    username: string;
    x: number;
    y: number;
  }>;
}

export interface InstagramMediaResponse {
  id: string;
  media_type: string;
  media_url: string;
  caption?: string;
  permalink: string;
  timestamp: string;
  username: string;
  insights?: {
    impressions: number;
    reach: number;
    engagement: number;
    likes: number;
    comments: number;
    saves: number;
    shares: number;
  };
}

export interface InstagramInsights {
  impressions: number;
  reach: number;
  engagement: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  profile_views: number;
  website_clicks: number;
}

export class InstagramAPIService {
  private baseURL = 'https://graph.facebook.com/v18.0';
  private accessToken: string;
  private accountId: string;

  constructor(accessToken: string, accountId: string) {
    this.accessToken = accessToken;
    this.accountId = accountId;
  }

  /**
   * Get Instagram Business account information
   */
  async getAccountInfo(): Promise<InstagramAccountInfo> {
    try {
      const response = await axios.get(`${this.baseURL}/${this.accountId}`, {
        params: {
          access_token: this.accessToken,
          fields: 'id,username,name,biography,website,followers_count,follows_count,media_count,profile_picture_url'
        }
      });

      logger.info({
        accountId: this.accountId,
        username: response.data.username,
        followers: response.data.followers_count
      }, 'Retrieved Instagram account info');

      return response.data;
    } catch (error: any) {
      logger.error({
        error: error.response?.data || error.message,
        accountId: this.accountId
      }, 'Error getting Instagram account info');
      throw new Error(`Instagram API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Create Instagram media (post)
   */
  async createMedia(mediaData: InstagramMediaData): Promise<{ id: string }> {
    try {
      // Step 1: Create media container
      const containerResponse = await axios.post(`${this.baseURL}/${this.accountId}/media`, {
        ...mediaData,
        access_token: this.accessToken
      });

      const containerId = containerResponse.data.id;

      logger.info({
        accountId: this.accountId,
        containerId,
        mediaType: mediaData.media_type
      }, 'Created Instagram media container');

      return { id: containerId };
    } catch (error: any) {
      logger.error({
        error: error.response?.data || error.message,
        accountId: this.accountId,
        caption: mediaData.caption?.substring(0, 100)
      }, 'Error creating Instagram media container');
      throw new Error(`Instagram API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Publish Instagram media container
   */
  async publishMedia(containerId: string): Promise<InstagramMediaResponse> {
    try {
      // Step 2: Publish the media container
      const publishResponse = await axios.post(`${this.baseURL}/${this.accountId}/media_publish`, {
        creation_id: containerId,
        access_token: this.accessToken
      });

      const mediaId = publishResponse.data.id;

      // Get the published media details
      const mediaDetails = await this.getMedia(mediaId);

      logger.info({
        accountId: this.accountId,
        containerId,
        mediaId
      }, 'Published Instagram media');

      return mediaDetails;
    } catch (error: any) {
      logger.error({
        error: error.response?.data || error.message,
        containerId
      }, 'Error publishing Instagram media');
      throw new Error(`Instagram API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Create and publish Instagram post in one step
   */
  async createPost(mediaData: InstagramMediaData): Promise<InstagramMediaResponse> {
    const container = await this.createMedia(mediaData);
    
    // Wait a moment for the container to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return this.publishMedia(container.id);
  }

  /**
   * Get media details
   */
  async getMedia(mediaId: string): Promise<InstagramMediaResponse> {
    try {
      const response = await axios.get(`${this.baseURL}/${mediaId}`, {
        params: {
          access_token: this.accessToken,
          fields: 'id,media_type,media_url,caption,permalink,timestamp,username,comments_count,like_count'
        }
      });

      return {
        id: response.data.id,
        media_type: response.data.media_type,
        media_url: response.data.media_url,
        caption: response.data.caption,
        permalink: response.data.permalink,
        timestamp: response.data.timestamp,
        username: response.data.username,
        insights: {
          likes: response.data.like_count || 0,
          comments: response.data.comments_count || 0,
          impressions: 0, // Will be filled by insights API
          reach: 0,
          engagement: (response.data.like_count || 0) + (response.data.comments_count || 0),
          saves: 0,
          shares: 0
        }
      };
    } catch (error: any) {
      logger.error({
        error: error.response?.data || error.message,
        mediaId
      }, 'Error getting Instagram media');
      throw new Error(`Instagram API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Get media insights/analytics
   */
  async getMediaInsights(mediaId: string): Promise<InstagramInsights> {
    try {
      const response = await axios.get(`${this.baseURL}/${mediaId}/insights`, {
        params: {
          access_token: this.accessToken,
          metric: 'impressions,reach,engagement,likes,comments,saves,shares'
        }
      });

      // Process insights data
      const insights: any = {};
      response.data.data.forEach((metric: any) => {
        insights[metric.name] = metric.values?.[0]?.value || 0;
      });

      logger.info({
        mediaId,
        impressions: insights.impressions,
        engagement: insights.engagement
      }, 'Retrieved Instagram media insights');

      return {
        impressions: insights.impressions || 0,
        reach: insights.reach || 0,
        engagement: insights.engagement || 0,
        likes: insights.likes || 0,
        comments: insights.comments || 0,
        saves: insights.saves || 0,
        shares: insights.shares || 0,
        profile_views: 0,
        website_clicks: 0
      };
    } catch (error: any) {
      logger.error({
        error: error.response?.data || error.message,
        mediaId
      }, 'Error getting Instagram media insights');
      
      // Return empty insights if error (non-critical)
      return {
        impressions: 0,
        reach: 0,
        engagement: 0,
        likes: 0,
        comments: 0,
        saves: 0,
        shares: 0,
        profile_views: 0,
        website_clicks: 0
      };
    }
  }

  /**
   * Get account insights for overall analytics
   */
  async getAccountInsights(dateRange: { since: string; until: string }): Promise<{
    impressions: number;
    reach: number;
    profile_views: number;
    website_clicks: number;
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/${this.accountId}/insights`, {
        params: {
          access_token: this.accessToken,
          metric: 'impressions,reach,profile_views,website_clicks',
          period: 'day',
          since: dateRange.since,
          until: dateRange.until
        }
      });

      // Process insights data - sum up daily values
      const insights: any = {};
      response.data.data.forEach((metric: any) => {
        const totalValue = metric.values.reduce((sum: number, value: any) => sum + (value.value || 0), 0);
        insights[metric.name] = totalValue;
      });

      logger.info({
        accountId: this.accountId,
        dateRange,
        impressions: insights.impressions
      }, 'Retrieved Instagram account insights');

      return {
        impressions: insights.impressions || 0,
        reach: insights.reach || 0,
        profile_views: insights.profile_views || 0,
        website_clicks: insights.website_clicks || 0
      };
    } catch (error: any) {
      logger.error({
        error: error.response?.data || error.message,
        accountId: this.accountId
      }, 'Error getting Instagram account insights');
      
      return {
        impressions: 0,
        reach: 0,
        profile_views: 0,
        website_clicks: 0
      };
    }
  }

  /**
   * Get recent media from account
   */
  async getRecentMedia(limit: number = 25): Promise<InstagramMediaResponse[]> {
    try {
      const response = await axios.get(`${this.baseURL}/${this.accountId}/media`, {
        params: {
          access_token: this.accessToken,
          fields: 'id,media_type,media_url,caption,permalink,timestamp,username,comments_count,like_count',
          limit
        }
      });

      const media = response.data.data.map((item: any) => ({
        id: item.id,
        media_type: item.media_type,
        media_url: item.media_url,
        caption: item.caption,
        permalink: item.permalink,
        timestamp: item.timestamp,
        username: item.username,
        insights: {
          likes: item.like_count || 0,
          comments: item.comments_count || 0,
          impressions: 0,
          reach: 0,
          engagement: (item.like_count || 0) + (item.comments_count || 0),
          saves: 0,
          shares: 0
        }
      }));

      logger.info({
        accountId: this.accountId,
        mediaCount: media.length
      }, 'Retrieved Instagram recent media');

      return media;
    } catch (error: any) {
      logger.error({
        error: error.response?.data || error.message,
        accountId: this.accountId
      }, 'Error getting Instagram recent media');
      return [];
    }
  }
}

// Factory function to create Instagram API service
export function createInstagramAPIService(accessToken: string, accountId: string): InstagramAPIService {
  return new InstagramAPIService(accessToken, accountId);
}

// Environment configuration helper
export function getInstagramConfig() {
  return {
    appId: process.env.INSTAGRAM_APP_ID || process.env.FACEBOOK_APP_ID || '',
    appSecret: process.env.INSTAGRAM_APP_SECRET || process.env.FACEBOOK_APP_SECRET || '',
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || '',
    accountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || '',
    apiVersion: 'v18.0'
  };
}
