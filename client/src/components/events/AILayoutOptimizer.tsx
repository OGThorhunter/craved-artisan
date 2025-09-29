import React, { useState } from 'react';
import { Brain, Lightbulb, ArrowRight, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface LayoutSuggestion {
  id: string;
  type: 'optimization' | 'warning' | 'improvement';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'traffic' | 'accessibility' | 'efficiency' | 'safety' | 'revenue';
  action?: string;
  estimatedBenefit?: string;
}

interface AILayoutOptimizerProps {
  stallStatus: Record<number, { status: string; zone: string; size: string }>;
  vendorAssignments: Record<number, { type: string; name: string; size: string }>;
  gridRows: number;
  gridColumns: number;
  onApplySuggestion?: (suggestion: LayoutSuggestion) => void;
}

export function AILayoutOptimizer({
  stallStatus,
  vendorAssignments,
  gridRows,
  gridColumns,
  onApplySuggestion
}: AILayoutOptimizerProps) {
  const [suggestions, setSuggestions] = useState<LayoutSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);

  const analyzeLayout = () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const newSuggestions = generateLayoutSuggestions(stallStatus, vendorAssignments, gridRows, gridColumns);
      setSuggestions(newSuggestions);
      setLastAnalyzed(new Date());
      setIsAnalyzing(false);
    }, 2000);
  };

  const generateLayoutSuggestions = (
    stalls: Record<number, { status: string; zone: string; size: string }>,
    vendors: Record<number, { type: string; name: string; size: string }>,
    rows: number,
    cols: number
  ): LayoutSuggestion[] => {
    const suggestions: LayoutSuggestion[] = [];
    const soldStalls = Object.keys(stalls).filter(index => stalls[parseInt(index)]?.status === 'stall');
    const totalStalls = rows * cols;
    const occupancyRate = soldStalls.length / totalStalls;

    // Analyze occupancy rate
    if (occupancyRate < 0.6) {
      suggestions.push({
        id: 'low-occupancy',
        type: 'warning',
        title: 'Low Occupancy Rate',
        description: `Only ${Math.round(occupancyRate * 100)}% of stalls are occupied. Consider adjusting pricing or adding more vendor types.`,
        impact: 'high',
        category: 'revenue',
        action: 'Adjust pricing strategy',
        estimatedBenefit: 'Potential 25% revenue increase'
      });
    }

    // Analyze vendor type distribution
    const vendorTypes = Object.values(vendors).reduce((acc, vendor) => {
      acc[vendor.type] = (acc[vendor.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const maxType = Object.keys(vendorTypes).reduce((a, b) => vendorTypes[a] > vendorTypes[b] ? a : b, '');
    const maxCount = vendorTypes[maxType] || 0;
    const totalVendors = Object.keys(vendors).length;

    if (totalVendors > 0 && maxCount / totalVendors > 0.6) {
      suggestions.push({
        id: 'vendor-diversity',
        type: 'improvement',
        title: 'Improve Vendor Diversity',
        description: `${maxType} vendors represent ${Math.round((maxCount / totalVendors) * 100)}% of all vendors. More diversity could attract different customer segments.`,
        impact: 'medium',
        category: 'revenue',
        action: 'Recruit different vendor types',
        estimatedBenefit: '15% more customer variety'
      });
    }

    // Analyze traffic flow
    const exits = Object.keys(stalls).filter(index => stalls[parseInt(index)]?.status === 'exit');
    const walkingPaths = Object.keys(stalls).filter(index => stalls[parseInt(index)]?.status === 'walking-path');

    if (exits.length === 0) {
      suggestions.push({
        id: 'missing-exits',
        type: 'warning',
        title: 'Missing Exit Points',
        description: 'No exit points found in the layout. This could cause safety and traffic flow issues.',
        impact: 'high',
        category: 'safety',
        action: 'Add exit points',
        estimatedBenefit: 'Improved safety compliance'
      });
    }

    if (walkingPaths.length === 0 && soldStalls.length > 10) {
      suggestions.push({
        id: 'traffic-flow',
        type: 'optimization',
        title: 'Optimize Traffic Flow',
        description: 'With many vendors, consider adding walking paths to improve customer flow and reduce congestion.',
        impact: 'medium',
        category: 'traffic',
        action: 'Add walking paths',
        estimatedBenefit: '20% better customer flow'
      });
    }

    // Analyze zone distribution
    const zoneDistribution = Object.values(stalls).reduce((acc, stall) => {
      if (stall.status === 'stall') {
        acc[stall.zone] = (acc[stall.zone] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const zones = Object.keys(zoneDistribution);
    if (zones.length > 1) {
      const zoneCounts = Object.values(zoneDistribution);
      const maxZone = Math.max(...zoneCounts);
      const minZone = Math.min(...zoneCounts);
      const imbalance = (maxZone - minZone) / maxZone;

      if (imbalance > 0.4) {
        suggestions.push({
          id: 'zone-balance',
          type: 'optimization',
          title: 'Balance Zone Distribution',
          description: 'Some zones have significantly more vendors than others. Balancing could improve overall customer experience.',
          impact: 'medium',
          category: 'efficiency',
          action: 'Redistribute vendors',
          estimatedBenefit: 'More even customer distribution'
        });
      }
    }

    // Analyze accessibility
    const accessibleStalls = Object.values(stalls).filter(stall => 
      stall.status === 'stall' && (stall.size === '15x15' || stall.size === '20x20')
    ).length;

    if (accessibleStalls === 0 && soldStalls.length > 5) {
      suggestions.push({
        id: 'accessibility',
        type: 'improvement',
        title: 'Add Accessible Stalls',
        description: 'Consider adding larger stalls for vendors who may need more space or have accessibility requirements.',
        impact: 'low',
        category: 'accessibility',
        action: 'Add larger stall options',
        estimatedBenefit: 'Better vendor inclusion'
      });
    }

    return suggestions;
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'optimization': return <ArrowRight className="w-4 h-4 text-blue-600" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'improvement': return <Lightbulb className="w-4 h-4 text-yellow-600" />;
      default: return <Brain className="w-4 h-4 text-purple-600" />;
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'optimization': return 'bg-blue-50 border-blue-200';
      case 'warning': return 'bg-red-50 border-red-200';
      case 'improvement': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-purple-50 border-purple-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApplySuggestion = (suggestion: LayoutSuggestion) => {
    onApplySuggestion?.(suggestion);
    
    // Remove the applied suggestion
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <h4 className="text-lg font-semibold text-gray-900">AI Layout Optimizer</h4>
        </div>
        <button
          onClick={analyzeLayout}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analyzing...' : 'Analyze Layout'}
        </button>
      </div>

      {lastAnalyzed && (
        <p className="text-sm text-gray-500 mb-4">
          Last analyzed: {lastAnalyzed.toLocaleTimeString()}
        </p>
      )}

      {suggestions.length === 0 && !isAnalyzing ? (
        <div className="text-center py-8">
          <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Click "Analyze Layout" to get AI-powered optimization suggestions</p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className={`p-4 rounded-lg border ${getSuggestionColor(suggestion.type)}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  {getSuggestionIcon(suggestion.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold text-gray-900">{suggestion.title}</h5>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(suggestion.impact)}`}>
                        {suggestion.impact} impact
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{suggestion.description}</p>
                    {suggestion.estimatedBenefit && (
                      <p className="text-xs text-gray-600">
                        <strong>Estimated benefit:</strong> {suggestion.estimatedBenefit}
                      </p>
                    )}
                  </div>
                </div>
                {suggestion.action && (
                  <button
                    onClick={() => handleApplySuggestion(suggestion)}
                    className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Apply
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isAnalyzing && (
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600">AI is analyzing your layout...</p>
          <p className="text-sm text-gray-500">Looking for optimization opportunities</p>
        </div>
      )}
    </div>
  );
}
