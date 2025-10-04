import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Clock, TrendingUp, Calendar, Package, ShoppingCart, Eye, EyeOff, Plus, Minus } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { toast } from 'react-hot-toast';

interface AIInsightsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  insights: any;
  isLoading: boolean;
}

const AIInsightsDrawer: React.FC<AIInsightsDrawerProps> = ({
  isOpen,
  onClose,
  insights,
  isLoading
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleCreatePO = (item: any) => {
    toast.success(`Creating purchase order for ${item.name}`);
    // TODO: Implement PO creation
  };

  const handleAddToB2B = (item: any) => {
    toast.success(`Adding ${item.name} to B2B cart`);
    // TODO: Implement B2B cart
  };

  const handleSnooze = (item: any) => {
    toast.success(`Snoozing alert for ${item.name} for 7 days`);
    // TODO: Implement snooze functionality
  };

  const handleStartWatch = (item: any) => {
    toast.success(`Starting price watch for ${item.name}`);
    // TODO: Implement price watch
  };

  const handleStopWatch = (item: any) => {
    toast.success(`Stopping price watch for ${item.name}`);
    // TODO: Implement stop price watch
  };

  const handleOpenOffer = (item: any) => {
    toast.success(`Opening offer for ${item.name}`);
    // TODO: Implement offer opening
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-hidden"
    >
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Insights</h2>
              <p className="text-sm text-gray-600">Smart recommendations for your inventory</p>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X size={20} />
            </Button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <Tabs defaultValue="restock" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="restock" className="flex items-center gap-2">
                    <AlertTriangle size={16} />
                    Restock
                  </TabsTrigger>
                  <TabsTrigger value="prices" className="flex items-center gap-2">
                    <TrendingUp size={16} />
                    Prices
                  </TabsTrigger>
                  <TabsTrigger value="seasonal" className="flex items-center gap-2">
                    <Calendar size={16} />
                    Seasonal
                  </TabsTrigger>
                  <TabsTrigger value="commitments" className="flex items-center gap-2">
                    <Package size={16} />
                    Commitments
                  </TabsTrigger>
                </TabsList>
                
                {/* Restock Alerts */}
                <TabsContent value="restock" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Restock Alerts</h3>
                    <Badge variant="destructive" className="text-xs">
                      {insights?.restockAlerts?.length || 0} items
                    </Badge>
                  </div>
                  
                  {insights?.restockAlerts?.length === 0 ? (
                    <Card className="p-6 text-center">
                      <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">All Good!</h4>
                      <p className="text-gray-600">No items need restocking at this time.</p>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {insights?.restockAlerts?.map((item: any) => (
                        <Card key={item.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                <Badge 
                                  variant={item.priority === 'CRITICAL' ? 'red' : 'yellow'} 
                                  className="text-xs px-2 py-1"
                                >
                                  {item.priority}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                                <div>
                                  <span className="font-medium">Current:</span> {item.current_qty} {item.unit}
                                </div>
                                <div>
                                  <span className="font-medium">Reorder Point:</span> {item.reorder_point} {item.unit}
                                </div>
                                <div>
                                  <span className="font-medium">Suggested:</span> {item.suggested_qty} {item.unit}
                                </div>
                                <div>
                                  <span className="font-medium">Avg Cost:</span> ${item.avg_cost.toFixed(2)}
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleCreatePO(item)}
                                  className="bg-brand-red hover:bg-brand-red/90"
                                >
                                  <Plus size={16} />
                                  Create PO
                                </Button>
                                <Button
                                  variant="secondary"
                                  onClick={() => handleAddToB2B(item)}
                                >
                                  <ShoppingCart size={16} />
                                  Add to B2B
                                </Button>
                                <Button
                                  className="text-xs px-2 py-1"
                                  variant="secondary"
                                  onClick={() => handleSnooze(item)}
                                >
                                  <Clock size={16} />
                                  Snooze
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                {/* Price Watch Hits */}
                <TabsContent value="prices" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Price Watch Hits</h3>
                    <Badge variant="default" className="text-xs">
                      {insights?.priceWatchHits?.length || 0} hits
                    </Badge>
                  </div>
                  
                  {insights?.priceWatchHits?.length === 0 ? (
                    <Card className="p-6 text-center">
                      <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">No Price Hits</h4>
                      <p className="text-gray-600">No price watch targets have been hit recently.</p>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {insights?.priceWatchHits?.map((item: any) => (
                        <Card key={item.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-gray-900">{item.inventoryItem.name}</h4>
                                <Badge variant="secondary" className="text-xs">
                                  {item.savings_pct.toFixed(1)}% savings
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                                <div>
                                  <span className="font-medium">Target:</span> ${item.target_unit_cost.toFixed(2)}
                                </div>
                                <div>
                                  <span className="font-medium">Current:</span> ${item.current_avg_cost.toFixed(2)}
                                </div>
                                <div>
                                  <span className="font-medium">Source:</span> {item.source}
                                </div>
                                <div>
                                  <span className="font-medium">Unit:</span> {item.inventoryItem.unit}
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleOpenOffer(item)}
                                  className="bg-brand-red hover:bg-brand-red/90"
                                >
                                  Open Offer
                                </Button>
                                <Button
                                  variant="secondary"
                                  onClick={() => handleStopWatch(item)}
                                >
                                  <EyeOff size={16} />
                                  Stop Watch
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                {/* Seasonal Forecasts */}
                <TabsContent value="seasonal" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Seasonal Forecasts</h3>
                    <Badge variant="secondary" className="text-xs">
                      Next 8 weeks
                    </Badge>
                  </div>
                  
                  {insights?.seasonalForecasts?.length === 0 ? (
                    <Card className="p-6 text-center">
                      <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">No Forecasts</h4>
                      <p className="text-gray-600">Insufficient data for seasonal forecasting.</p>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {insights?.seasonalForecasts?.slice(0, 4).map((forecast: any, index: number) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-gray-900">
                                  Week {forecast.week}
                                </h4>
                                <Badge variant="secondary" className="text-xs">
                                  {new Date(forecast.date).toLocaleDateString()}
                                </Badge>
                              </div>
                              
                              <div className="space-y-2">
                                {forecast.items?.slice(0, 3).map((item: any, itemIndex: number) => (
                                  <div key={itemIndex} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">{item.itemId}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{item.forecastedConsumption.toFixed(1)}</span>
                                      <Badge 
                                        variant={item.recommendation === 'PRE_BUY' ? 'yellow' : 'gray'} 
                                        className="text-xs px-2 py-1"
                                      >
                                        {item.recommendation}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                {/* Upcoming Commitments */}
                <TabsContent value="commitments" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Upcoming Commitments</h3>
                    <Badge variant="secondary" className="text-xs">
                      {insights?.upcomingCommitments?.length || 0} commitments
                    </Badge>
                  </div>
                  
                  {insights?.upcomingCommitments?.length === 0 ? (
                    <Card className="p-6 text-center">
                      <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">No Commitments</h4>
                      <p className="text-gray-600">No upcoming commitments in the next 14 days.</p>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {insights?.upcomingCommitments?.map((commitment: any, index: number) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-gray-900">{commitment.name}</h4>
                                <Badge variant="secondary" className="text-xs">
                                  {commitment.type}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                                <div>
                                  <span className="font-medium">Product:</span> {commitment.productName}
                                </div>
                                <div>
                                  <span className="font-medium">Material:</span> {commitment.materialName}
                                </div>
                                <div>
                                  <span className="font-medium">Required:</span> {commitment.requiredQty} {commitment.unit}
                                </div>
                                <div>
                                  <span className="font-medium">Date:</span> {new Date(commitment.date).toLocaleDateString()}
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  className="text-xs px-2 py-1"
                                  variant="secondary"
                                  onClick={() => toast.success('Opening commitment details')}
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AIInsightsDrawer;

