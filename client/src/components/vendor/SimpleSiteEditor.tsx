import React, { useState, useRef } from 'react';
import { 
  X, 
  Save, 
  Upload,
  Image as ImageIcon,
  Camera,
  Palette,
  Plus,
  Trash2
} from 'lucide-react';

interface SiteSettings {
  siteName: string;
  tagline: string;
  ourStory?: string;
  values?: string[];
  sustainabilityCommitments?: string[];
  awards?: string[];
  charities?: string[];
  trustAndSafety?: {
    secureCheckout?: string;
    verifiedVendor?: string;
    returnPolicy?: string;
  };
  pageBackgroundColor: string;
  boxBackgroundColor: string;
  fontColor: string;
  buttonColor: string;
  linkColor: string;
  logo: string;
  backgroundImage: string;
  // New fields for contact and business info
  contactInfo: {
    phone: string;
    email: string;
    website: string;
    address: string;
  };
  businessHours: {
    'Monday - Friday': string;
    'Saturday': string;
    'Sunday': string;
  };
  socialMedia: {
    instagram: string;
    facebook: string;
    twitter: string;
    youtube: string;
    tiktok: string;
  };
}

interface SimpleSiteEditorProps {
  onSave: (settings: SiteSettings) => void;
  onClose: () => void;
  currentSettings: SiteSettings;
}

const defaultSettings: SiteSettings = {
  siteName: 'Artisan Bakes Atlanta',
  tagline: 'Handcrafted with Love',
  ourStory: 'We started as a small family bakery with a passion for creating authentic, delicious bread using traditional methods and modern techniques. Our sourdough starter has been lovingly maintained for over 15 years, creating the perfect foundation for our artisanal breads.',
  values: ['Community First', 'Traditional Methods', 'Quality Over Quantity'],
  sustainabilityCommitments: ['Carbon Neutral', 'Zero Waste', 'Local Ingredients'],
  awards: ['Best Bakery 2024 - Atlanta Magazine', 'Gold Medal - National Bread Competition', 'Top 10 Artisan Bakers in Georgia'],
  charities: ['Atlanta Community Food Bank', 'Local Schools Breakfast Program', 'Sustainable Farming Initiative'],
  trustAndSafety: {
    secureCheckout: 'SSL encrypted payments',
    verifiedVendor: 'Identity confirmed',
    returnPolicy: '7-day satisfaction guarantee'
  },
  pageBackgroundColor: '#FFFFFF',
  boxBackgroundColor: '#F7F2EC',
  fontColor: '#2C2C2C',
  buttonColor: '#8B4513',
  linkColor: '#5B6E02',
  logo: '',
  backgroundImage: '',
  // New default values for contact and business info
  contactInfo: {
    phone: '(404) 555-0123',
    email: 'hello@artisanbakesatlanta.com',
    website: 'https://artisanbakesatlanta.com',
    address: '123 Artisan Way, Atlanta, GA 30301',
  },
  businessHours: {
    'Monday - Friday': '7:00 AM - 6:00 PM',
    'Saturday': '8:00 AM - 5:00 PM',
    'Sunday': '9:00 AM - 3:00 PM',
  },
  socialMedia: {
    instagram: 'https://instagram.com/artisanbakesatlanta',
    facebook: 'https://facebook.com/artisanbakesatlanta',
    twitter: 'https://twitter.com/artisanbakesatl',
    youtube: 'https://youtube.com/@artisanbakesatlanta',
    tiktok: 'https://tiktok.com/@artisanbakesatlanta',
  },
};

