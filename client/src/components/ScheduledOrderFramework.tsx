import { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Repeat, 
  AlertCircle, 
  CheckCircle, 
  X,
  ChevronLeft,
  ChevronRight,
  Bell,
  ShoppingCart,
  CalendarDays,
  RotateCcw
} from 'lucide-react';

interface FulfillmentWindow {
  id: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isActive: boolean;
  maxOrders?: number;
  currentOrders?: number;
}

interface RecurringSchedule {
  id: string;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  dayOfWeek: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

interface ScheduledOrder {
  id: string;
  vendorId: string;
  vendorName: string;
  fulfillmentWindowId: string;
  scheduledDate: string;
  isRecurring: boolean;
  recurringSchedule?: RecurringSchedule;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  reminderSent?: boolean;
  createdAt: string;
}

interface ScheduledOrderFrameworkProps {
  className?: string;
  vendorId?: string;
  vendorName?: string;
  fulfillmentWindows?: FulfillmentWindow[];
  onScheduleOrder?: (order: Omit<ScheduledOrder, 'id' | 'createdAt'>) => void;
  onUpdateOrder?: (orderId: string, updates: Partial<ScheduledOrder>) => void;
  onCancelOrder?: (orderId: string) => void;
  existingOrders?: ScheduledOrder[];
  showReminders?: boolean;
}

export const ScheduledOrderFramework: React.FC<ScheduledOrderFrameworkProps> = ({
  className = '',
  vendorId,
  vendorName,
  fulfillmentWindows = [],
  onScheduleOrder,
  onUpdateOrder,
  onCancelOrder,
  existingOrders = [],
  showReminders = true
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedWindow, setSelectedWindow] = useState<FulfillmentWindow | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringSchedule, setRecurringSchedule] = useState<Partial<RecurringSchedule>>({
    frequency: 'weekly',
    dayOfWeek: 0,
    isActive: true
  });
  const [cartItems, setCartItems] = useState<Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Load cart items from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem(`scheduled-cart-${vendorId}`);
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading saved cart:', error);
      }
    }
  }, [vendorId]);

  // Save cart items to localStorage
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem(`scheduled-cart-${vendorId}`, JSON.stringify(cartItems));
    } else {
      localStorage.removeItem(`scheduled-cart-${vendorId}`);
    }
  }, [cartItems, vendorId]);

  // Get available fulfillment windows for selected date
  const availableWindows = useMemo(() => {
    const dayOfWeek = selectedDate.getDay();
    return fulfillmentWindows.filter(window => 
      window.dayOfWeek === dayOfWeek && 
      window.isActive &&
      (!window.maxOrders || !window.currentOrders || window.currentOrders < window.maxOrders)
    );
  }, [fulfillmentWindows, selectedDate]);

  // Get next available date for each fulfillment window
  const getNextAvailableDate = (window: FulfillmentWindow): Date => {
    const today = new Date();
    const targetDay = window.dayOfWeek;
    const currentDay = today.getDay();
    
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) daysToAdd += 7;
    
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysToAdd);
    return nextDate;
  };

  // Format time for display
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Get day name
  const getDayName = (dayOfWeek: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  // Calculate total amount
  const totalAmount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cartItems]);

  // Get smart reminder message
  const getReminderMessage = (): string | null => {
    if (!selectedWindow || !showReminders) return null;

    const nextDate = getNextAvailableDate(selectedWindow);
    const today = new Date();
    const daysUntil = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil === 1) {
      return `Add to cart before ${formatTime(selectedWindow.startTime)} tomorrow!`;
    } else if (daysUntil <= 3) {
      return `Order by ${formatTime(selectedWindow.startTime)} ${getDayName(selectedWindow.dayOfWeek)} to secure your spot!`;
    }

    return null;
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedWindow(null);
    setShowCalendar(false);
  };

  // Handle window selection
  const handleWindowSelect = (window: FulfillmentWindow) => {
    setSelectedWindow(window);
  };

  // Handle recurring schedule change
  const handleRecurringChange = (updates: Partial<RecurringSchedule>) => {
    setRecurringSchedule(prev => ({ ...prev, ...updates }));
  };

  // Handle schedule order
  const handleScheduleOrder = () => {
    if (!selectedWindow || !vendorId || !vendorName || cartItems.length === 0) return;

    const order: Omit<ScheduledOrder, 'id' | 'createdAt'> = {
      vendorId,
      vendorName,
      fulfillmentWindowId: selectedWindow.id,
      scheduledDate: selectedDate.toISOString(),
      isRecurring,
      items: cartItems,
      totalAmount,
      status: 'pending'
    };

    if (isRecurring && recurringSchedule) {
      order.recurringSchedule = {
        id: Date.now().toString(),
        frequency: recurringSchedule.frequency || 'weekly',
        dayOfWeek: recurringSchedule.dayOfWeek || 0,
        startDate: selectedDate.toISOString(),
        isActive: true
      };
    }

    onScheduleOrder?.(order);
    
    // Clear cart after successful scheduling
    setCartItems([]);
    setSelectedWindow(null);
    setSelectedDate(new Date());
    setIsRecurring(false);
  };

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() - 1);
      return newMonth;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + 1);
      return newMonth;
    });
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    while (currentDate <= lastDay || currentDate.getDay() !== 0) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className={`bg-white rounded-2xl shadow-sm p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Schedule Order
          </h2>
          <p className="text-sm text-brand-grey">
            {vendorName ? `Order from ${vendorName}` : 'Select pickup time'}
          </p>
        </div>
        {cartItems.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-brand-grey">
            <ShoppingCart className="w-4 h-4" />
            <span>{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Smart Reminder */}
      {showReminders && getReminderMessage() && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" />
            <p className="text-sm text-blue-800">{getReminderMessage()}</p>
          </div>
        </div>
      )}

      {/* Date Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900">Select Date</h3>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <CalendarDays className="w-4 h-4" />
            {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
          </button>
        </div>

        {showCalendar ? (
          <div className="border border-gray-200 rounded-lg p-4">
            {/* Calendar Header */}
                         <div className="flex items-center justify-between mb-4">
               <button
                 onClick={goToPreviousMonth}
                 className="p-1 hover:bg-gray-100 rounded"
                 title="Previous month"
               >
                 <ChevronLeft className="w-4 h-4" />
               </button>
               <h4 className="font-medium">
                 {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
               </h4>
               <button
                 onClick={goToNextMonth}
                 className="p-1 hover:bg-gray-100 rounded"
                 title="Next month"
               >
                 <ChevronRight className="w-4 h-4" />
               </button>
             </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-xs">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center font-medium text-gray-500">
                  {day}
                </div>
              ))}
              
              {calendarDays.map((day, index) => {
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                const isSelected = day.toDateString() === selectedDate.toDateString();
                const isToday = day.toDateString() === new Date().toDateString();
                const hasWindows = fulfillmentWindows.some(window => 
                  window.dayOfWeek === day.getDay() && window.isActive
                );

                return (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(day)}
                    disabled={!isCurrentMonth || !hasWindows}
                    className={`
                      p-2 text-center rounded-lg text-sm transition-colors
                      ${!isCurrentMonth ? 'text-gray-300' : 'hover:bg-gray-100'}
                      ${isSelected ? 'bg-brand-green text-white' : ''}
                      ${isToday && !isSelected ? 'bg-blue-100 text-blue-800' : ''}
                      ${hasWindows && isCurrentMonth ? 'font-medium' : ''}
                      ${!hasWindows && isCurrentMonth ? 'text-gray-400' : ''}
                    `}
                  >
                    {day.getDate()}
                    {hasWindows && isCurrentMonth && (
                      <div className="w-1 h-1 bg-brand-green rounded-full mx-auto mt-1"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex-1 p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
                         <button
               onClick={() => setShowCalendar(true)}
               className="px-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
               title="Show calendar"
             >
               <Calendar className="w-4 h-4" />
             </button>
          </div>
        )}
      </div>

      {/* Fulfillment Windows */}
      {availableWindows.length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Available Pickup Times</h3>
          <div className="space-y-2">
            {availableWindows.map((window) => (
              <button
                key={window.id}
                onClick={() => handleWindowSelect(window)}
                className={`
                  w-full p-3 border rounded-lg text-left transition-colors
                  ${selectedWindow?.id === window.id 
                    ? 'border-brand-green bg-brand-green/5' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">
                      {formatTime(window.startTime)} - {formatTime(window.endTime)}
                    </span>
                  </div>
                  {selectedWindow?.id === window.id && (
                    <CheckCircle className="w-4 h-4 text-brand-green" />
                  )}
                </div>
                {window.maxOrders && window.currentOrders && (
                  <p className="text-xs text-gray-500 mt-1">
                    {window.maxOrders - window.currentOrders} spots remaining
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recurring Options */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            id="recurring"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="rounded border-gray-300 text-brand-green focus:ring-brand-green"
          />
          <label htmlFor="recurring" className="font-medium text-gray-900">
            Make this a recurring order
          </label>
          <Repeat className="w-4 h-4 text-gray-400" />
        </div>

        {isRecurring && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency
              </label>
                             <select
                 value={recurringSchedule.frequency}
                 onChange={(e) => handleRecurringChange({ frequency: e.target.value as 'weekly' | 'biweekly' | 'monthly' })}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                 aria-label="Select recurring frequency"
               >
                <option value="weekly">Every week</option>
                <option value="biweekly">Every 2 weeks</option>
                <option value="monthly">Every month</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Day of Week
              </label>
                             <select
                 value={recurringSchedule.dayOfWeek}
                 onChange={(e) => handleRecurringChange({ dayOfWeek: parseInt(e.target.value) })}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                 aria-label="Select day of week for recurring order"
               >
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                  <option key={day} value={index}>{day}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Cart Summary */}
      {cartItems.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
          <div className="space-y-2">
            {cartItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {item.quantity}x {item.name}
                </span>
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex items-center justify-between font-medium">
                <span>Total</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleScheduleOrder}
          disabled={!selectedWindow || cartItems.length === 0}
          className="flex-1 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/80 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Schedule Order
        </button>
                 <button
           onClick={() => {
             setCartItems([]);
             setSelectedWindow(null);
             setSelectedDate(new Date());
             setIsRecurring(false);
           }}
           className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
           title="Reset form"
         >
           <RotateCcw className="w-4 h-4" />
         </button>
      </div>

      {/* Existing Orders */}
      {existingOrders.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">Scheduled Orders</h3>
          <div className="space-y-3">
            {existingOrders.map((order) => (
              <div key={order.id} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">
                      {new Date(order.scheduledDate).toLocaleDateString()}
                    </span>
                    {order.isRecurring && (
                      <Repeat className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''} • ${order.totalAmount.toFixed(2)}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => onUpdateOrder?.(order.id, { status: 'cancelled' })}
                    className="px-2 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 