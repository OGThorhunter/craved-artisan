import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  Package, 
  ShoppingCart,
  X,
  RefreshCw,
  TrendingUp
} from 'lucide-react';

interface AlertItem {
  id: string;
  type: 'low_stock' | 'expiring_soon' | 'expired';
  message: string;
  count: number;
  severity: 'high' | 'medium' | 'low';
  action?: string;
  onClick?: () => void;
}

interface InventoryAlertBarProps {
  alerts: AlertItem[];
  onDismiss?: (alertId: string) => void;
  onRefresh?: () => void;
  onCreateShoppingList?: () => void;
  className?: string;
}

export default function InventoryAlertBar({ 
  alerts, 
  onDismiss, 
  onRefresh,
  onCreateShoppingList,
  className = '' 
}: InventoryAlertBarProps) {
  if (alerts.length === 0) {
    return null;
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
        return <Package className="w-4 h-4" />;
      case 'expiring_soon':
        return <Clock className="w-4 h-4" />;
      case 'expired':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'low':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getAlertIconColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-600';
      case 'low':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const totalAlerts = alerts.reduce((sum, alert) => sum + alert.count, 0);
  const highSeverityAlerts = alerts.filter(alert => alert.severity === 'high').length;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm mb-6 ${className}`}>
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-5 h-5 ${highSeverityAlerts > 0 ? 'text-red-600' : 'text-orange-600'}`} />
              <h3 className="text-lg font-semibold text-gray-900">
                Inventory Alerts
              </h3>
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                highSeverityAlerts > 0 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-orange-100 text-orange-700'
              }`}>
                {totalAlerts} items need attention
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onCreateShoppingList && (
              <button
                onClick={onCreateShoppingList}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm font-medium"
              >
                <ShoppingCart className="w-4 h-4" />
                Create Shopping List
              </button>
            )}
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                title="Refresh alerts"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${getAlertColor(alert.severity)}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-full ${getAlertColor(alert.severity)}`}>
                  <div className={getAlertIconColor(alert.severity)}>
                    {getAlertIcon(alert.type)}
                  </div>
                </div>
                <div>
                  <p className="font-medium text-sm">{alert.message}</p>
                  <p className="text-xs opacity-75">
                    {alert.count} item{alert.count !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {alert.action && alert.onClick && (
                  <button
                    onClick={alert.onClick}
                    className="text-xs font-medium hover:underline"
                  >
                    {alert.action}
                  </button>
                )}
                {onDismiss && (
                  <button
                    onClick={() => onDismiss(alert.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Dismiss alert"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {alerts.length > 3 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Showing {alerts.length} alert categories. 
              <button className="text-blue-600 hover:underline ml-1">
                View all alerts
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}



