import React from 'react';
import { Link } from 'wouter';
import { Calendar, MapPin, Users, Eye, Edit, Copy, Trash2, Share2, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import type { Event } from '@/lib/api/events';

interface EventListProps {
  events: Event[];
  loading?: boolean;
  onEdit?: (event: Event) => void;
  onDuplicate?: (event: Event) => void;
  onDelete?: (event: Event) => void;
  onViewDetails?: (event: Event) => void;
  onSocialShare?: (event: Event, platform: string) => void;
}

export function EventList({ events, loading, onEdit, onDuplicate, onDelete, onViewDetails, onSocialShare }: EventListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow-md border animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No events yet</h3>
        <p className="text-gray-600 mb-6">Create your first event to get started</p>
        <Link href="/dashboard/event-coordinator/events/create">
          <button className="bg-brand-green text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-green/90 transition-colors">
            Create Event
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="bg-white rounded-lg p-6 shadow-md border hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onViewDetails?.(event)}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  event.status === 'PUBLISHED' ? 'bg-brand-green/10 text-brand-green' :
                  event.status === 'DRAFT' ? 'bg-gray-100 text-gray-600' :
                  event.status === 'ACTIVE' ? 'bg-brand-green/20 text-brand-green' :
                  'bg-red-100 text-red-600'
                }`}>
                  {event.status}
                </span>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  event.visibility === 'PUBLIC' ? 'bg-blue-100 text-blue-600' :
                  event.visibility === 'PREVIEW' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {event.visibility}
                </span>
              </div>
              
              <p className="text-gray-600 mb-3 line-clamp-2">{event.description}</p>
              
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(event.startDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {event.venue}
                </div>
                {event.capacity && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {event.applicationCount || 0}/{event.capacity} vendors
                  </div>
                )}
              </div>
              
              {event.categories && event.categories.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {event.categories.map((category) => (
                    <span key={category} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {category}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <Link href={event.slug ? `/events/${event.slug}` : `/events/${event.id}`} target="_blank">
                <button 
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="View public page"
                >
                  <Eye className="w-4 h-4 text-gray-600" />
                </button>
              </Link>
              <button 
                onClick={() => onEdit?.(event)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit event"
              >
                <Edit className="w-4 h-4 text-gray-600" />
              </button>
              <button 
                onClick={() => onDuplicate?.(event)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Duplicate event"
              >
                <Copy className="w-4 h-4 text-gray-600" />
              </button>
              <button 
                onClick={() => onDelete?.(event)}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                title="Delete event"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
            
            {/* Social Sharing Buttons */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-500 mr-2">Share:</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onSocialShare?.(event, 'facebook');
                }}
                className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                title="Share on Facebook"
              >
                <Facebook className="w-4 h-4 text-blue-600" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onSocialShare?.(event, 'twitter');
                }}
                className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                title="Share on Twitter"
              >
                <Twitter className="w-4 h-4 text-blue-400" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onSocialShare?.(event, 'linkedin');
                }}
                className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                title="Share on LinkedIn"
              >
                <Linkedin className="w-4 h-4 text-blue-700" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onSocialShare?.(event, 'instagram');
                }}
                className="p-2 hover:bg-pink-100 rounded-lg transition-colors"
                title="Share on Instagram"
              >
                <Instagram className="w-4 h-4 text-pink-600" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onSocialShare?.(event, 'copy');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Copy link"
              >
                <Share2 className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
