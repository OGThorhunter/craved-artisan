import React, { useState } from 'react';
import { Calendar, MapPin, Users, FileText, Upload, Phone, Clock, AlertTriangle, Truck, Clock3, Shield, Cloud, Route, Building, FileCheck, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { ImageOverlayEditor } from './ImageOverlayEditor';
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
    evacuationRouteImage: event?.evacuationRouteImage || initialData?.evacuationRouteImage || '',
    fireMarshalCapacity: event?.fireMarshalCapacity || initialData?.fireMarshalCapacity || '',
    fireMarshalSafetyItems: event?.fireMarshalSafetyItems || initialData?.fireMarshalSafetyItems || '',
    vendorContract: event?.vendorContract || initialData?.vendorContract || '',
    safetyRequirements: event?.safetyRequirements || initialData?.safetyRequirements || '',
    // Floor plan fields
    floorPlanImage: event?.floorPlanImage || initialData?.floorPlanImage || '',
    gridRows: event?.gridRows || initialData?.gridRows || 5,
    gridColumns: event?.gridColumns || initialData?.gridColumns || 8,
    // Initialize stall status with some pre-sold stalls to match vendor assignments
    stallStatus: {
      ...(event?.stallStatus || initialData?.stallStatus || {}),
      // Pre-populate some stalls as sold to match vendor assignments
      5: { status: 'stall', zone: 'zone-a', size: '10x10' },
      12: { status: 'stall', zone: 'zone-a', size: '5x5' },
      18: { status: 'stall', zone: 'zone-b', size: '15x15' },
      25: { status: 'stall', zone: 'zone-b', size: '10x10' },
      31: { status: 'stall', zone: 'zone-c', size: '10x15' },
      38: { status: 'stall', zone: 'zone-c', size: '10x10' },
    },
    zoneAName: event?.zoneAName || initialData?.zoneAName || 'Zone A',
    zoneBName: event?.zoneBName || initialData?.zoneBName || 'Zone B',
    zoneCName: event?.zoneCName || initialData?.zoneCName || 'Zone C',
    // Enhanced floor plan fields
    selectedTool: 'available',
    stallSize: '10x10',
    selectedZone: 'zone-a',
    customZones: [],
    layoutMode: 'grid',
    // Mock vendor data for sold stalls - these correspond to grid positions marked as 'stall'
    vendorAssignments: {
      5: { type: 'Baker', name: 'Sweet Treats Bakery', size: '10x10' },
      12: { type: 'Honey', name: 'Golden Honey Co.', size: '5x5' },
      18: { type: 'Vegetables', name: 'Fresh Farm Produce', size: '15x15' },
      25: { type: 'Vegetables', name: 'Organic Greens', size: '10x10' },
      31: { type: 'Baker', name: 'Artisan Bread Co.', size: '10x15' },
      38: { type: 'Vegetables', name: 'Local Garden', size: '10x10' },
    },
    // Image overlay elements
    overlayElements: event?.overlayElements || initialData?.overlayElements || [],
  });

  // Helper functions for floor plan
  const getCellColor = (status: string): string => {
    switch (status) {
      case 'stall': return '#10b981';
      case 'walking-path': return '#93c5fd';
      case 'wall': return '#374151';
      case 'exit': return '#ef4444';
      case 'available': 
      default: return '#e5e7eb';
    }
  };

  const getCellLabel = (status: string): string => {
    switch (status) {
      case 'stall': return 'S';
      case 'walking-path': return 'P';
      case 'wall': return 'W';
      case 'exit': return 'E';
      case 'available': 
      default: return 'A';
    }
  };


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

  // Overlay element handlers
  const handleOverlayElementsChange = (elements: any[]) => {
    setFormData(prev => ({ ...prev, overlayElements: elements }));
  };

  const handleVendorAssign = (elementId: string, vendor: any) => {
    console.log('Assigning vendor to element:', elementId, vendor);
    setFormData(prev => ({
      ...prev,
      overlayElements: prev.overlayElements.map((el: any) => 
        el.id === elementId 
          ? { ...el, vendorId: vendor.id, vendorName: vendor.name, vendorType: vendor.type }
          : el
      )
    }));
  };

  const handleVendorRemove = (elementId: string) => {
    console.log('Removing vendor from element:', elementId);
    setFormData(prev => ({
      ...prev,
      overlayElements: prev.overlayElements.map((el: any) => 
        el.id === elementId 
          ? { ...el, vendorId: undefined, vendorName: undefined, vendorType: undefined }
          : el
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only allow form submission on the final step
    if (currentStep !== 4) {
      return;
    }
    
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
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="flex items-center justify-center">
          <div className="flex items-center justify-between w-full max-w-full">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center flex-1 min-w-0">
                <div className="flex items-center mb-2">
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
                  {index < steps.length - 1 && (
                    <div className={`hidden md:block w-12 lg:w-16 h-0.5 ml-2 lg:ml-4 ${
                      currentStep > step.id ? 'bg-brand-green' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
                <div className="text-center px-1 w-full">
                  <p className={`text-xs sm:text-sm font-medium truncate ${
                    currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className={`text-xs truncate hidden sm:block ${
                    currentStep >= step.id ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <>
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
                    Setup Start Time *
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
                    Takedown End Time *
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
                    Setup Instructions *
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
                    Takedown Instructions *
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
            Evacuation Route & Emergency Procedures *
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Upload an evacuation route image or provide detailed text instructions
          </p>
          
          {/* Image Upload Option */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Evacuation Route Image (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-brand-green transition-colors">
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">Click to upload evacuation route image</p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="evacuation-route-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // In a real app, you'd upload the file and get a URL
                    const url = URL.createObjectURL(file);
                    setFormData(prev => ({ ...prev, evacuationRouteImage: url }));
                  }
                }}
              />
              <label
                htmlFor="evacuation-route-upload"
                className="mt-2 inline-block px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors cursor-pointer"
              >
                Choose Image File
              </label>
            </div>
            {formData.evacuationRouteImage && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Image:</p>
                <img
                  src={formData.evacuationRouteImage}
                  alt="Evacuation route preview"
                  className="w-48 h-32 object-cover rounded border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Text Instructions (Required if no image) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Instructions *
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
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Required: Provide detailed evacuation plan and emergency procedures
            </p>
          </div>
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
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                Dynamic Site Map Builder
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Create a dynamic site map where you can mark stall sizes, locations, and allowed vendor types. This will help vendors visualize the layout and select appropriate spaces.
              </p>

              {/* Layout Mode Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Layout Creation Mode
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="layoutMode"
                      value="grid"
                      checked={formData.layoutMode === 'grid'}
                      onChange={(e) => setFormData(prev => ({ ...prev, layoutMode: e.target.value }))}
                      className="text-brand-green focus:ring-brand-green"
                    />
                    <span className="text-sm">Grid Layout Builder</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="layoutMode"
                      value="image-overlay"
                      checked={formData.layoutMode === 'image-overlay'}
                      onChange={(e) => setFormData(prev => ({ ...prev, layoutMode: e.target.value }))}
                      className="text-brand-green focus:ring-brand-green"
                    />
                    <span className="text-sm">Image Overlay Mode</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Choose between creating a grid-based layout or overlaying elements on an uploaded floor plan image
                </p>
              </div>

              {/* Floor Plan Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Venue Floor Plan (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brand-green transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload a venue floor plan image</p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="floor-plan-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setFormData(prev => ({ ...prev, floorPlanImage: url }));
                      }
                    }}
                  />
                  <label
                    htmlFor="floor-plan-upload"
                    className="mt-2 inline-block px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors cursor-pointer"
                  >
                    Upload Floor Plan
                  </label>
                </div>
                {formData.floorPlanImage && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Floor Plan Preview:</p>
                    <img
                      src={formData.floorPlanImage}
                      alt="Floor plan preview"
                      className="w-full max-w-2xl h-64 object-contain rounded border bg-white"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Grid Layout Builder */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Create Grid Layout</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Rows
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={formData.gridRows || 5}
                      onChange={(e) => setFormData(prev => ({ ...prev, gridRows: parseInt(e.target.value) || 5 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                      aria-label="Number of rows for grid layout"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Columns
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={formData.gridColumns || 8}
                      onChange={(e) => setFormData(prev => ({ ...prev, gridColumns: parseInt(e.target.value) || 8 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                      aria-label="Number of columns for grid layout"
                    />
                  </div>
                </div>
              </div>

              {/* Layout Tools - Only show for grid mode */}
              {formData.layoutMode === 'grid' && (
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">Layout Tools</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Selected Tool</label>
                    <select
                      value={formData.selectedTool || 'available'}
                      onChange={(e) => setFormData(prev => ({ ...prev, selectedTool: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                      aria-label="Select layout tool"
                    >
                      <option value="available">Available (A)</option>
                      <option value="stall">Stall (S)</option>
                      <option value="walking-path">Walking Path (P)</option>
                      <option value="wall">Wall (W)</option>
                      <option value="exit">Exit (E)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stall Size</label>
                    <select
                      value={formData.stallSize || '10x10'}
                      onChange={(e) => setFormData(prev => ({ ...prev, stallSize: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                      aria-label="Select stall size"
                    >
                      <option value="5x5">5x5 ft</option>
                      <option value="10x10">10x10 ft</option>
                      <option value="10x15">10x15 ft</option>
                      <option value="15x15">15x15 ft</option>
                      <option value="20x20">20x20 ft</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zone</label>
                    <select
                      value={formData.selectedZone || 'zone-a'}
                      onChange={(e) => setFormData(prev => ({ ...prev, selectedZone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                      aria-label="Select zone"
                    >
                      <option value="zone-a">{formData.zoneAName || 'Zone A'}</option>
                      <option value="zone-b">{formData.zoneBName || 'Zone B'}</option>
                      <option value="zone-c">{formData.zoneCName || 'Zone C'}</option>
                      {formData.customZones?.map((zone, index) => (
                        <option key={index} value={`custom-${index}`}>{zone.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
                    <button
                      type="button"
                      onClick={() => {
                        const zoneName = prompt('Enter zone name:');
                        if (zoneName) {
                          setFormData(prev => ({
                            ...prev,
                            customZones: [...(prev.customZones || []), { name: zoneName, color: '#8B5CF6' }]
                          }));
                        }
                      }}
                      className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      Add Zone
                    </button>
                  </div>
                </div>
              </div>
              )}

              {/* Image Overlay Tools - Only show for image overlay mode */}
              {formData.layoutMode === 'image-overlay' && (
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">Image Overlay Tools</h4>
                  <div className="bg-white border border-gray-300 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Upload a floor plan image above, then use these tools to place elements on top of it.
                    </p>
                    
                    {!formData.floorPlanImage && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-2">
                          <div className="text-yellow-600 text-sm">
                            ⚠️ Please upload a floor plan image first to use image overlay mode.
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Element Type</label>
                        <select
                          value={formData.selectedTool || 'stall'}
                          onChange={(e) => setFormData(prev => ({ ...prev, selectedTool: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                          aria-label="Select overlay element type"
                        >
                          <option value="stall">Stall</option>
                          <option value="walking-path">Walking Path</option>
                          <option value="wall">Wall</option>
                          <option value="exit">Exit</option>
                          <option value="entrance">Entrance</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                        <select
                          value={formData.stallSize || '10x10'}
                          onChange={(e) => setFormData(prev => ({ ...prev, stallSize: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                          aria-label="Select element size"
                        >
                          <option value="5x5">5x5 ft</option>
                          <option value="10x10">10x10 ft</option>
                          <option value="10x15">10x15 ft</option>
                          <option value="15x15">15x15 ft</option>
                          <option value="20x20">20x20 ft</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Zone</label>
                        <select
                          value={formData.selectedZone || 'zone-a'}
                          onChange={(e) => setFormData(prev => ({ ...prev, selectedZone: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                          aria-label="Select zone"
                        >
                          <option value="zone-a">{formData.zoneAName || 'Zone A'}</option>
                          <option value="zone-b">{formData.zoneBName || 'Zone B'}</option>
                          <option value="zone-c">{formData.zoneCName || 'Zone C'}</option>
                          {formData.customZones?.map((zone, index) => (
                            <option key={index} value={`custom-${index}`}>{zone.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
                        <button
                          type="button"
                          onClick={() => {
                            const zoneName = prompt('Enter zone name:');
                            if (zoneName) {
                              setFormData(prev => ({
                                ...prev,
                                customZones: [...(prev.customZones || []), { name: zoneName, color: '#8B5CF6' }]
                              }));
                            }
                          }}
                          className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                        >
                          Add Zone
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="text-blue-600 text-sm">
                          💡 <strong>Tip:</strong> Click anywhere on the uploaded floor plan image to place the selected element. Use right-click to remove elements.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Compass */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Compass & Sun Position</h4>
                <div className="bg-white border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 border-2 border-gray-400 rounded-full relative flex items-center justify-center bg-gradient-to-br from-yellow-200 to-orange-200">
                        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-6 border-l-transparent border-r-transparent border-b-red-600"></div>
                        <div className="text-xs font-bold text-gray-800">N</div>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">Morning Sun (East)</p>
                        <p className="text-gray-600">6:00 AM - 12:00 PM</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-right">
                        <p className="font-medium">Evening Sun (West)</p>
                        <p className="text-gray-600">12:00 PM - 6:00 PM</p>
                      </div>
                      <div className="w-16 h-16 border-2 border-gray-400 rounded-full relative flex items-center justify-center bg-gradient-to-br from-orange-200 to-red-200">
                        <div className="text-xs font-bold text-gray-800">S</div>
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent border-t-red-600"></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Place food vendors on the west side for afternoon shade, or east side for morning sun exposure
                  </p>
                </div>
              </div>

              {/* Vendor Count Summary */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Vendor Registration Summary</h4>
                <div className="bg-white border border-gray-300 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(() => {
                      // Only count vendors that have corresponding sold stalls in the grid
                      const soldStalls = Object.keys(formData.stallStatus || {}).filter(
                        index => formData.stallStatus?.[index]?.status === 'stall'
                      );
                      
                      const vendorCounts = soldStalls.reduce((acc: Record<string, number>, stallIndex) => {
                        const vendor = formData.vendorAssignments?.[stallIndex];
                        if (vendor) {
                          acc[vendor.type] = (acc[vendor.type] || 0) + 1;
                        }
                        return acc;
                      }, {});
                      
                      return Object.entries(vendorCounts).map(([type, count]) => (
                        <div key={type} className="text-center">
                          <div className="text-2xl font-bold text-brand-green">{count}</div>
                          <div className="text-sm text-gray-600">{type}</div>
                        </div>
                      ));
                    })()}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Total Vendors:</span>
                      <span className="text-lg font-bold text-brand-green">
                        {(() => {
                          const soldStalls = Object.keys(formData.stallStatus || {}).filter(
                            index => formData.stallStatus?.[index]?.status === 'stall'
                          );
                          return soldStalls.filter(stallIndex => formData.vendorAssignments?.[stallIndex]).length;
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm font-medium text-gray-700">Total Sold Stalls:</span>
                      <span className="text-lg font-bold text-gray-600">
                        {Object.keys(formData.stallStatus || {}).filter(
                          index => formData.stallStatus?.[index]?.status === 'stall'
                        ).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Layout Preview */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Layout Preview</h4>
                
                {/* Grid Mode Preview */}
                {formData.layoutMode === 'grid' && (
                  <div className="border border-gray-300 rounded-lg p-4 bg-white">
                  <div className="grid gap-1 max-w-full overflow-auto" 
                       style={{ 
                         gridTemplateColumns: `repeat(${formData.gridColumns || 8}, 1fr)`,
                         gridTemplateRows: `repeat(${formData.gridRows || 5}, 1fr)`
                       }}>
                    {Array.from({ length: (formData.gridRows || 5) * (formData.gridColumns || 8) }, (_, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 border border-gray-200 bg-gray-100 hover:bg-brand-green/20 cursor-pointer transition-colors flex items-center justify-center text-xs font-medium"
                        onClick={() => {
                          // Set cell status based on selected tool
                          const newStatus = formData.selectedTool || 'available';
                          const zone = formData.selectedZone || 'zone-a';
                          
                          setFormData(prev => {
                            const newStallStatus = {
                              ...prev.stallStatus,
                              [index]: { status: newStatus, zone: zone, size: formData.stallSize }
                            };
                            
                            // If placing a stall, assign a mock vendor if none exists
                            let newVendorAssignments = { ...prev.vendorAssignments };
                            if (newStatus === 'stall' && !newVendorAssignments[index]) {
                              // Generate a mock vendor assignment
                              const vendorTypes = ['Baker', 'Honey', 'Vegetables', 'Artisan', 'Crafts'];
                              const randomType = vendorTypes[Math.floor(Math.random() * vendorTypes.length)];
                              const vendorNames = {
                                'Baker': ['Sweet Treats Bakery', 'Artisan Bread Co.', 'Local Bakery'],
                                'Honey': ['Golden Honey Co.', 'Bee Happy Honey', 'Pure Honey Co.'],
                                'Vegetables': ['Fresh Farm Produce', 'Organic Greens', 'Local Garden'],
                                'Artisan': ['Handmade Crafts', 'Artisan Works', 'Creative Studio'],
                                'Crafts': ['Craft Corner', 'Handmade Goods', 'Artisan Crafts']
                              };
                              const randomName = vendorNames[randomType as keyof typeof vendorNames][Math.floor(Math.random() * vendorNames[randomType as keyof typeof vendorNames].length)];
                              
                              newVendorAssignments[index] = {
                                type: randomType,
                                name: randomName,
                                size: formData.stallSize
                              };
                            } else if (newStatus !== 'stall' && newVendorAssignments[index]) {
                              // Remove vendor assignment if changing away from stall
                              delete newVendorAssignments[index];
                            }
                            
                            return {
                              ...prev,
                              stallStatus: newStallStatus,
                              vendorAssignments: newVendorAssignments
                            };
                          });
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          // Clear cell on right-click
                          setFormData(prev => {
                            const newStallStatus = { ...prev.stallStatus };
                            const newVendorAssignments = { ...prev.vendorAssignments };
                            
                            // Remove both stall status and vendor assignment
                            delete newStallStatus[index];
                            delete newVendorAssignments[index];
                            
                            return {
                              ...prev,
                              stallStatus: newStallStatus,
                              vendorAssignments: newVendorAssignments
                            };
                          });
                        }}
                        style={{
                          backgroundColor: getCellColor(formData.stallStatus?.[index]?.status || 'available'),
                          color: formData.stallStatus?.[index]?.status === 'wall' ? 'white' : 'black'
                        }}
                        title={formData.stallStatus?.[index]?.status === 'stall' && formData.vendorAssignments?.[index] 
                          ? `${formData.vendorAssignments[index].name}\nType: ${formData.vendorAssignments[index].type}\nSize: ${formData.vendorAssignments[index].size}`
                          : `${getCellLabel(formData.stallStatus?.[index]?.status || 'available')} - ${formData.stallStatus?.[index]?.size || 'N/A'}`}
                      >
                        {getCellLabel(formData.stallStatus?.[index]?.status || 'available')}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span>Sold (S)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-300 rounded"></div>
                      <span>Available (A)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-200 rounded"></div>
                      <span>Walking Path (P)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-800 rounded"></div>
                      <span>Wall (W)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span>Exit (E)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-200 rounded"></div>
                      <span>Custom Zones</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Click on grid cells to place the selected tool. Right-click to clear. Hover over sold stalls (S) to see vendor details.
                  </p>
                </div>
                )}

                {/* Image Overlay Mode Preview */}
                {formData.layoutMode === 'image-overlay' && (
                  <div className="border border-gray-300 rounded-lg p-4 bg-white">
                    {formData.floorPlanImage ? (
                      <ImageOverlayEditor
                        floorPlanImage={formData.floorPlanImage}
                        selectedTool={formData.selectedTool}
                        stallSize={formData.stallSize}
                        selectedZone={formData.selectedZone}
                        vendorAssignments={formData.vendorAssignments}
                        onElementsChange={handleOverlayElementsChange}
                        onVendorAssign={handleVendorAssign}
                        onVendorRemove={handleVendorRemove}
                      />
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <div className="text-lg mb-2">📐 Image Overlay Mode</div>
                        <p>Upload a floor plan image above to start placing elements on it.</p>
                        <p className="text-sm mt-2">Once uploaded, you'll be able to click on the image to place stalls, paths, and other elements.</p>
                      </div>
                    )}
                    
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="text-blue-600 text-sm">
                          💡 <strong>Image Overlay Features:</strong>
                          <ul className="mt-1 text-xs space-y-1">
                            <li>• Click anywhere on the uploaded image to place elements</li>
                            <li>• Right-click to remove elements</li>
                            <li>• Elements are positioned relative to the image coordinates</li>
                            <li>• Perfect for working with existing venue floor plans</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Zone Configuration */}
              <div className="mb-4">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Zone Configuration</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zone A Name
                      </label>
                      <input
                        type="text"
                        value={formData.zoneAName || 'Zone A'}
                        onChange={(e) => setFormData(prev => ({ ...prev, zoneAName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                        placeholder="Zone A"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zone B Name
                      </label>
                      <input
                        type="text"
                        value={formData.zoneBName || 'Zone B'}
                        onChange={(e) => setFormData(prev => ({ ...prev, zoneBName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                        placeholder="Zone B"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zone C Name
                      </label>
                      <input
                        type="text"
                        value={formData.zoneCName || 'Zone C'}
                        onChange={(e) => setFormData(prev => ({ ...prev, zoneCName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                        placeholder="Zone C"
                      />
                    </div>
                  </div>
                </div>
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  prevStep();
                }}
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCancel?.();
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  nextStep();
                }}
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
        </>
      </form>
    </div>
  );
}
