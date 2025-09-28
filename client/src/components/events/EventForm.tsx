import React, { useState } from 'react';
import { Calendar, MapPin, Users, Tag, FileText, Upload, Phone, Mail, Clock, AlertTriangle, Plus, X, Truck, Clock3, Shield, Cloud, Route, Building, FileCheck, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import type { CreateEventRequest, UpdateEventRequest } from '@/lib/api/events';

interface EventFormProps {
  event?: any; // For editing existing events
  initialData?: Partial<CreateEventRequest>;
  onSubmit: (data: CreateEventRequest | UpdateEventRequest) => void;
  onCancel?: () => void;
  loading?: boolean;
  mode?: 'create' | 'edit';
}

export function EventForm({ event, initialData, onSubmit, onCancel, loading = false, mode = 'create' }: EventFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: event?.title || initialData?.title || '',
    description: event?.description || initialData?.description || '',
    eventType: event?.eventType || initialData?.eventType || '',
    venue: {
      name: event?.venue?.name || initialData?.venue?.name || '',
      address: event?.venue?.address || initialData?.venue?.address || '',
      phone: event?.venue?.phone || initialData?.venue?.phone || '',
      website: event?.venue?.website || initialData?.venue?.website || '',
    },
    startDate: event?.startDate || initialData?.startDate || '',
    endDate: event?.endDate || initialData?.endDate || '',
    vendorSignupDeadline: event?.vendorSignupDeadline || initialData?.vendorSignupDeadline || '',
    rules: event?.rules || initialData?.rules || '',
    coverImage: event?.coverImage || event?.imageUrl || initialData?.coverImage || '',
    isRecurring: event?.isRecurring || initialData?.isRecurring || false,
    recurrenceType: event?.recurrencePattern || initialData?.recurrenceType || 'WEEKLY',
    siteMap: event?.siteMap || initialData?.siteMap || null,
    setupInstructions: event?.setupInstructions || initialData?.setupInstructions || '',
    takedownInstructions: event?.takedownInstructions || initialData?.takedownInstructions || '',
    setupStartTime: event?.setupStartTime || initialData?.setupStartTime || '',
    takedownEndTime: event?.takedownEndTime || initialData?.takedownEndTime || '',
    venueType: event?.venueType || initialData?.venueType || '',
    weatherForecast: event?.weatherForecast || initialData?.weatherForecast || '',
    evacuationRoute: event?.evacuationRoute || initialData?.evacuationRoute || '',
    fireMarshalCapacity: event?.fireMarshalCapacity || initialData?.fireMarshalCapacity || '',
    fireMarshalSafetyItems: event?.fireMarshalSafetyItems || initialData?.fireMarshalSafetyItems || '',
    vendorContract: event?.vendorContract || initialData?.vendorContract || '',
    safetyRequirements: event?.safetyRequirements || initialData?.safetyRequirements || '',
  });


  // Step validation
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.title && formData.description && formData.eventType && 
                 formData.venue.name && formData.venue.address && 
                 formData.startDate && formData.endDate && formData.vendorSignupDeadline);
      case 2:
        return !!(formData.setupInstructions && formData.takedownInstructions);
      case 3:
        return !!(formData.venueType && formData.evacuationRoute);
      case 4:
        return true; // Floor plan is optional
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }
    
    const submitData = {
      ...formData,
      recurrenceType: formData.isRecurring ? formData.recurrenceType : undefined,
    };

    if (mode === 'edit' && event) {
      onSubmit({ ...submitData, id: event.id } as UpdateEventRequest);
    } else {
      onSubmit(submitData as CreateEventRequest);
    }
  };


  const steps = [
    { id: 1, title: 'Basic Information', description: 'Event details, venue, and dates' },
    { id: 2, title: 'Rules & Policies', description: 'Setup instructions and policies' },
    { id: 3, title: 'Safety & Compliance', description: 'Safety requirements and compliance' },
    { id: 4, title: 'Floor Plan', description: 'Dynamic site mapping' }
  ];

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                  ${currentStep > step.id 
                    ? 'bg-brand-green text-white' 
                    : currentStep === step.id 
                    ? 'bg-brand-green text-white' 
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className={`text-xs ${
                    currentStep >= step.id ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block w-16 h-0.5 ml-4 ${
                    currentStep > step.id ? 'bg-brand-green' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
              placeholder="Enter event title"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type *
            </label>
            <select
              value={formData.eventType}
              onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
              required
              aria-label="Event type"
            >
              <option value="">Select event type</option>
              <option value="farmers-market">Farmers Market</option>
              <option value="artisan-fair">Artisan Fair</option>
              <option value="craft-show">Craft Show</option>
              <option value="food-festival">Food Festival</option>
              <option value="community-event">Community Event</option>
              <option value="church-event">Church Event</option>
              <option value="festival">Festival</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
            placeholder="Describe your event..."
            required
          />
        </div>
      </div>

      {/* Venue Information */}
      <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
        <h3 className="text-lg font-semibold mb-4">Venue Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Venue Name *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.venue.name}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  venue: { ...prev.venue, name: e.target.value }
                }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                placeholder="Enter venue name"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={formData.venue.phone}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  venue: { ...prev.venue, phone: e.target.value }
                }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address *
          </label>
          <textarea
            value={formData.venue.address}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              venue: { ...prev.venue, address: e.target.value }
            }))}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
            placeholder="Enter full venue address"
            required
          />
        </div>
        
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Venue Website URL
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="url"
                  value={formData.venue.website}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    venue: { ...prev.venue, website: e.target.value }
                  }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                  placeholder="https://venue-website.com"
                  aria-label="Venue website URL"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Official website or social media page for the venue
              </p>
            </div>
      </div>

      {/* Date and Time */}
      <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
        <h3 className="text-lg font-semibold mb-4">Date & Time</h3>
        
        {/* Event Duration */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-800 mb-3">Event Duration</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date & Time *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.startDate.split('T')[0] || ''}
                    onChange={(e) => {
                      const date = e.target.value;
                      const time = formData.startDate.includes('T') ? formData.startDate.split('T')[1] : '09:00';
                      setFormData(prev => ({ ...prev, startDate: `${date}T${time}` }));
                    }}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    required
                    aria-label="Event start date"
                  />
                </div>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="time"
                    value={formData.startDate.includes('T') ? formData.startDate.split('T')[1] : '09:00'}
                    onChange={(e) => {
                      const date = formData.startDate.split('T')[0] || new Date().toISOString().split('T')[0];
                      const time = e.target.value;
                      setFormData(prev => ({ ...prev, startDate: `${date}T${time}` }));
                    }}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    required
                    aria-label="Event start time"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date & Time *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.endDate.split('T')[0] || ''}
                    onChange={(e) => {
                      const date = e.target.value;
                      const time = formData.endDate.includes('T') ? formData.endDate.split('T')[1] : '17:00';
                      setFormData(prev => ({ ...prev, endDate: `${date}T${time}` }));
                    }}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    required
                    aria-label="Event end date"
                  />
                </div>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="time"
                    value={formData.endDate.includes('T') ? formData.endDate.split('T')[1] : '17:00'}
                    onChange={(e) => {
                      const date = formData.endDate.split('T')[0] || new Date().toISOString().split('T')[0];
                      const time = e.target.value;
                      setFormData(prev => ({ ...prev, endDate: `${date}T${time}` }));
                    }}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    required
                    aria-label="Event end time"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Signup Deadline */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-md font-medium text-gray-800 mb-3">Vendor Applications</h4>
          <div className="max-w-2xl">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Application Deadline *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={formData.vendorSignupDeadline.split('T')[0] || ''}
                  onChange={(e) => {
                    const date = e.target.value;
                    const time = formData.vendorSignupDeadline.includes('T') ? formData.vendorSignupDeadline.split('T')[1] : '23:59';
                    setFormData(prev => ({ ...prev, vendorSignupDeadline: `${date}T${time}` }));
                  }}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                  required
                  aria-label="Vendor application deadline date"
                />
              </div>
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  value={formData.vendorSignupDeadline.includes('T') ? formData.vendorSignupDeadline.split('T')[1] : '23:59'}
                  onChange={(e) => {
                    const date = formData.vendorSignupDeadline.split('T')[0] || new Date().toISOString().split('T')[0];
                    const time = e.target.value;
                    setFormData(prev => ({ ...prev, vendorSignupDeadline: `${date}T${time}` }));
                  }}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                  required
                  aria-label="Vendor application deadline time"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Vendors must submit applications by this date and time
            </p>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              id="isRecurring"
              checked={formData.isRecurring}
              onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
              className="w-4 h-4 text-brand-green border-gray-300 rounded focus:ring-brand-green"
            />
            <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
              This is a recurring event
            </label>
          </div>
          
          {formData.isRecurring && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recurrence Pattern
              </label>
              <select
                value={formData.recurrenceType}
                onChange={(e) => setFormData(prev => ({ ...prev, recurrenceType: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                aria-label="Recurrence pattern"
              >
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Vendor Setup & Takedown */}
      <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-blue-500" />
          Vendor Setup & Takedown
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Provide clear instructions for vendors about when and how to set up and take down their booths.
        </p>
        
        <div className="space-y-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Setup Start Time
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={formData.setupStartTime.split('T')[0] || ''}
                  onChange={(e) => {
                    const date = e.target.value;
                    const time = formData.setupStartTime.includes('T') ? formData.setupStartTime.split('T')[1] : '08:00';
                    setFormData(prev => ({ ...prev, setupStartTime: `${date}T${time}` }));
                  }}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                  aria-label="Vendor setup start date"
                />
              </div>
              <div className="relative">
                <Clock3 className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  value={formData.setupStartTime.includes('T') ? formData.setupStartTime.split('T')[1] : '08:00'}
                  onChange={(e) => {
                    const date = formData.setupStartTime.split('T')[0] || new Date().toISOString().split('T')[0];
                    const time = e.target.value;
                    setFormData(prev => ({ ...prev, setupStartTime: `${date}T${time}` }));
                  }}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                  aria-label="Vendor setup start time"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              When vendors can begin setting up their booths
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Takedown End Time
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={formData.takedownEndTime.split('T')[0] || ''}
                  onChange={(e) => {
                    const date = e.target.value;
                    const time = formData.takedownEndTime.includes('T') ? formData.takedownEndTime.split('T')[1] : '19:00';
                    setFormData(prev => ({ ...prev, takedownEndTime: `${date}T${time}` }));
                  }}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                  aria-label="Vendor takedown end date"
                />
              </div>
              <div className="relative">
                <Clock3 className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  value={formData.takedownEndTime.includes('T') ? formData.takedownEndTime.split('T')[1] : '19:00'}
                  onChange={(e) => {
                    const date = formData.takedownEndTime.split('T')[0] || new Date().toISOString().split('T')[0];
                    const time = e.target.value;
                    setFormData(prev => ({ ...prev, takedownEndTime: `${date}T${time}` }));
                  }}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                  aria-label="Vendor takedown end time"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Latest time vendors must finish cleaning up
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Setup Instructions
            </label>
            <textarea
              value={formData.setupInstructions}
              onChange={(e) => setFormData(prev => ({ ...prev, setupInstructions: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
              placeholder="e.g., Bring your own tables, chairs, and displays. No stakes allowed in grass areas. Electricity available at select locations..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Takedown Instructions
            </label>
            <textarea
              value={formData.takedownInstructions}
              onChange={(e) => setFormData(prev => ({ ...prev, takedownInstructions: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
              placeholder="e.g., Remove all items, dispose of trash properly, check for any damage to venue. Leave space clean and ready for next event..."
            />
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Setup & Takedown Tips:</p>
              <ul className="space-y-1 text-xs">
                <li>• Include parking instructions for setup vehicles</li>
                <li>• Specify what equipment vendors need to bring</li>
                <li>• Mention any restrictions (no stakes, noise limits, etc.)</li>
                <li>• Provide contact info for setup questions</li>
                <li>• Include cleanup requirements and trash disposal</li>
              </ul>
            </div>
          </div>
        </div>
      </div>



      {/* Rules and Policies */}
      <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
        <h3 className="text-lg font-semibold mb-4">Rules & Policies</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Rules and Policies
          </label>
          <textarea
            value={formData.rules}
            onChange={(e) => setFormData(prev => ({ ...prev, rules: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
            placeholder="Enter any rules, policies, or requirements for vendors..."
          />
        </div>
      </div>

      {/* Cover Image */}
      <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
        <h3 className="text-lg font-semibold mb-4">Cover Image</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image URL
            </label>
            <div className="relative">
              <Upload className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={formData.coverImage}
                onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                placeholder="https://example.com/image.jpg"
                aria-label="Cover image URL"
              />
            </div>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-500">OR</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Image File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brand-green transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="cover-image-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // In a real app, you'd upload the file and get a URL
                    // For now, we'll create a local URL for preview
                    const url = URL.createObjectURL(file);
                    setFormData(prev => ({ ...prev, coverImage: url }));
                  }
                }}
              />
              <label
                htmlFor="cover-image-upload"
                className="mt-2 inline-block px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors cursor-pointer"
              >
                Choose File
              </label>
            </div>
          </div>

          {formData.coverImage && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <img
                src={formData.coverImage}
                alt="Cover preview"
                className="w-32 h-20 object-cover rounded border"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            )}
            </div>
          </div>
        </div>
      </div>
          </div>
        )}

        {/* Step 2: Rules & Policies */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Vendor Setup & Takedown */}
            <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-500" />
                Vendor Setup & Takedown
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Provide clear instructions for vendors about when and how to set up and take down their booths.
              </p>

              <div className="space-y-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Setup Start Time
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={formData.setupStartTime.split('T')[0] || ''}
                        onChange={(e) => {
                          const date = e.target.value;
                          const time = formData.setupStartTime.includes('T') ? formData.setupStartTime.split('T')[1] : '08:00';
                          setFormData(prev => ({ ...prev, setupStartTime: `${date}T${time}` }));
                        }}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                        aria-label="Vendor setup start date"
                      />
                    </div>
                    <div className="relative">
                      <Clock3 className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="time"
                        value={formData.setupStartTime.includes('T') ? formData.setupStartTime.split('T')[1] : '08:00'}
                        onChange={(e) => {
                          const date = formData.setupStartTime.split('T')[0] || new Date().toISOString().split('T')[0];
                          const time = e.target.value;
                          setFormData(prev => ({ ...prev, setupStartTime: `${date}T${time}` }));
                        }}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                        aria-label="Vendor setup start time"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    When vendors can begin setting up their booths
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Takedown End Time
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={formData.takedownEndTime.split('T')[0] || ''}
                        onChange={(e) => {
                          const date = e.target.value;
                          const time = formData.takedownEndTime.includes('T') ? formData.takedownEndTime.split('T')[1] : '19:00';
                          setFormData(prev => ({ ...prev, takedownEndTime: `${date}T${time}` }));
                        }}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                        aria-label="Vendor takedown end date"
                      />
                    </div>
                    <div className="relative">
                      <Clock3 className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="time"
                        value={formData.takedownEndTime.includes('T') ? formData.takedownEndTime.split('T')[1] : '19:00'}
                        onChange={(e) => {
                          const date = formData.takedownEndTime.split('T')[0] || new Date().toISOString().split('T')[0];
                          const time = e.target.value;
                          setFormData(prev => ({ ...prev, takedownEndTime: `${date}T${time}` }));
                        }}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                        aria-label="Vendor takedown end time"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Latest time vendors must finish cleaning up
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Setup Instructions
                  </label>
                  <textarea
                    value={formData.setupInstructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, setupInstructions: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    placeholder="e.g., Bring your own tables, chairs, and displays. No stakes allowed in grass areas. Electricity available at select locations..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Takedown Instructions
                  </label>
                  <textarea
                    value={formData.takedownInstructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, takedownInstructions: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                    placeholder="e.g., Remove all items, dispose of trash properly, check for any damage to venue. Leave space clean and ready for next event..."
                    required
                  />
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Setup & Takedown Tips:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Include parking instructions for setup vehicles</li>
                      <li>• Specify what equipment vendors need to bring</li>
                      <li>• Mention any restrictions (no stakes, noise limits, etc.)</li>
                      <li>• Provide contact info for setup questions</li>
                      <li>• Include cleanup requirements and trash disposal</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Rules and Policies */}
            <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
              <h3 className="text-lg font-semibold mb-4">Rules & Policies</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Rules and Policies
                </label>
                <textarea
                  value={formData.rules}
                  onChange={(e) => setFormData(prev => ({ ...prev, rules: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                  placeholder="Enter any rules, policies, or requirements for vendors..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Safety & Compliance */}
        {currentStep === 3 && (
          <div className="space-y-6">

      {/* Safety & Compliance */}
      <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-500" />
          Safety & Compliance
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Essential safety information and compliance requirements for your event.
        </p>
        
        {/* Venue Type & Weather */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Venue Type *
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <select
                value={formData.venueType}
                onChange={(e) => setFormData(prev => ({ ...prev, venueType: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                required
                aria-label="Venue type"
              >
                <option value="">Select venue type</option>
                <option value="indoor">Indoor Venue</option>
                <option value="outdoor">Outdoor Venue</option>
                <option value="mixed">Mixed Indoor/Outdoor</option>
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Affects safety requirements and weather considerations
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weather Forecast
            </label>
            <div className="relative">
              <Cloud className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.weatherForecast}
                onChange={(e) => setFormData(prev => ({ ...prev, weatherForecast: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                placeholder="e.g., Sunny, 75°F, 10% chance of rain"
                aria-label="Weather forecast"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Current weather forecast for event day
            </p>
          </div>
        </div>

        {/* Fire Marshal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fire Marshal Capacity
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={formData.fireMarshalCapacity}
                onChange={(e) => setFormData(prev => ({ ...prev, fireMarshalCapacity: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                placeholder="Maximum allowed capacity"
                min="1"
                aria-label="Fire marshal capacity"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Official fire marshal approved capacity limit
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fire Marshal Safety Items
            </label>
            <textarea
              value={formData.fireMarshalSafetyItems}
              onChange={(e) => setFormData(prev => ({ ...prev, fireMarshalSafetyItems: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
              placeholder="e.g., Fire extinguishers required, emergency exits must be clear, no open flames allowed..."
              aria-label="Fire marshal safety requirements"
            />
          </div>
        </div>

        {/* Evacuation Route */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Evacuation Route & Emergency Procedures
          </label>
          <div className="relative">
            <Route className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <textarea
              value={formData.evacuationRoute}
              onChange={(e) => setFormData(prev => ({ ...prev, evacuationRoute: e.target.value }))}
              rows={4}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
              placeholder="Describe evacuation routes, emergency exits, assembly points, and emergency contact procedures..."
              aria-label="Evacuation route and emergency procedures"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Detailed evacuation plan and emergency procedures
          </p>
        </div>

        {/* Safety Requirements */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Safety Requirements
          </label>
          <textarea
            value={formData.safetyRequirements}
            onChange={(e) => setFormData(prev => ({ ...prev, safetyRequirements: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
            placeholder="Any additional safety requirements, permits needed, insurance requirements, medical services, security measures..."
            aria-label="Additional safety requirements"
          />
        </div>

        {/* Vendor Contract */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vendor Contract Document
          </label>
          <div className="relative">
            <FileCheck className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="url"
              value={formData.vendorContract}
              onChange={(e) => setFormData(prev => ({ ...prev, vendorContract: e.target.value }))}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
              placeholder="https://example.com/vendor-contract.pdf"
              aria-label="Vendor contract URL"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            URL to vendor contract that vendors must acknowledge when signing up
          </p>
        </div>
        
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-1">Safety & Compliance Reminder:</p>
              <ul className="space-y-1 text-xs">
                <li>• Ensure all required permits are obtained before the event</li>
                <li>• Fire marshal inspection may be required for certain venues</li>
                <li>• Weather contingency plans should be in place for outdoor events</li>
                <li>• Emergency contact information should be readily available</li>
                <li>• Vendor contracts must be legally reviewed before use</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
          </div>
        )}

        {/* Step 4: Dynamic Floor Plan */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="bg-brand-cream rounded-lg p-6 shadow-md border">
              <h3 className="text-lg font-semibold mb-4">Dynamic Site Map</h3>
              <p className="text-sm text-gray-600 mb-4">
                Create a dynamic site map where you can mark stall sizes, locations, and allowed vendor types. This will help vendors visualize the layout and select appropriate spaces.
              </p>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-700 mb-2">Site Map Builder</h4>
                <p className="text-gray-500 mb-4">
                  The dynamic site map builder will be available after the event is created. You'll be able to:
                </p>
                <ul className="text-left text-sm text-gray-600 space-y-1 max-w-md mx-auto">
                  <li>• Upload a venue floor plan or create a grid layout</li>
                  <li>• Mark stall locations with clickable areas</li>
                  <li>• Set stall sizes and dimensions</li>
                  <li>• Assign allowed vendor types to specific areas</li>
                  <li>• Set pricing tiers by location (corner, endcap, etc.)</li>
                  <li>• Generate printable maps for vendors</li>
                </ul>
                <button
                  type="button"
                  className="mt-4 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled
                >
                  Create Site Map (Available after event creation)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <div className="flex gap-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className="flex items-center gap-2 px-6 py-3 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !validateStep(currentStep)}
                className="flex items-center gap-2 px-6 py-3 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : mode === 'create' ? 'Create Event' : 'Update Event'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