const SimpleSiteEditor: React.FC<SimpleSiteEditorProps> = ({ 
  onSave, 
  onClose, 
  currentSettings = defaultSettings
}) => {
  const [settings, setSettings] = useState<SiteSettings>(currentSettings);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSettings(prev => ({ ...prev, logo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSettings(prev => ({ ...prev, backgroundImage: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const handleRestoreDefaults = () => {
    if (window.confirm('Are you sure you want to restore all settings to default? This will reset all customizations.')) {
      setSettings(defaultSettings);
    }
  };

  const colorOptions = [
    '#FFFFFF', '#F7F2EC', '#F3F4F6', '#FEF3C7', '#DBEAFE', '#D1FAE5',
    '#5B6E02', '#8B4513', '#2C2C2C', '#374151', '#6B7280', '#9CA3AF',
    '#16a34a', '#dc2626', '#2563eb', '#7c3aed', '#ea580c', '#0891b2'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl mx-4 max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Site Editor</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
              aria-label="Close editor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 mt-2">Customize your store's appearance</p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Settings */}
            <div className="space-y-6">
              {/* Site Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  Site Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                      placeholder="Enter site name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tagline
                    </label>
                    <input
                      type="text"
                      value={settings.tagline}
                      onChange={(e) => setSettings(prev => ({ ...prev, tagline: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                      placeholder="Enter tagline"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Our Story
                    </label>
                    <textarea
                      value={settings.ourStory || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, ourStory: e.target.value }))}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent resize-none"
                      placeholder="Tell your story... Share your background, passion, and what makes your products special."
                    />
                    <p className="text-xs text-gray-500 mt-1">This will appear in the "Our Story" section of your storefront</p>
                  </div>
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo</h3>
                <div className="space-y-3">
                  {settings.logo && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
                      <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-[#5B6E02] overflow-hidden">
                        <img 
                          src={settings.logo} 
                          alt="Logo preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Current logo</p>
                      </div>
                      <button
                        onClick={() => {
                          setSettings(prev => ({ ...prev, logo: '' }));
                          if (logoInputRef.current) logoInputRef.current.value = '';
                        }}
                        className="text-red-500 hover:text-red-700 p-1 rounded"
                        aria-label="Remove logo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#5B6E02] transition-colors">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <div className="space-y-2">
                        <div className="w-8 h-8 bg-[#5B6E02] rounded-full flex items-center justify-center mx-auto">
                          <ImageIcon className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {settings.logo ? 'Change Logo' : 'Upload Logo'}
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Background Image */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Background Image</h3>
                <div className="space-y-3">
                  {settings.backgroundImage && (
                    <div className="space-y-2">
                      <div className="relative w-full h-20 bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={settings.backgroundImage} 
                          alt="Background preview" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => {
                            setSettings(prev => ({ ...prev, backgroundImage: '' }));
                            if (backgroundInputRef.current) backgroundInputRef.current.value = '';
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          aria-label="Remove background"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#5B6E02] transition-colors">
                    <input
                      ref={backgroundInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBackgroundUpload}
                      className="hidden"
                      id="background-upload"
                    />
                    <label htmlFor="background-upload" className="cursor-pointer">
                      <div className="space-y-2">
                        <div className="w-8 h-8 bg-[#5B6E02] rounded-full flex items-center justify-center mx-auto">
                          <Camera className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {settings.backgroundImage ? 'Change Background' : 'Upload Background'}
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={settings.contactInfo.phone}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        contactInfo: { ...prev.contactInfo, phone: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={settings.contactInfo.email}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        contactInfo: { ...prev.contactInfo, email: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input
                      type="url"
                      value={settings.contactInfo.website}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        contactInfo: { ...prev.contactInfo, website: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                      placeholder="Enter website URL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      value={settings.contactInfo.address}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        contactInfo: { ...prev.contactInfo, address: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                      placeholder="Enter business address"
                    />
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Monday - Friday</label>
                    <input
                      type="text"
                      value={settings.businessHours['Monday - Friday']}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        businessHours: { ...prev.businessHours, 'Monday - Friday': e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                      placeholder="e.g., 7:00 AM - 6:00 PM"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Saturday</label>
                    <input
                      type="text"
                      value={settings.businessHours.Saturday}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        businessHours: { ...prev.businessHours, Saturday: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                      placeholder="e.g., 8:00 AM - 5:00 PM"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sunday</label>
                    <input
                      type="text"
                      value={settings.businessHours.Sunday}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        businessHours: { ...prev.businessHours, Sunday: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                      placeholder="e.g., 9:00 AM - 3:00 PM"
                    />
                  </div>
                </div>
              </div>

              {/* Values */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Our Values</h3>
                <div className="space-y-3">
                  {(settings.values || []).map((value, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => {
                          const newValues = [...(settings.values || [])];
                          newValues[index] = e.target.value;
                          setSettings(prev => ({ ...prev, values: newValues }));
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                        placeholder="Enter a value"
                      />
                      <button
                        onClick={() => {
                          const newValues = (settings.values || []).filter((_, i) => i !== index);
                          setSettings(prev => ({ ...prev, values: newValues }));
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Remove value"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setSettings(prev => ({ 
                        ...prev, 
                        values: [...(prev.values || []), ''] 
                      }));
                    }}
                    className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#5B6E02] hover:text-[#5B6E02] transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Value
                  </button>
                </div>
              </div>

              {/* Sustainability Commitments */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sustainability Commitments</h3>
                <div className="space-y-3">
                  {(settings.sustainabilityCommitments || []).map((commitment, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={commitment}
                        onChange={(e) => {
                          const newCommitments = [...(settings.sustainabilityCommitments || [])];
                          newCommitments[index] = e.target.value;
                          setSettings(prev => ({ ...prev, sustainabilityCommitments: newCommitments }));
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                        placeholder="Enter a commitment"
                      />
                      <button
                        onClick={() => {
                          const newCommitments = (settings.sustainabilityCommitments || []).filter((_, i) => i !== index);
                          setSettings(prev => ({ ...prev, sustainabilityCommitments: newCommitments }));
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Remove commitment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setSettings(prev => ({ 
                        ...prev, 
                        sustainabilityCommitments: [...(prev.sustainabilityCommitments || []), ''] 
                      }));
                    }}
                    className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#5B6E02] hover:text-[#5B6E02] transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Commitment
                  </button>
                </div>
              </div>

              {/* Awards & Achievements */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Awards & Achievements</h3>
                <div className="space-y-3">
                  {(settings.awards || []).map((award, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={award}
                        onChange={(e) => {
                          const newAwards = [...(settings.awards || [])];
                          newAwards[index] = e.target.value;
                          setSettings(prev => ({ ...prev, awards: newAwards }));
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                        placeholder="Enter award or recognition"
                      />
                      <button
                        onClick={() => {
                          const newAwards = (settings.awards || []).filter((_, i) => i !== index);
                          setSettings(prev => ({ ...prev, awards: newAwards }));
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Remove award"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setSettings(prev => ({ 
                        ...prev, 
                        awards: [...(prev.awards || []), ''] 
                      }));
                    }}
                    className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#5B6E02] hover:text-[#5B6E02] transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Award
                  </button>
                </div>
              </div>

              {/* Supported Charities */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Supported Charities</h3>
                <div className="space-y-3">
                  {(settings.charities || []).map((charity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={charity}
                        onChange={(e) => {
                          const newCharities = [...(settings.charities || [])];
                          newCharities[index] = e.target.value;
                          setSettings(prev => ({ ...prev, charities: newCharities }));
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                        placeholder="Enter charity or cause"
                      />
                      <button
                        onClick={() => {
                          const newCharities = (settings.charities || []).filter((_, i) => i !== index);
                          setSettings(prev => ({ ...prev, charities: newCharities }));
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Remove charity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setSettings(prev => ({ 
                        ...prev, 
                        charities: [...(prev.charities || []), ''] 
                      }));
                    }}
                    className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#5B6E02] hover:text-[#5B6E02] transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Charity
                  </button>
                </div>
              </div>

              {/* Trust & Safety */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Trust & Safety</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Secure Checkout Message</label>
                    <input
                      type="text"
                      value={settings.trustAndSafety?.secureCheckout || ''}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        trustAndSafety: { 
                          ...prev.trustAndSafety, 
                          secureCheckout: e.target.value 
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                      placeholder="e.g., SSL encrypted payments"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Verified Vendor Message</label>
                    <input
                      type="text"
                      value={settings.trustAndSafety?.verifiedVendor || ''}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        trustAndSafety: { 
                          ...prev.trustAndSafety, 
                          verifiedVendor: e.target.value 
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                      placeholder="e.g., Identity confirmed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Return Policy</label>
                    <input
                      type="text"
                      value={settings.trustAndSafety?.returnPolicy || ''}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        trustAndSafety: { 
                          ...prev.trustAndSafety, 
                          returnPolicy: e.target.value 
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                      placeholder="e.g., 7-day satisfaction guarantee"
                    />
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media Links</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                    <input
                      type="url"
                      value={settings.socialMedia.instagram}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        socialMedia: { ...prev.socialMedia, instagram: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                      placeholder="Enter Instagram profile URL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                    <input
                      type="url"
                      value={settings.socialMedia.facebook}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        socialMedia: { ...prev.socialMedia, facebook: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                      placeholder="Enter Facebook page URL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                    <input
                      type="url"
                      value={settings.socialMedia.twitter}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        socialMedia: { ...prev.socialMedia, twitter: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                      placeholder="Enter Twitter profile URL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">YouTube</label>
                    <input
                      type="url"
                      value={settings.socialMedia.youtube}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        socialMedia: { ...prev.socialMedia, youtube: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                      placeholder="Enter YouTube channel URL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">TikTok</label>
                    <input
                      type="url"
                      value={settings.socialMedia.tiktok}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        socialMedia: { ...prev.socialMedia, tiktok: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                      placeholder="Enter TikTok profile URL"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Color Settings */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Color Scheme
              </h3>
              
              {/* Page Background Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Background Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.pageBackgroundColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, pageBackgroundColor: e.target.value }))}
                    className="w-12 h-12 border border-gray-300 rounded cursor-pointer"
                    title="Page background color picker"
                  />
                  <input
                    type="text"
                    value={settings.pageBackgroundColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, pageBackgroundColor: e.target.value }))}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded"
                    placeholder="Enter hex color"
                  />
                </div>
              </div>

              {/* Box Background Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Box Background Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.boxBackgroundColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, boxBackgroundColor: e.target.value }))}
                    className="w-12 h-12 border border-gray-300 rounded cursor-pointer"
                    title="Box background color picker"
                  />
                  <input
                    type="text"
                    value={settings.boxBackgroundColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, boxBackgroundColor: e.target.value }))}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded"
                    placeholder="Enter hex color"
                  />
                </div>
              </div>

              {/* Font Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.fontColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, fontColor: e.target.value }))}
                    className="w-12 h-12 border border-gray-300 rounded cursor-pointer"
                    title="Font color picker"
                  />
                  <input
                    type="text"
                    value={settings.fontColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, fontColor: e.target.value }))}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded"
                    placeholder="Enter hex color"
                  />
                </div>
              </div>

              {/* Button Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.buttonColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, buttonColor: e.target.value }))}
                    className="w-12 h-12 border border-gray-300 rounded cursor-pointer"
                    title="Button color picker"
                  />
                  <input
                    type="text"
                    value={settings.buttonColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, buttonColor: e.target.value }))}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded"
                    placeholder="Enter hex color"
                  />
                </div>
              </div>

              {/* Link Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.linkColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, linkColor: e.target.value }))}
                    className="w-12 h-12 border border-gray-300 rounded cursor-pointer"
                    title="Link color picker"
                  />
                  <input
                    type="text"
                    value={settings.linkColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, linkColor: e.target.value }))}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded"
                    placeholder="Enter hex color"
                  />
                </div>
              </div>

              {/* Quick Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quick Colors</label>
                <div className="grid grid-cols-8 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSettings(prev => ({ ...prev, pageBackgroundColor: color }))}
                      className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400 transition-colors"
                      style={{ backgroundColor: color }}
                      title={`Set page background to ${color}`}
                      aria-label={`Set page background to ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={handleRestoreDefaults}
              className="px-4 py-2 text-orange-600 border border-orange-300 rounded-lg hover:bg-orange-50 transition-colors text-sm font-medium"
            >
              Restore to Default
            </button>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-[#5B6E02] text-white rounded-lg hover:bg-[#4A5A01] transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleSiteEditor;
