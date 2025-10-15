import React from 'react';
import { 
  Mail, Phone, MapPin, Calendar, Globe, Clock, Shield, UserCheck,
  AlertTriangle, TrendingUp, DollarSign, Package, CalendarDays
} from 'lucide-react';
import { Badge } from '../../../ui/Badge';
import Card from '../../../ui/Card';

interface OverviewTabProps {
  user: any;
  analytics: any;
}

export default function OverviewTab({ user, analytics }: OverviewTabProps) {
  const getRiskColor = (score: number) => {
    if (score <= 25) return 'text-green-600 bg-green-100';
    if (score <= 50) return 'text-yellow-600 bg-yellow-100';
    if (score <= 75) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };
  
  return (
    <div className="space-y-6">
      {/* Identity Section */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-[#2b2b2b] mb-4">Identity & Contact</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div className="font-medium text-gray-900">{user.email}</div>
              </div>
              {user.emailVerified && (
                <UserCheck className="w-4 h-4 text-green-600" title="Verified" />
              )}
            </div>
            
            {user.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div className="font-medium text-gray-900">{user.phone}</div>
                </div>
                {user.phoneVerified && (
                  <UserCheck className="w-4 h-4 text-green-600" title="Verified" />
                )}
              </div>
            )}
            
            {user.zip_code && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">ZIP Code</div>
                  <div className="font-medium text-gray-900">{user.zip_code}</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {user.locale && (
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Locale</div>
                  <div className="font-medium text-gray-900">{user.locale}</div>
                </div>
              </div>
            )}
            
            {user.timezone && (
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Timezone</div>
                  <div className="font-medium text-gray-900">{user.timezone}</div>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Created</div>
                <div className="font-medium text-gray-900">
                  {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Health Strip */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-[#2b2b2b] mb-4">Health & Risk</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Risk Score */}
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getRiskColor(user.riskScore)}`}>
              <span className="text-2xl font-bold">{user.riskScore}</span>
            </div>
            <div>
              <div className="text-sm text-gray-500">Risk Score</div>
              <div className="font-medium text-gray-900">
                {user.riskScore <= 25 ? 'Low' : user.riskScore <= 50 ? 'Medium' : user.riskScore <= 75 ? 'High' : 'Critical'}
              </div>
            </div>
          </div>
          
          {/* Risk Flags */}
          <div>
            <div className="text-sm text-gray-500 mb-2">Active Risk Flags</div>
            <div className="flex flex-wrap gap-1">
              {user.riskFlags && user.riskFlags.filter((f: any) => !f.resolvedAt).length > 0 ? (
                user.riskFlags
                  .filter((f: any) => !f.resolvedAt)
                  .map((flag: any) => (
                    <span
                      key={flag.id}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      {flag.code}
                    </span>
                  ))
              ) : (
                <span className="text-sm text-gray-400">No active flags</span>
              )}
            </div>
          </div>
          
          {/* Compliance Items */}
          <div>
            <div className="text-sm text-gray-500 mb-2">Open Compliance Items</div>
            <div className="space-y-1">
              {!user.emailVerified && (
                <div className="text-sm text-orange-600">• Email not verified</div>
              )}
              {!user.phoneVerified && (
                <div className="text-sm text-orange-600">• Phone not verified</div>
              )}
              {user.stripeAccount?.requirementsDue && JSON.parse(user.stripeAccount.requirementsDue).length > 0 && (
                <div className="text-sm text-orange-600">
                  • {JSON.parse(user.stripeAccount.requirementsDue).length} Stripe requirement(s)
                </div>
              )}
              {!user.emailVerified && !user.phoneVerified && (!user.stripeAccount?.requirementsDue || JSON.parse(user.stripeAccount.requirementsDue).length === 0) && (
                <span className="text-sm text-green-600">All clear</span>
              )}
            </div>
          </div>
        </div>
      </Card>
      
      {/* Role-Aware Metrics */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-[#2b2b2b] mb-4">At-a-Glance Metrics</h2>
        
        {roles.includes('VENDOR') && analytics.gmv !== undefined && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm font-medium">GMV</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                ${(analytics.gmv || 0).toLocaleString()}
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Package className="w-5 h-5" />
                <span className="text-sm font-medium">Orders</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {analytics.orderCount || 0}
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Avg Order</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                ${(analytics.avgOrderValue || 0).toFixed(2)}
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-orange-600 mb-2">
                <Package className="w-5 h-5" />
                <span className="text-sm font-medium">Products</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {analytics.productCount || 0}
              </div>
            </div>
          </div>
        )}
        
        {roles.includes('CUSTOMER') && !roles.includes('VENDOR') && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Package className="w-5 h-5" />
                <span className="text-sm font-medium">Orders</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {user._count?.orders || 0}
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm font-medium">Total Spent</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                $0.00
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">AOV</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                $0.00
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-orange-600 mb-2">
                <CalendarDays className="w-5 h-5" />
                <span className="text-sm font-medium">Last Order</span>
              </div>
              <div className="text-sm font-medium text-gray-900">
                Never
              </div>
            </div>
          </div>
        )}
        
        {roles.includes('EVENT_COORDINATOR') && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <CalendarDays className="w-5 h-5" />
                <span className="text-sm font-medium">Events</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                0
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm font-medium">Revenue</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                $0.00
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Package className="w-5 h-5" />
                <span className="text-sm font-medium">Stalls Sold</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                0
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-orange-600 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Refund Rate</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                0%
              </div>
            </div>
          </div>
        )}
      </Card>
      
      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-[#2b2b2b] mb-4">Recent Activity</h2>
        
        <div className="space-y-3">
          {user.securityEvents && user.securityEvents.slice(0, 5).map((event: any) => (
            <div key={event.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900">{event.type}</div>
                <div className="text-xs text-gray-500">
                  {new Date(event.createdAt).toLocaleString()} • {event.ip || 'Unknown IP'}
                </div>
              </div>
            </div>
          ))}
          
          {(!user.securityEvents || user.securityEvents.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

