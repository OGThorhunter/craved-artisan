"use client";

import { useState, useRef } from "react";
import { 
  Download, Eye, Settings, Star, TrendingUp, MapPin, Users, Package, 
  Image as ImageIcon, Trophy, Sparkles, ExternalLink, Copy, Target, Award, 
  Globe, Building2, Users2, BarChart3, Zap, Shield, Lightbulb, ArrowRight,
  CheckCircle, DollarSign, Clock, TrendingDown, Award as AwardIcon, Briefcase,
  Heart, ArrowUpRight, Building, Factory, Truck, Store, Coffee, Palette,
  Wrench, Leaf, Zap as ZapIcon, Target as TargetIcon, Users as UsersIcon
} from "lucide-react";

// Strategic Business Portfolio Data
const strategicPortfolioData = {
  companyName: "Artisan Ventures Group",
  tagline: "Where Innovation Meets Tradition in Every Venture",
  founded: "2018",
  headquarters: "Atlanta, GA",
  industry: "Multi-Industry Holding Company",
  mission: "To build, acquire, and scale businesses that create lasting value through innovation, quality, and sustainable growth.",
  vision: "To be the leading multi-industry company known for transforming traditional sectors with modern solutions.",
  
  // Company Overview
  overview: {
    description: "Artisan Ventures Group is a diversified holding company that strategically invests in and operates businesses across multiple sectors. We combine deep industry expertise with innovative approaches to create sustainable competitive advantages.",
    keyMetrics: {
      totalRevenue: "$47.2M",
      annualGrowth: "23.4%",
      employees: "1,247",
      locations: "18",
      portfolioCompanies: "12",
      marketCap: "$89.5M"
    },
    coreValues: [
      "Innovation Excellence",
      "Quality Obsession", 
      "Sustainable Growth",
      "Customer Centricity",
      "Operational Excellence"
    ]
  },

  // Strategic Business Units
  businessUnits: [
    {
      name: "Artisan Foods Division",
      description: "Premium food manufacturing and distribution",
      revenue: "$18.7M",
      growth: "31.2%",
      marketShare: "8.4%",
      keyProducts: ["Artisan Breads", "Gourmet Pastries", "Organic Ingredients"],
      competitiveAdvantage: "Proprietary recipes, local sourcing, artisanal craftsmanship",
      achievements: ["Top 3 Regional Baker", "Organic Certification", "Zero Waste Initiative"]
    },
    {
      name: "Tech Solutions Group",
      description: "Enterprise software and digital transformation",
      revenue: "$12.3M", 
      growth: "45.7%",
      marketShare: "3.2%",
      keyProducts: ["ERP Systems", "AI Analytics", "Cloud Infrastructure"],
      competitiveAdvantage: "AI-first approach, rapid deployment, 24/7 support",
      achievements: ["Microsoft Partner", "ISO 27001 Certified", "99.9% Uptime"]
    },
    {
      name: "Manufacturing Excellence",
      description: "Advanced manufacturing and automation",
      revenue: "$9.8M",
      growth: "18.9%", 
      marketShare: "5.1%",
      keyProducts: ["Custom Machinery", "Automation Systems", "Quality Control"],
      competitiveAdvantage: "Lean manufacturing, Industry 4.0, rapid prototyping",
      achievements: ["ISO 9001", "Lean Six Sigma", "Innovation Award"]
    },
    {
      name: "Retail Ventures",
      description: "Omnichannel retail and e-commerce",
      revenue: "$6.4M",
      growth: "28.3%",
      marketShare: "2.8%",
      keyProducts: ["Brick & Mortar", "Online Store", "Mobile App"],
      competitiveAdvantage: "Seamless omnichannel, personalized experience, data-driven",
      achievements: ["Best Retail Experience", "Mobile App Award", "Customer Choice"]
    }
  ],

  // Strategic Initiatives
  strategicInitiatives: [
    {
      name: "Digital Transformation 2025",
      description: "Complete digital overhaul across all business units",
      investment: "$12M",
      timeline: "18 months",
      expectedROI: "34%",
      status: "In Progress",
      milestones: ["Phase 1 Complete", "Phase 2 60%", "Phase 3 Planning"]
    },
    {
      name: "Market Expansion",
      description: "Geographic expansion into 5 new states",
      investment: "$8.5M",
      timeline: "24 months", 
      expectedROI: "28%",
      status: "Planning",
      milestones: ["Market Research", "Site Selection", "Regulatory Approval"]
    },
    {
      name: "Sustainability Initiative",
      description: "Carbon neutral operations by 2026",
      investment: "$6.2M",
      timeline: "36 months",
      expectedROI: "22%",
      status: "Research",
      milestones: ["Carbon Audit", "Technology Selection", "Implementation"]
    }
  ],

  // Competitive Advantages
  competitiveAdvantages: [
    {
      category: "Operational Excellence",
      advantages: [
        "Lean Six Sigma methodology across all operations",
        "Advanced analytics and predictive maintenance",
        "Continuous improvement culture with 15% annual efficiency gains"
      ]
    },
    {
      category: "Innovation Leadership", 
      advantages: [
        "R&D investment of 8.2% of revenue",
        "15 patents filed in the last 3 years",
        "Partnerships with 3 leading universities"
      ]
    },
    {
      category: "Market Position",
      advantages: [
        "Strong brand recognition in target markets",
        "Diversified revenue streams reducing risk",
        "Strategic partnerships with industry leaders"
      ]
    },
    {
      category: "Financial Strength",
      advantages: [
        "Strong balance sheet with 2.8x debt-to-equity ratio",
        "Consistent cash flow generation",
        "Access to $50M credit facility"
      ]
    }
  ],

  // Financial Performance
  financials: {
    revenue: {
      current: 47.2,
      previous: 38.2,
      growth: 23.4
    },
    profit: {
      current: 8.9,
      previous: 6.8,
      growth: 30.9
    },
    ebitda: {
      current: 12.4,
      previous: 9.6,
      growth: 29.2
    },
    cashFlow: {
      current: 15.2,
      previous: 11.8,
      growth: 28.8
    }
  },

  // Customer Success Stories
  customerSuccess: [
    {
      company: "Metro Foods Inc.",
      industry: "Food Distribution",
      challenge: "Needed to scale production by 300% while maintaining quality",
      solution: "Custom automation system with AI quality control",
      results: "Production increased 350%, quality improved 15%, ROI in 14 months"
    },
    {
      company: "TechStart Solutions",
      industry: "Software Development", 
      challenge: "Legacy system causing 40% downtime",
      solution: "Cloud-native ERP with real-time analytics",
      results: "99.9% uptime, 60% faster operations, $2.1M annual savings"
    },
    {
      company: "Green Manufacturing Co.",
      industry: "Industrial Manufacturing",
      challenge: "High energy costs and carbon footprint",
      solution: "Smart manufacturing with renewable energy integration",
      results: "Energy costs reduced 35%, carbon footprint down 42%"
    }
  ],

  // Awards & Recognition
  awards: [
    { title: "Best Company to Work For", year: "2024", organization: "Business Journal" },
    { title: "Innovation Excellence Award", year: "2024", organization: "Industry Association" },
    { title: "Sustainability Champion", year: "2023", organization: "Green Business Council" },
    { title: "Growth Company of the Year", year: "2023", organization: "Chamber of Commerce" },
    { title: "Customer Service Excellence", year: "2023", organization: "Customer Experience Institute" }
  ],

  // Future Strategy
  futureStrategy: {
    vision2027: "Become a $100M company with presence in 25+ states",
    keyPillars: [
      "Digital-First Operations",
      "Sustainable Growth",
      "Market Leadership",
      "Innovation Excellence"
    ],
    growthTargets: {
      revenue: "100M+",
      employees: "2,500+",
      locations: "25+",
      marketShare: "15%+"
    }
  }
};

