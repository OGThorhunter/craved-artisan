import { useState } from 'react';
import { Link } from 'wouter';
import { 
  ShoppingBag, 
  Heart, 
  MapPin, 
  Star, 
  Package, 
  Clock, 
  User, 
  Settings,
  Search,
  Filter,
  CreditCard,
  Gift,
  Calendar,
  MessageCircle,
  Shield,
  QrCode,
  TrendingUp,
  Award,
  ChefHat,
  Map
} from 'lucide-react';
import { ReorderCard } from '../components/ReorderCard';
import { MyPantry } from '../components/MyPantry';
import { PickupMap } from '../components/PickupMap';
import { ScheduledOrderFramework } from '../components/ScheduleOrder';

export const CustomerDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('orders');

  // Mock reorder data
  const reorderProducts = [
    {
      id: '1',
      name: 'Cinnamon Rolls',
      price: 12.00,
      image: '/api/placeholder/200/200',
      vendor: {
        id: 'vendor1',
        name: 'Rose Creek Bakery',
        logo: '/api/placeholder/50/50'
      },
      lastOrdered: '2024-01-15',
      reorderCount: 3,
      inStock: true
    },
    {
      id: '2',
      name: 'Artisan Sourdough Bread',
      price: 8.50,
      image: '/api/placeholder/200/200',
      vendor: {
        id: 'vendor1',
        name: 'Rose Creek Bakery',
        logo: '/api/placeholder/50/50'
      },
      lastOrdered: '2024-01-10',
      reorderCount: 2,
      inStock: true
    }
  ];

  const handleReorder = (productId: string, quantity: number, deliveryType: 'pickup' | 'delivery') => {
    console.log('Reorder:', { productId, quantity, deliveryType });
    // TODO: Add to cart or show product modal
  };

  // Mock fulfillment windows for scheduled orders
  const mockFulfillmentWindows = [
    {
      id: 'window1',
      dayOfWeek: 3, // Wednesday
      startTime: '15:00',
      endTime: '18:00',
      isActive: true,
      maxOrders: 20,
      currentOrders: 12
    },
    {
      id: 'window2',
      dayOfWeek: 5, // Friday
      startTime: '14:00',
      endTime: '17:00',
      isActive: true,
      maxOrders: 15,
      currentOrders: 8
    },
    {
      id: 'window3',
      dayOfWeek: 6, // Saturday
      startTime: '09:00',
      endTime: '12:00',
      isActive: true,
      maxOrders: 25,
      currentOrders: 18
    }
  ];

  // Mock scheduled orders
  const mockScheduledOrders = [
    {
      id: 'scheduled1',
      vendorId: 'vendor1',
      vendorName: 'Rose Creek Bakery',
      fulfillmentWindowId: 'window1',
      scheduledDate: '2024-01-24T15:00:00',
      isRecurring: true,
      recurringSchedule: {
        id: 'recurring1',
        frequency: 'weekly',
        dayOfWeek: 3,
        startDate: '2024-01-24T15:00:00',
        isActive: true
      },
      items: [
        { productId: 'prod1', name: 'Cinnamon Rolls', quantity: 2, price: 12.00 },
        { productId: 'prod2', name: 'Sourdough Bread', quantity: 1, price: 8.50 }
      ],
      totalAmount: 32.50,
      status: 'confirmed',
      createdAt: '2024-01-20T10:00:00'
    }
  ];

  // Mock data - in real app, this would come from API
  const orders = [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      status: 'delivered',
      date: '2024-01-15',
      total: 89.99,
      items: [
        { name: 'Handcrafted Ceramic Mug Set', quantity: 1, price: 45.99 },
        { name: 'Artisan Soap Collection', quantity: 2, price: 22.00 }
      ],
      vendor: 'Sarah\'s Ceramics'
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      status: 'shipped',
      date: '2024-01-20',
      total: 156.50,
      items: [
        { name: 'Handwoven Wool Scarf', quantity: 1, price: 78.00 },
        { name: 'Wooden Cutting Board', quantity: 1, price: 78.50 }
      ],
      vendor: 'Mountain Crafts'
    }
  ];

  const favorites = [
    {
      id: '1',
      name: 'Handcrafted Ceramic Mug Set',
      price: 45.99,
      image: '/api/placeholder/200/200',
      vendor: 'Sarah\'s Ceramics',
      rating: 4.8
    },
    {
      id: '2',
      name: 'Artisan Soap Collection',
      price: 22.00,
      image: '/api/placeholder/200/200',
      vendor: 'Natural Soaps Co',
      rating: 4.9
    }
  ];

  const addresses = [
    {
      id: '1',
      type: 'shipping',
      name: 'John Doe',
      address: '123 Main St',
      city: 'Portland',
      state: 'OR',
      zip: '97201',
      isDefault: true
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'shipped': return 'text-blue-600 bg-blue-50';
      case 'processing': return 'text-yellow-600 bg-yellow-50';
      case 'pending': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <Package className="w-4 h-4" />;
      case 'shipped': return <Package className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="page-container bg-gray-50">
      <div className="container-responsive py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="responsive-heading">Good morning, Casey ðŸ‘‹</h1>
              <p className="text-sm text-brand-grey">
                Your next pickup window is <strong>Friday 3â€“5 PM</strong> near <strong>ZIP 30248</strong>
              </p>
              {/* TODO: Show "You've supported 6 local families this month" */}
              {/* TODO: Show dynamic vendor spotlight or promo: "Top Seller This Week: Sweetwater Farms ðŸ“" */}
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/profile">
                <button className="flex items-center space-x-2 responsive-button text-gray-600 hover:text-gray-900">
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </button>
              </Link>
              <Link href="/settings">
                <button className="flex items-center space-x-2 responsive-button text-gray-600 hover:text-gray-900">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'orders', label: 'Orders', icon: ShoppingBag },
                { id: 'favorites', label: 'Favorites', icon: Heart },
                { id: 'addresses', label: 'Addresses', icon: MapPin }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="responsive-subheading text-gray-900">Order History</h2>
                  <div className="flex items-center space-x-2">
                    <Link href="/dashboard/customer/orders">
                      <button className="responsive-button bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        View All Orders
                      </button>
                    </Link>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search orders..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <button 
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      title="Filter orders"
                    >
                      <Filter className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.orderNumber}
                          </h3>
                          <p className="responsive-text text-gray-500">Placed on {order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">${order.total}</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status}</span>
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="text-gray-900">${item.price}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="responsive-text text-gray-500">
                          Vendor: <span className="text-gray-900">{order.vendor}</span>
                        </p>
                      </div>

                      <div className="mt-4 flex space-x-2">
                        <button className="responsive-button text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                          View Details
                        </button>
                        {order.status === 'delivered' && (
                          <button className="responsive-button text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                            Write Review
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="space-y-6">
                <h2 className="responsive-subheading text-gray-900">Favorite Products</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="aspect-square bg-gray-100">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                        <p className="responsive-text text-gray-500 mb-2">{item.vendor}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-gray-900">${item.price}</span>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="responsive-text text-gray-600 ml-1">{item.rating}</span>
                          </div>
                        </div>
                        <div className="mt-3 flex space-x-2">
                          <Link href={`/product/${item.id}`}>
                            <button className="flex-1 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                              View Product
                            </button>
                          </Link>
                          <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="responsive-subheading text-gray-900">Shipping Addresses</h2>
                  <button className="responsive-button bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    Add New Address
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((address) => (
                    <div key={address.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{address.name}</h3>
                          <p className="responsive-text text-gray-500 capitalize">{address.type} Address</p>
                        </div>
                        {address.isDefault && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Default
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 responsive-text text-gray-600">
                        <p>{address.address}</p>
                        <p>{address.city}, {address.state} {address.zip}</p>
                      </div>

                      <div className="mt-4 flex space-x-2">
                        <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                          Edit
                        </button>
                        {!address.isDefault && (
                          <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                            Set as Default
                          </button>
                        )}
                        <button className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Wallet & Loyalty Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Wallet & Loyalty
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-brand-cream rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="responsive-text font-medium">Available Credit</span>
                <Gift className="w-4 h-4 text-brand-green" />
              </div>
              <p className="responsive-heading text-brand-maroon">$24.50</p>
              <p className="text-xs text-brand-grey">From referrals & rewards</p>
            </div>
            <div className="bg-brand-cream rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="responsive-text font-medium">Points Earned</span>
                <TrendingUp className="w-4 h-4 text-brand-green" />
              </div>
              <p className="responsive-heading text-brand-maroon">1,247</p>
              <p className="text-xs text-brand-grey">This month</p>
            </div>
            <div className="bg-brand-cream rounded-lg p-4">
              <p className="text-sm">Referral Code: <code className="bg-brand-beige px-2 py-1 rounded">CASEY10</code></p>
              {/* TODO: Show QR code generator for referral link */}
              {/* TODO: Show referral impact tracker */}
            </div>
          </div>
        </div>

                 {/* Smart Reorder Section */}
         <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
           <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
             <ChefHat className="w-5 h-5" />
             Smart Reorder
           </h2>
           <p className="text-sm text-brand-grey mb-4">We noticed you often order these items...</p>
           {/* TODO: Offer recurring order toggle for favorite items */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {reorderProducts.map((product) => (
               <ReorderCard
                 key={product.id}
                 product={product}
                 onReorder={handleReorder}
                 compact={false}
               />
             ))}
           </div>
         </div>

                 {/* My Pantry Section */}
         <MyPantry 
           className="mb-8"
           onIngredientAdd={(ingredient) => {
             console.log('Added ingredient:', ingredient);
             // TODO: Save to backend
           }}
           onIngredientRemove={(ingredientId) => {
             console.log('Removed ingredient:', ingredientId);
             // TODO: Remove from backend
           }}
           onIngredientEdit={(ingredientId, updates) => {
             console.log('Updated ingredient:', ingredientId, updates);
             // TODO: Update in backend
           }}
         />

        {/* Vendor Messages & Polls Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            From Your Vendors
          </h2>
          {/* TODO: Show embedded short-form vendor video (e.g. via CDN or upload) */}
          {/* TODO: Display vendor polls: "What should we bake next week?" */}
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div>
                  <h3 className="font-medium">Rose Creek Bakery</h3>
                  <p className="text-sm text-brand-grey">2 hours ago</p>
                </div>
              </div>
              <p className="text-sm mb-3">"What should we bake next week? Vote for your favorite! ðŸž"</p>
              <div className="space-y-2">
                <button className="w-full text-left p-2 border border-gray-200 rounded hover:bg-gray-50 text-sm">
                  ðŸ¥– Sourdough Bread (12 votes)
                </button>
                <button className="w-full text-left p-2 border border-gray-200 rounded hover:bg-gray-50 text-sm">
                  ðŸ¥¨ Pretzels (8 votes)
                </button>
                <button className="w-full text-left p-2 border border-gray-200 rounded hover:bg-gray-50 text-sm">
                  ðŸ¥ Croissants (15 votes)
                </button>
              </div>
            </div>
          </div>
        </div>

                 {/* Pickup Map Section */}
         <PickupMap 
           className="mb-8"
           userZip="30248"
           onLocationSelect={(location) => {
             console.log('Selected location:', location);
             // TODO: Navigate to location details or vendor page
           }}
           onAddLocation={(location) => {
             console.log('Added location:', location);
             // TODO: Save to user's saved locations
           }}
           onOrderHere={(location) => {
             console.log('Order here:', location);
             // TODO: Navigate to vendor's ordering page
           }}
         />

                 {/* Scheduled Orders Section */}
         <ScheduledOrderFramework 
           className="mb-8"
           vendorId="vendor1"
           vendorName="Rose Creek Bakery"
           fulfillmentWindows={mockFulfillmentWindows}
           existingOrders={mockScheduledOrders}
           onScheduleOrder={(order) => {
             console.log('Scheduled order:', order);
             // TODO: Save to backend
           }}
           onUpdateOrder={(orderId, updates) => {
             console.log('Updated order:', orderId, updates);
             // TODO: Update in backend
           }}
           onCancelOrder={(orderId) => {
             console.log('Cancelled order:', orderId);
             // TODO: Cancel in backend
           }}
         />

         {/* Trust & Security Section */}
         <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
           <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
             <Shield className="w-5 h-5" />
             Trust & Safety
           </h2>
           <p className="text-sm">All vendors are verified and meet local food safety laws.</p>
           <p className="text-sm text-brand-grey mt-1">Secure payments. Local-only sellers. No resellers.</p>
           <div className="mt-4 flex gap-4">
             <div className="flex items-center gap-2">
               <Shield className="w-4 h-4 text-green-600" />
               <span className="text-sm">Verified Vendors</span>
             </div>
             <div className="flex items-center gap-2">
               <Shield className="w-4 h-4 text-green-600" />
               <span className="text-sm">Local Only</span>
             </div>
             <div className="flex items-center gap-2">
               <Shield className="w-4 h-4 text-green-600" />
               <span className="text-sm">Secure Payments</span>
             </div>
           </div>
         </div>
      </div>
    </div>
  );
}; 
