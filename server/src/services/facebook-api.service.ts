import axios from 'axios';
import { logger } from '../logger';

export interface FacebookPageInfo {
  id: string;
  name: string;
  accessToken: string;
  category: string;
  link: string;
}

export interface FacebookPostData {
  message: string;
  link?: string;
  picture?: string;
  name?: string;
  caption?: string;
  description?: string;
  scheduledPublishTime?: number;
  published?: boolean;
}

export interface FacebookPostResponse {
  id: string;
  message?: string;
  created_time: string;
  permalink_url: string;
  full_picture?: string;
  insights?: {
    impressions: number;
    reach: number;
    clicks: number;
    reactions: number;
    comments: number;
    shares: number;
  };
}

export interface FacebookInsights {
  impressions: number;
  reach: number;
  clicks: number;
  reactions: number;
  comments: number;
  shares: number;
  engagement: number;
  engagement_rate: number;
}

export class FacebookAPIService {
  private baseURL = 'https://graph.facebook.com/v18.0';
  private accessToken: string;
  private pageId: string;

  constructor(accessToken: string, pageId: string) {
    this.accessToken = accessToken;
    this.pageId = pageId;
  }

  /**
   * Get Facebook page information
   */
  async getPageInfo(): Promise<FacebookPageInfo> {
    try {
      const response = await axios.get(`${this.baseURL}/${this.pageId}`, {
        params: {
          access_token: this.accessToken,
          fields: 'id,name,category,link'
        }
      });

      logger.info({
        pageId: this.pageId,
        pageName: response.data.name
      }, 'Retrieved Facebook page info');

      return {
        ...response.data,
        accessToken: this.accessToken
      };
    } catch (error: any) {
      logger.error({
        error: error.response?.data || error.message,
        pageId: this.pageId
      }, 'Error getting Facebook page info');
      throw new Error(`Facebook API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Create a Facebook post
   */
  async createPost(postData: FacebookPostData): Promise<FacebookPostResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/${this.pageId}/feed`, {
        ...postData,
        access_token: this.accessToken
      });

      const postId = response.data.id;

      // Get the full post details including permalink
      const postDetails = await this.getPost(postId);

      logger.info({
        pageId: this.pageId,
        postId: postId,
        scheduled: !!postData.scheduledPublishTime
      }, 'Created Facebook post');

      return postDetails;
    } catch (error: any) {
      logger.error({
        error: error.response?.data || error.message,
        pageId: this.pageId,
        postData: postData.message?.substring(0, 100)
      }, 'Error creating Facebook post');
      throw new Error(`Facebook API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Get post details
   */
  async getPost(postId: string): Promise<FacebookPostResponse> {
    try {
      const response = await axios.get(`${this.baseURL}/${postId}`, {
        params: {
          access_token: this.accessToken,
          fields: 'id,message,created_time,permalink_url,full_picture,attachments{description,url},reactions.limit(0).summary(true),comments.limit(0).summary(true),shares'
        }
      });

      return {
        id: response.data.id,
        message: response.data.message,
        created_time: response.data.created_time,
        permalink_url: response.data.permalink_url,
        full_picture: response.data.full_picture
      };
    } catch (error: any) {
      logger.error({
        error: error.response?.data || error.message,
        postId
      }, 'Error getting Facebook post');
      throw new Error(`Facebook API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Get post insights/analytics
   */
  async getPostInsights(postId: string, dateRange?: { since: string; until: string }): Promise<FacebookInsights> {
    try {
      const params: any = {
        access_token: this.accessToken,
        metric: 'post_impressions,post_impressions_unique,post_clicks,post_reactions_like_total,post_comments,post_shares'
      };

      if (dateRange) {
        params.since = dateRange.since;
        params.until = dateRange.until;
      }

      const response = await axios.get(`${this.baseURL}/${postId}/insights`, { params });

      // Process insights data
      const insights: any = {};
      response.data.data.forEach((metric: any) => {
        insights[metric.name] = metric.values?.[0]?.value || 0;
      });

      const totalEngagement = (insights.post_reactions_like_total || 0) + 
                             (insights.post_comments || 0) + 
                             (insights.post_shares || 0);

      const engagementRate = insights.post_impressions_unique > 0 ? 
        (totalEngagement / insights.post_impressions_unique * 100) : 0;

      logger.info({
        postId,
        impressions: insights.post_impressions,
        engagement: totalEngagement
      }, 'Retrieved Facebook post insights');

      return {
        impressions: insights.post_impressions || 0,
        reach: insights.post_impressions_unique || 0,
        clicks: insights.post_clicks || 0,
        reactions: insights.post_reactions_like_total || 0,
        comments: insights.post_comments || 0,
        shares: insights.post_shares || 0,
        engagement: totalEngagement,
        engagement_rate: Number(engagementRate.toFixed(2))
      };
    } catch (error: any) {
      logger.error({
        error: error.response?.data || error.message,
        postId
      }, 'Error getting Facebook post insights');
      
      // Return empty insights if error (non-critical)
      return {
        impressions: 0,
        reach: 0,
        clicks: 0,
        reactions: 0,
        comments: 0,
        shares: 0,
        engagement: 0,
        engagement_rate: 0
      };
    }
  }

  /**
   * Schedule a post for future publishing
   */
  async schedulePost(postData: FacebookPostData, scheduledTime: Date): Promise<FacebookPostResponse> {
    const scheduledPublishTime = Math.floor(scheduledTime.getTime() / 1000);
    
    return this.createPost({
      ...postData,
      scheduledPublishTime,
      published: false
    });
  }

  /**
   * Get page insights for overall analytics
   */
  async getPageInsights(dateRange: { since: string; until: string }): Promise<{
    page_views: number;
    page_fan_adds: number;
    page_impressions: number;
    page_engaged_users: number;
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/${this.pageId}/insights`, {
        params: {
          access_token: this.accessToken,
          metric: 'page_views,page_fan_adds,page_impressions,page_engaged_users',
          since: dateRange.since,
          until: dateRange.until
        }
      });

      const insights: any = {};
      response.data.data.forEach((metric: any) => {
        const totalValue = metric.values.reduce((sum: number, value: any) => sum + (value.value || 0), 0);
        insights[metric.name] = totalValue;
      });

      logger.info({
        pageId: this.pageId,
        dateRange,
        pageViews: insights.page_views
      }, 'Retrieved Facebook page insights');

      return {
        page_views: insights.page_views || 0,
        page_fan_adds: insights.page_fan_adds || 0,
        page_impressions: insights.page_impressions || 0,
        page_engaged_users: insights.page_engaged_users || 0
      };
    } catch (error: any) {
      logger.error({
        error: error.response?.data || error.message,
        pageId: this.pageId
      }, 'Error getting Facebook page insights');
      
      return {
        page_views: 0,
        page_fan_adds: 0,
        page_impressions: 0,
        page_engaged_users: 0
      };
    }
  }

  /**
   * Upload media (photo/video) to Facebook
   */
  async uploadMedia(mediaUrl: string, mediaType: 'image' | 'video'): Promise<{ id: string }> {
    try {
      const endpoint = mediaType === 'image' ? 'photos' : 'videos';
      const response = await axios.post(`${this.baseURL}/${this.pageId}/${endpoint}`, {
        url: mediaUrl,
        access_token: this.accessToken,
        published: false // Upload without publishing
      });

      logger.info({
        pageId: this.pageId,
        mediaType,
        mediaId: response.data.id
      }, 'Uploaded media to Facebook');

      return { id: response.data.id };
    } catch (error: any) {
      logger.error({
        error: error.response?.data || error.message,
        pageId: this.pageId,
        mediaUrl
      }, 'Error uploading media to Facebook');
      throw new Error(`Facebook API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Delete a Facebook post
   */
  async deletePost(postId: string): Promise<boolean> {
    try {
      await axios.delete(`${this.baseURL}/${postId}`, {
        params: {
          access_token: this.accessToken
        }
      });

      logger.info({
        pageId: this.pageId,
        postId
      }, 'Deleted Facebook post');

      return true;
    } catch (error: any) {
      logger.error({
        error: error.response?.data || error.message,
        postId
      }, 'Error deleting Facebook post');
      throw new Error(`Facebook API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Get scheduled posts
   */
  async getScheduledPosts(): Promise<FacebookPostResponse[]> {
    try {
      const response = await axios.get(`${this.baseURL}/${this.pageId}/scheduled_posts`, {
        params: {
          access_token: this.accessToken,
          fields: 'id,message,scheduled_publish_time,created_time'
        }
      });

      logger.info({
        pageId: this.pageId,
        scheduledCount: response.data.data.length
      }, 'Retrieved Facebook scheduled posts');

      return response.data.data || [];
    } catch (error: any) {
      logger.error({
        error: error.response?.data || error.message,
        pageId: this.pageId
      }, 'Error getting Facebook scheduled posts');
      return [];
    }
  }
}

// Factory function to create Facebook API service
export function createFacebookAPIService(accessToken: string, pageId: string): FacebookAPIService {
  return new FacebookAPIService(accessToken, pageId);
}

// Environment configuration helper
export function getFacebookConfig() {
  return {
    appId: process.env.FACEBOOK_APP_ID || '',
    appSecret: process.env.FACEBOOK_APP_SECRET || '',
    accessToken: process.env.FACEBOOK_ACCESS_TOKEN || '',
    pageId: process.env.FACEBOOK_PAGE_ID || '',
    apiVersion: 'v18.0'
  };
}