export function PortfolioBuilder() {
  const [showSettings, setShowSettings] = useState(false);
  const [selectedSection, setSelectedSection] = useState("overview");
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const portfolioRef = useRef<HTMLDivElement>(null);

  const sections = [
    { id: "overview", name: "Company Overview", icon: Building2 },
    { id: "businessUnits", name: "Business Units", icon: Briefcase },
    { id: "strategy", name: "Strategic Initiatives", icon: Target },
    { id: "advantages", name: "Competitive Advantages", icon: Shield },
    { id: "financials", name: "Financial Performance", icon: BarChart3 },
    { id: "customers", name: "Customer Success", icon: Users2 },
    { id: "awards", name: "Awards & Recognition", icon: Trophy },
    { id: "future", name: "Future Strategy", icon: ArrowUpRight }
  ];

  const handleExportPDF = async () => {
    try {
      console.log("Exporting strategic portfolio PDF...");
      alert("Strategic portfolio PDF export would be implemented with html2canvas or react-pdf");
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    }
  };

  const handlePreview = () => {
    // For internal use - could open in a new tab for better viewing
    window.open('#', '_blank');
  };

  return (
    <div className="bg-[#F7F2EC] rounded-2xl p-6 shadow-xl mt-6 max-w-7xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-[#5B6E02] mb-2">
          {strategicPortfolioData.companyName}
        </h1>
        <p className="text-xl text-gray-600 mb-4">{strategicPortfolioData.tagline}</p>
        <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
          <span>Founded {strategicPortfolioData.founded}</span>
          <span>•</span>
          <span>{strategicPortfolioData.headquarters}</span>
          <span>•</span>
          <span>{strategicPortfolioData.industry}</span>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Target size={20} className="text-blue-600" />
            Our Mission
          </h3>
          <p className="text-gray-700">{strategicPortfolioData.mission}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Eye size={20} className="text-purple-600" />
            Our Vision
          </h3>
          <p className="text-gray-700">{strategicPortfolioData.vision}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setSelectedSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                selectedSection === section.id
                  ? "bg-[#5B6E02] text-white border-transparent"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon size={16} />
              {section.name}
            </button>
          );
        })}
      </div>

      {/* Content Sections */}
      <div ref={portfolioRef} className="bg-white rounded-xl p-6 border shadow-sm">
        {/* Company Overview */}
        {selectedSection === "overview" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Building2 size={28} className="text-[#5B6E02]" />
              Company Overview
            </h2>
            
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              {strategicPortfolioData.overview.description}
            </p>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
              {Object.entries(strategicPortfolioData.overview.keyMetrics).map(([key, value]) => (
                <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-[#5B6E02]">{value}</p>
                  <p className="text-sm text-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                </div>
              ))}
            </div>

            {/* Core Values */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Core Values</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {strategicPortfolioData.overview.coreValues.map((value, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle size={20} className="text-blue-600" />
                    <span className="font-medium text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Business Units */}
        {selectedSection === "businessUnits" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Briefcase size={28} className="text-[#5B6E02]" />
              Strategic Business Units
            </h2>
            
            <div className="space-y-6">
              {strategicPortfolioData.businessUnits.map((unit, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-6 hover:border-[#5B6E02] transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{unit.name}</h3>
                      <p className="text-gray-600 mb-3">{unit.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#5B6E02]">{unit.revenue}</p>
                      <p className="text-sm text-green-600">+{unit.growth}% growth</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Market Share</p>
                      <p className="font-semibold text-gray-800">{unit.marketShare}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Key Products</p>
                      <p className="font-semibold text-gray-800">{unit.keyProducts.join(", ")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Competitive Edge</p>
                      <p className="font-semibold text-gray-800">{unit.competitiveAdvantage}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Key Achievements:</p>
                    <div className="flex flex-wrap gap-2">
                      {unit.achievements.map((achievement, aIdx) => (
                        <span key={aIdx} className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {achievement}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strategic Initiatives */}
        {selectedSection === "strategy" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Target size={28} className="text-[#5B6E02]" />
              Strategic Initiatives
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {strategicPortfolioData.strategicInitiatives.map((initiative, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">{initiative.name}</h3>
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      initiative.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                      initiative.status === "Planning" ? "bg-yellow-100 text-yellow-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {initiative.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{initiative.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Investment</p>
                      <p className="font-semibold text-gray-800">{initiative.investment}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Timeline</p>
                      <p className="font-semibold text-gray-800">{initiative.timeline}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Expected ROI</p>
                      <p className="font-semibold text-green-600">{initiative.expectedROI}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Milestones:</p>
                    <div className="space-y-2">
                      {initiative.milestones.map((milestone, mIdx) => (
                        <div key={mIdx} className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-600" />
                          <span className="text-sm text-gray-700">{milestone}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Competitive Advantages */}
        {selectedSection === "advantages" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Shield size={28} className="text-[#5B6E02]" />
              Competitive Advantages
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {strategicPortfolioData.competitiveAdvantages.map((category, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Zap size={20} className="text-yellow-600" />
                    {category.category}
                  </h3>
                  
                  <ul className="space-y-3">
                    {category.advantages.map((advantage, aIdx) => (
                      <li key={aIdx} className="flex items-start gap-3">
                        <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{advantage}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Financial Performance */}
        {selectedSection === "financials" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <BarChart3 size={28} className="text-[#5B6E02]" />
              Financial Performance
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {Object.entries(strategicPortfolioData.financials).map(([metric, data]) => (
                <div key={metric} className="text-center p-6 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-[#5B6E02]">${data.current}M</p>
                  <p className="text-sm text-gray-600 capitalize mb-2">
                    {metric.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp size={16} className="text-green-600" />
                    <span className="text-sm font-medium text-green-600">+{data.growth}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Financial Highlights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-600">Revenue Growth:</span>
                  <p className="font-semibold text-blue-800">23.4% YoY</p>
                </div>
                <div>
                  <span className="text-blue-600">Profit Margin:</span>
                  <p className="font-semibold text-blue-800">18.9%</p>
                </div>
                <div>
                  <span className="text-blue-600">EBITDA Margin:</span>
                  <p className="font-semibold text-blue-800">26.3%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customer Success */}
        {selectedSection === "customers" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Users2 size={28} className="text-[#5B6E02]" />
              Customer Success Stories
            </h2>
            
            <div className="space-y-6">
              {strategicPortfolioData.customerSuccess.map((story, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{story.company}</h3>
                      <p className="text-gray-600">{story.industry}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      Success Story
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Target size={16} className="text-red-600" />
                        Challenge
                      </h4>
                      <p className="text-gray-700 text-sm">{story.challenge}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Lightbulb size={16} className="text-yellow-600" />
                        Solution
                      </h4>
                      <p className="text-gray-700 text-sm">{story.solution}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Trophy size={16} className="text-green-600" />
                        Results
                      </h4>
                      <p className="text-gray-700 text-sm">{story.results}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Awards & Recognition */}
        {selectedSection === "awards" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Trophy size={28} className="text-[#5B6E02]" />
              Awards & Recognition
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {strategicPortfolioData.awards.map((award, idx) => (
                <div key={idx} className="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <AwardIcon size={48} className="text-yellow-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{award.title}</h3>
                  <p className="text-gray-600 mb-1">{award.year}</p>
                  <p className="text-sm text-gray-500">{award.organization}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Future Strategy */}
        {selectedSection === "future" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <ArrowUpRight size={28} className="text-[#5B6E02]" />
              Future Strategy & Vision 2027
            </h2>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-lg border border-blue-200 mb-8">
              <h3 className="text-2xl font-bold text-blue-800 mb-4 text-center">
                {strategicPortfolioData.futureStrategy.vision2027}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {strategicPortfolioData.futureStrategy.keyPillars.map((pillar, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-white rounded-lg border border-blue-200">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="font-semibold text-gray-800">{pillar}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(strategicPortfolioData.futureStrategy.growthTargets).map(([metric, target]) => (
                  <div key={metric} className="text-center p-4 bg-white rounded-lg border border-blue-200">
                    <p className="text-2xl font-bold text-blue-600">{target}</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {metric.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <p className="text-lg text-gray-700 mb-4">
                Ready to partner with companies that share our vision for innovation and sustainable growth.
              </p>
              <button className="px-8 py-3 bg-[#5B6E02] text-white rounded-lg hover:bg-[#4A5A01] transition-colors">
                Let's Discuss Partnership
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t">
        <div className="text-sm text-gray-600">
          Strategic business portfolio demonstrating comprehensive company capabilities
        </div>
                 <div className="flex gap-3">
           <button
             onClick={handleExportPDF}
             className="flex items-center gap-2 px-6 py-3 bg-[#5B6E02] text-white rounded-lg hover:bg-[#4A5A01] transition-colors"
           >
             <Download size={18} />
             Export to PDF
           </button>
         </div>
      </div>
    </div>
  );
} 