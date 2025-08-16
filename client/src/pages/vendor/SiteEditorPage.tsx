import React, { useState } from 'react';
import { 
  Save, 
  Eye, 
  Palette, 
  Type, 
  Image, 
  Layout, 
  Settings, 
  ArrowLeft,
  Plus,
  Trash2,
  Move,
  Copy
} from 'lucide-react';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';
import { Link, useLocation } from 'wouter';

interface Section {
  id: string;
  type: 'hero' | 'products' | 'about' | 'contact' | 'testimonials' | 'gallery';
  title: string;
  content: string;
  settings: {
    backgroundColor: string;
    textColor: string;
    padding: string;
    margin: string;
  };
}

interface SiteSettings {
  siteName: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  logo: string;
}

// This would be stored in a database or context in a real app
const initialSections: Section[] = [
  {
    id: '1',
    type: 'hero',
    title: 'Welcome to Artisan Bakes Atlanta',
    content: 'Handcrafted sourdough bread and artisanal pastries made with love and the finest ingredients. Every bite tells a story of tradition, passion, and community.',
    settings: {
      backgroundColor: '#F7F2EC',
      textColor: '#2C2C2C',
      padding: 'py-16',
      margin: 'mb-8'
    }
  },
  {
    id: '2',
    type: 'about',
    title: 'Our Story',
    content: 'We started as a small family bakery with a passion for creating authentic, delicious bread using traditional methods and modern techniques. Our sourdough starter has been lovingly maintained for over 15 years, creating the perfect foundation for our artisanal breads.',
    settings: {
      backgroundColor: '#FFFFFF',
      textColor: '#2C2C2C',
      padding: 'py-12',
      margin: 'mb-8'
    }
  },
  {
    id: '3',
    type: 'products',
    title: 'Featured Products',
    content: 'Discover our signature collection of handcrafted breads, pastries, and artisanal goods.',
    settings: {
      backgroundColor: '#F7F2EC',
      textColor: '#2C2C2C',
      padding: 'py-12',
      margin: 'mb-8'
    }
  },
  {
    id: '4',
    type: 'contact',
    title: 'Get in Touch',
    content: 'Ready to experience the difference that passion and tradition make? Contact us to place an order or learn more about our products.',
    settings: {
      backgroundColor: '#FFFFFF',
      textColor: '#2C2C2C',
      padding: 'py-12',
      margin: 'mb-8'
    }
  }
];

const initialSiteSettings: SiteSettings = {
  siteName: 'Artisan Bakes Atlanta',
  tagline: 'Handcrafted with Love',
  primaryColor: '#5B6E02',
  secondaryColor: '#8B4513',
  fontFamily: 'Inter',
  logo: ''
};

const SiteEditorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'settings'>('editor');
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(initialSiteSettings);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Save changes to localStorage (in a real app, this would save to a database)
  const saveChanges = () => {
    localStorage.setItem('storefront-sections', JSON.stringify(sections));
    localStorage.setItem('storefront-settings', JSON.stringify(siteSettings));
    setHasChanges(false);
    // You could add a toast notification here
    alert('Changes saved! Your storefront has been updated.');
  };

  const addSection = (type: Section['type']) => {
    const newSection: Section = {
      id: Date.now().toString(),
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Section`,
      content: 'Add your content here...',
      settings: {
        backgroundColor: '#FFFFFF',
        textColor: '#2C2C2C',
        padding: 'py-8',
        margin: 'mb-6'
      }
    };
    setSections([...sections, newSection]);
    setHasChanges(true);
  };

  const updateSection = (id: string, updates: Partial<Section>) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, ...updates } : section
    ));
    setHasChanges(true);
  };

  const deleteSection = (id: string) => {
    setSections(sections.filter(section => section.id !== id));
    if (selectedSection === id) {
      setSelectedSection(null);
    }
    setHasChanges(true);
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const index = sections.findIndex(section => section.id === id);
    if (direction === 'up' && index > 0) {
      const newSections = [...sections];
      [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
      setSections(newSections);
      setHasChanges(true);
    } else if (direction === 'down' && index < sections.length - 1) {
      const newSections = [...sections];
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
      setSections(newSections);
      setHasChanges(true);
    }
  };

  const duplicateSection = (id: string) => {
    const section = sections.find(s => s.id === id);
    if (section) {
      const newSection = {
        ...section,
        id: Date.now().toString(),
        title: `${section.title} (Copy)`
      };
      setSections([...sections, newSection]);
      setHasChanges(true);
    }
  };

  const renderEditor = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Sidebar - Section List */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#2C2C2C]">Page Sections</h3>
          <button 
            className="bg-[#5B6E02] hover:bg-[#4A5A01] text-white p-2 rounded-lg transition-colors" 
            aria-label="Add new section"
            onClick={() => addSection('hero')}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-2 mb-4">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                selectedSection === section.id
                  ? 'border-[#5B6E02] bg-[#F7F2EC]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedSection(section.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm text-[#2C2C2C]">{section.title}</div>
                  <div className="text-xs text-gray-500 capitalize">{section.type}</div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'up'); }}
                    disabled={index === 0}
                    className="p-1 text-gray-500 hover:text-[#5B6E02] disabled:opacity-30"
                    aria-label="Move section up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'down'); }}
                    disabled={index === sections.length - 1}
                    className="p-1 text-gray-500 hover:text-[#5B6E02] disabled:opacity-30"
                    aria-label="Move section down"
                  >
                    ↓
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); duplicateSection(section.id); }}
                    className="p-1 text-gray-500 hover:text-[#5B6E02]"
                    aria-label="Duplicate section"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }}
                    className="p-1 text-red-500 hover:text-red-700"
                    aria-label="Delete section"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-[#2C2C2C] mb-3">Add New Section</h4>
          <div className="grid grid-cols-2 gap-2">
            {['hero', 'products', 'about', 'contact', 'testimonials', 'gallery'].map((type) => (
              <button
                key={type}
                onClick={() => addSection(type as Section['type'])}
                className="p-2 text-xs bg-gray-100 hover:bg-[#5B6E02] hover:text-white rounded-lg transition-colors capitalize"
                aria-label={`Add ${type} section`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Center - Section Editor */}
      <div className="lg:col-span-2">
        {selectedSection ? (
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#2C2C2C]">Edit Section</h3>
              <div className="flex gap-2">
                <button 
                  className="bg-[#8B4513] hover:bg-[#A0522D] text-white px-4 py-2 rounded-lg transition-colors border-2 border-black shadow-md hover:shadow-lg" 
                  aria-label="Save section changes"
                  onClick={saveChanges}
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>

            {(() => {
              const section = sections.find(s => s.id === selectedSection);
              if (!section) return null;

              return (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="section-title" className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                    <input
                      id="section-title"
                      type="text"
                      value={section.title}
                      onChange={(e) => updateSection(section.id, { title: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#5B6E02] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="section-content" className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                    <textarea
                      id="section-content"
                      value={section.content}
                      onChange={(e) => updateSection(section.id, { content: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#5B6E02] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="bg-color" className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                      <input
                        id="bg-color"
                        type="color"
                        value={section.settings.backgroundColor}
                        onChange={(e) => updateSection(section.id, {
                          settings: { ...section.settings, backgroundColor: e.target.value }
                        })}
                        className="w-full h-10 border-2 border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label htmlFor="text-color" className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                      <input
                        id="text-color"
                        type="color"
                        value={section.settings.textColor}
                        onChange={(e) => updateSection(section.id, {
                          settings: { ...section.settings, textColor: e.target.value }
                        })}
                        className="w-full h-10 border-2 border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="padding-select" className="block text-sm font-medium text-gray-700 mb-2">Padding</label>
                      <select
                        id="padding-select"
                        value={section.settings.padding}
                        onChange={(e) => updateSection(section.id, {
                          settings: { ...section.settings, padding: e.target.value }
                        })}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#5B6E02] focus:outline-none"
                      >
                        <option value="py-4">Small</option>
                        <option value="py-8">Medium</option>
                        <option value="py-12">Large</option>
                        <option value="py-16">Extra Large</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="margin-select" className="block text-sm font-medium text-gray-700 mb-2">Margin</label>
                      <select
                        id="margin-select"
                        value={section.settings.margin}
                        onChange={(e) => updateSection(section.id, {
                          settings: { ...section.settings, margin: e.target.value }
                        })}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#5B6E02] focus:outline-none"
                      >
                        <option value="mb-4">Small</option>
                        <option value="mb-6">Medium</option>
                        <option value="mb-8">Large</option>
                        <option value="mb-12">Extra Large</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-12 text-center">
            <Layout className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Section to Edit</h3>
            <p className="text-gray-500">Choose a section from the left sidebar to start editing your storefront.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-[#2C2C2C]">Storefront Preview</h3>
        <div className="flex gap-2">
          <Link href="/store/artisan-bakes-atlanta">
            <button className="bg-[#5B6E02] hover:bg-[#4A5A01] text-white px-4 py-2 rounded-lg transition-colors" aria-label="Live preview">
              <Eye className="w-4 h-4" />
              Live Preview
            </button>
          </Link>
          <button 
            className="bg-[#8B4513] hover:bg-[#A0522D] text-white px-4 py-2 rounded-lg transition-colors border-2 border-black shadow-md hover:shadow-lg" 
            aria-label="Publish site"
            onClick={saveChanges}
          >
            Publish
          </button>
        </div>
      </div>

      <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
        {/* Preview Header */}
        <div className="bg-[#5B6E02] text-white p-4 text-center">
          <h1 className="text-2xl font-bold">{siteSettings.siteName}</h1>
          <p className="text-white/80">{siteSettings.tagline}</p>
        </div>

        {/* Preview Content */}
        <div className="p-0">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`${section.settings.padding} ${section.settings.margin}`}
              style={{
                backgroundColor: section.settings.backgroundColor,
                color: section.settings.textColor
              }}
            >
              <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                <p className="text-lg leading-relaxed">{section.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
      <h3 className="text-xl font-semibold text-[#2C2C2C] mb-6">Site Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="site-name" className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
          <input
            id="site-name"
            type="text"
            value={siteSettings.siteName}
            onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#5B6E02] focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
          <input
            id="tagline"
            type="text"
            value={siteSettings.tagline}
            onChange={(e) => setSiteSettings({ ...siteSettings, tagline: e.target.value })}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#5B6E02] focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="primary-color" className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
          <input
            id="primary-color"
            type="color"
            value={siteSettings.primaryColor}
            onChange={(e) => setSiteSettings({ ...siteSettings, primaryColor: e.target.value })}
            className="w-full h-10 border-2 border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label htmlFor="secondary-color" className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
          <input
            id="secondary-color"
            type="color"
            value={siteSettings.primaryColor}
            onChange={(e) => setSiteSettings({ ...siteSettings, secondaryColor: e.target.value })}
            className="w-full h-10 border-2 border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label htmlFor="font-family" className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
          <select
            id="font-family"
            value={siteSettings.fontFamily}
            onChange={(e) => setSiteSettings({ ...siteSettings, fontFamily: e.target.value })}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#5B6E02] focus:outline-none"
          >
            <option value="Inter">Inter</option>
            <option value="Roboto">Roboto</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Lato">Lato</option>
            <option value="Poppins">Poppins</option>
          </select>
        </div>

        <div>
          <label htmlFor="logo-url" className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
          <input
            id="logo-url"
            type="text"
            value={siteSettings.logo}
            onChange={(e) => setSiteSettings({ ...siteSettings, logo: e.target.value })}
            placeholder="https://example.com/logo.png"
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#5B6E02] focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button 
          className="bg-[#5B6E02] hover:bg-[#4A5A01] text-white px-6 py-2 rounded-lg transition-colors" 
          aria-label="Save site settings"
          onClick={saveChanges}
        >
          <Save className="w-4 h-4 inline mr-2" />
          Save Settings
        </button>
        <button 
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg transition-colors" 
          aria-label="Reset settings to defaults"
          onClick={() => {
            setSiteSettings(initialSiteSettings);
            setSections(initialSections);
            setHasChanges(true);
          }}
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );

  return (
    <VendorDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <button className="p-2 text-gray-600 hover:text-[#5B6E02] transition-colors" aria-label="Go back to dashboard">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-[#2C2C2C]">Site Editor</h1>
              <p className="text-gray-600 mt-2">Create and customize your storefront from scratch</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              className="bg-[#8B4513] hover:bg-[#A0522D] text-white px-6 py-3 rounded-lg transition-colors border-2 border-black shadow-md hover:shadow-lg" 
              aria-label="Save all changes"
              onClick={saveChanges}
            >
              <Save className="w-4 h-4 inline mr-2" />
              {hasChanges ? 'Save All Changes*' : 'Save All Changes'}
            </button>
            <Link href="/store/artisan-bakes-atlanta">
              <button className="bg-[#5B6E02] hover:bg-[#4A5A01] text-white px-6 py-3 rounded-lg transition-colors" aria-label="Publish site">
                <Eye className="w-4 h-4 inline mr-2" />
                Publish Site
              </button>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-2">
          <div className="flex space-x-1">
            {[
              { id: 'editor', label: 'Editor', icon: Layout },
              { id: 'preview', label: 'Preview', icon: Eye },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#5B6E02] text-white'
                      : 'text-gray-600 hover:text-[#5B6E02] hover:bg-gray-50'
                  }`}
                  aria-label={`Switch to ${tab.label} tab`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'editor' && renderEditor()}
        {activeTab === 'preview' && renderPreview()}
        {activeTab === 'settings' && renderSettings()}
      </div>
    </VendorDashboardLayout>
  );
};

export default SiteEditorPage;
