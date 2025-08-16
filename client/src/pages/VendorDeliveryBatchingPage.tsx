import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, MapPin, Package, User, DollarSign, Clock, Filter, Route, FileText, Truck, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';

interface OrderItem {
  id: string;
  quantity: number;
  productName: string;
  productImage: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  shippingZip: string;
  shippingCity: string;
  shippingState: string;
  items: OrderItem[];
  fulfillmentStatus: string;
  etaLabel: string | null;
}

interface DeliveryBatches {
  batches: Record<string, Order[]>;
  totalOrders: number;
  totalBatches: number;
  optimization?: {
    enabled: boolean;
    totalDistance: number;
    totalTime: number;
    totalFuelCost: number;
  };
}

interface BatchStatus {
  batchId: string;
  deliveryDay: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  driverInfo: {
    assignedDriver: string;
    driverPhone: string;
    vehicleId: string;
    routeNumber: string;
  };
  tracking: {
    packedAt: string | null;
    loadedAt: string | null;
    outForDeliveryAt: string | null;
    completedAt: string | null;
  };
  progress: {
    totalOrders: number;
    packedOrders: number;
    loadedOrders: number;
    deliveredOrders: number;
    completionPercentage: number;
  };
}

const VendorDeliveryBatchingPage: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [optimizeRoutes, setOptimizeRoutes] = useState(false);
  const [selectedBatchDay, setSelectedBatchDay] = useState<string>('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const queryClient = useQueryClient();

    const { data: batchedOrders, isLoading, error } = useQuery<DeliveryBatches>({
    queryKey: ['delivery-batches', optimizeRoutes],
    queryFn: async () => {
      const url = optimizeRoutes 
        ? '/api/vendor/orders/delivery-batches?optimize=true'
        : '/api/vendor/orders/delivery-batches';
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to fetch delivery batches');
      }
      return res.json();
    }
  });

  // Mutations for batch operations
  const updateBatchStatusMutation = useMutation({
    mutationFn: async ({ day, status }: { day: string; status: string }) => {
      const res = await fetch(`/api/vendor/orders/delivery-batches/${day}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update batch status');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Batch status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['delivery-batches'] });
    },
    onError: () => {
      toast.error('Failed to update batch status');
    }
  });

  const generateManifestMutation = useMutation({
    mutationFn: async (day: string) => {
      const res = await fetch(`/api/vendor/orders/delivery-batches/${day}/manifest`);
      if (!res.ok) throw new Error('Failed to generate manifest');
      return res.json();
    },
    onSuccess: (data) => {
      toast.success('Manifest generated successfully');
      // In a real app, this would download the PDF
      console.log('Manifest data:', data);
    },
    onError: () => {
      toast.error('Failed to generate manifest');
    }
  });

  // Function to generate and download manifest PDF using jsPDF with ZIP grouping
  const generateManifestPDF = async (day: string, orders: Order[]) => {
    try {
      const res = await fetch(`/api/vendor/orders/delivery-batches/${day}/manifest?format=json`);
      if (!res.ok) throw new Error('Failed to generate manifest');
      
      const manifestData = await res.json();
      
      // Group orders by ZIP code for efficient delivery routing
      const groupedByZip = orders.reduce((acc, order) => {
        const zip = order.shippingZip;
        acc[zip] = acc[zip] || [];
        acc[zip].push(order);
        return acc;
      }, {} as Record<string, Order[]>);
      
      // Create new PDF document
      const doc = new jsPDF();
      
      // Set document properties
      doc.setProperties({
        title: `Delivery Manifest - ${day}`,
        subject: 'Delivery Batch Manifest',
        author: 'Craved Artisan',
        creator: 'Delivery Management System'
      });
      
      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Delivery Manifest', 105, 20, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text(`${day} - ${manifestData.batchId}`, 105, 30, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date(manifestData.generatedAt).toLocaleString()}`, 105, 40, { align: 'center' });
      
      // Batch Information
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Batch Information', 14, 55);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Delivery Day: ${manifestData.deliveryDay}`, 14, 65);
      doc.text(`Batch ID: ${manifestData.batchId}`, 14, 72);
      doc.text(`Total Orders: ${manifestData.summary.totalOrders}`, 14, 79);
      doc.text(`Total Items: ${manifestData.summary.totalItems}`, 14, 86);
      doc.text(`Total Value: $${manifestData.summary.totalValue.toFixed(2)}`, 14, 93);
      doc.text(`ZIP Code Groups: ${Object.keys(groupedByZip).length}`, 14, 100);
      
      // Driver Information
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Driver Information', 14, 115);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Driver: ${manifestData.driverInfo.assignedDriver}`, 14, 125);
      doc.text(`Phone: ${manifestData.driverInfo.driverPhone}`, 14, 132);
      doc.text(`Vehicle: ${manifestData.driverInfo.vehicleId}`, 14, 139);
      doc.text(`Route: ${manifestData.driverInfo.routeNumber}`, 14, 146);
      
      let currentY = 160;
      
      // Generate tables for each ZIP code group
      Object.entries(groupedByZip).forEach(([zipCode, zipOrders], zipIndex) => {
        // ZIP Code Group Header
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`ZIP Code ${zipCode} (${zipOrders.length} orders)`, 14, currentY);
        
        currentY += 10;
        
        // Create table data for this ZIP group
        const tableData = zipOrders.map((order, index) => [
          `Stop ${zipIndex + 1}-${index + 1}`,
          order.orderNumber,
          order.customerName,
          `${order.shippingCity}, ${order.shippingState}`,
          order.customerEmail,
          `$${order.total.toFixed(2)}`,
          order.items.length,
          order.etaLabel || 'Standard'
        ]);
        
        // Generate table for this ZIP group
        autoTable(doc, {
          startY: currentY,
          head: [['Stop', 'Order #', 'Customer', 'Location', 'Email', 'Total', 'Items', 'Priority']],
          body: tableData,
          theme: 'grid',
          headStyles: {
            fillColor: [59, 130, 246],
            textColor: 255,
            fontStyle: 'bold'
          },
          styles: {
            fontSize: 8,
            cellPadding: 2
          },
          columnStyles: {
            0: { cellWidth: 20 }, // Stop
            1: { cellWidth: 25 }, // Order #
            2: { cellWidth: 35 }, // Customer
            3: { cellWidth: 30 }, // Location
            4: { cellWidth: 35 }, // Email
            5: { cellWidth: 15 }, // Total
            6: { cellWidth: 15 }, // Items
            7: { cellWidth: 20 }  // Priority
          },
          didDrawPage: function (data) {
            // Add page number
            const pageCount = doc.getNumberOfPages();
            doc.setFontSize(8);
            doc.text(`Page ${data.pageNumber} of ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
          }
        });
        
        // Update current Y position for next group
        currentY = (doc as any).lastAutoTable.finalY + 15;
        
        // Add page break if needed (except for last group)
        if (zipIndex < Object.keys(groupedByZip).length - 1 && currentY > 250) {
          doc.addPage();
          currentY = 20;
        }
      });
      
      // Route Optimization Information (if available)
      if (manifestData.routeOptimization) {
        const finalY = (doc as any).lastAutoTable.finalY || currentY;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Route Optimization', 14, finalY + 20);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Total Distance: ${manifestData.routeOptimization.totalDistance} miles`, 14, finalY + 30);
        doc.text(`Estimated Time: ${Math.round(manifestData.routeOptimization.estimatedTime / 60)} hours`, 14, finalY + 37);
        doc.text(`Fuel Cost: $${manifestData.routeOptimization.fuelCost}`, 14, finalY + 44);
        doc.text(`ZIP Groups: ${Object.keys(groupedByZip).length}`, 14, finalY + 51);
      }
      
      // Save the PDF
      doc.save(`manifest-${day.toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success('Manifest PDF generated successfully');
    } catch (error) {
      console.error('Error generating manifest PDF:', error);
             toast.error('Failed to generate manifest PDF');
     }
   };

   // Function to print manifest directly
   const printManifest = async (day: string, orders: Order[]) => {
     try {
       const res = await fetch(`/api/vendor/orders/delivery-batches/${day}/manifest?format=json`);
       if (!res.ok) throw new Error('Failed to generate manifest');
       
       const manifestData = await res.json();
       
       // Group orders by ZIP code for efficient delivery routing
       const groupedByZip = orders.reduce((acc, order) => {
         const zip = order.shippingZip;
         acc[zip] = acc[zip] || [];
         acc[zip].push(order);
         return acc;
       }, {} as Record<string, Order[]>);
       
       // Create print-friendly HTML content
       const printContent = `
         <!DOCTYPE html>
         <html>
         <head>
           <title>Delivery Manifest - ${day}</title>
           <style>
             @media print {
               body * {
                 visibility: hidden;
               }
               #manifest, #manifest * {
                 visibility: visible;
               }
               #manifest {
                 position: absolute;
                 left: 0;
                 top: 0;
                 width: 100%;
                 height: 100%;
               }
               .manifest-content {
                 font-family: Arial, sans-serif;
                 font-size: 12px;
                 line-height: 1.4;
                 color: #000;
                 background: #fff;
                 padding: 20px;
               }
               .no-print {
                 display: none !important;
               }
               table {
                 border-collapse: collapse;
                 width: 100%;
                 margin-bottom: 20px;
               }
               th, td {
                 border: 1px solid #000;
                 padding: 4px 8px;
                 text-align: left;
                 font-size: 10px;
               }
               th {
                 background-color: #f0f0f0 !important;
                 font-weight: bold;
               }
               .header {
                 text-align: center;
                 border-bottom: 2px solid #333;
                 padding-bottom: 10px;
                 margin-bottom: 20px;
               }
               .section {
                 margin-bottom: 20px;
               }
               .section-title {
                 font-weight: bold;
                 font-size: 14px;
                 margin-bottom: 10px;
                 background-color: #f0f0f0;
                 padding: 5px;
               }
               .zip-group {
                 margin-bottom: 15px;
                 page-break-inside: avoid;
               }
               .zip-title {
                 font-weight: bold;
                 font-size: 12px;
                 margin-bottom: 5px;
                 background-color: #e0e0e0;
                 padding: 3px;
               }
               @page {
                 margin: 0.5in;
                 size: letter;
               }
             }
             
             /* Screen styles */
             body {
               font-family: Arial, sans-serif;
               margin: 20px;
               background-color: #f5f5f5;
             }
             .print-button {
               background: #007bff;
               color: white;
               border: none;
               padding: 10px 20px;
               border-radius: 5px;
               cursor: pointer;
               margin-bottom: 20px;
             }
             .print-button:hover {
               background: #0056b3;
             }
             .manifest-content {
               background: white;
               padding: 20px;
               border-radius: 5px;
               box-shadow: 0 2px 4px rgba(0,0,0,0.1);
             }
             .header {
               text-align: center;
               border-bottom: 2px solid #333;
               padding-bottom: 10px;
               margin-bottom: 20px;
             }
             .section {
               margin-bottom: 20px;
             }
             .section-title {
               font-weight: bold;
               font-size: 14px;
               margin-bottom: 10px;
               background-color: #f0f0f0;
               padding: 5px;
             }
             .zip-group {
               margin-bottom: 15px;
             }
             .zip-title {
               font-weight: bold;
               font-size: 12px;
               margin-bottom: 5px;
               background-color: #e0e0e0;
               padding: 3px;
             }
             table {
               border-collapse: collapse;
               width: 100%;
               margin-bottom: 20px;
             }
             th, td {
               border: 1px solid #000;
               padding: 4px 8px;
               text-align: left;
               font-size: 10px;
             }
             th {
               background-color: #f0f0f0;
               font-weight: bold;
             }
           </style>
         </head>
         <body>
           <button class="print-button no-print" onclick="window.print()">Print Manifest</button>
           <div id="manifest" class="manifest-content">
             <div class="header">
               <h1>Delivery Manifest</h1>
               <h2>${day} - ${manifestData.batchId}</h2>
               <p>Generated: ${new Date(manifestData.generatedAt).toLocaleString()}</p>
             </div>
             
             <div class="section">
               <div class="section-title">Batch Information</div>
               <p><strong>Delivery Day:</strong> ${manifestData.deliveryDay}</p>
               <p><strong>Batch ID:</strong> ${manifestData.batchId}</p>
               <p><strong>Total Orders:</strong> ${manifestData.summary.totalOrders}</p>
               <p><strong>Total Items:</strong> ${manifestData.summary.totalItems}</p>
               <p><strong>Total Value:</strong> $${manifestData.summary.totalValue.toFixed(2)}</p>
               <p><strong>ZIP Code Groups:</strong> ${Object.keys(groupedByZip).length}</p>
             </div>
             
             <div class="section">
               <div class="section-title">Driver Information</div>
               <p><strong>Driver:</strong> ${manifestData.driverInfo.assignedDriver}</p>
               <p><strong>Phone:</strong> ${manifestData.driverInfo.driverPhone}</p>
               <p><strong>Vehicle:</strong> ${manifestData.driverInfo.vehicleId}</p>
               <p><strong>Route:</strong> ${manifestData.driverInfo.routeNumber}</p>
             </div>
             
             <div class="section">
               <div class="section-title">Delivery Orders by ZIP Code</div>
               ${Object.entries(groupedByZip).map(([zipCode, zipOrders], zipIndex) => `
                 <div class="zip-group">
                   <div class="zip-title">ZIP Code ${zipCode} (${zipOrders.length} orders)</div>
                   <table>
                     <thead>
                       <tr>
                         <th>Stop</th>
                         <th>Order #</th>
                         <th>Customer</th>
                         <th>Location</th>
                         <th>Email</th>
                         <th>Total</th>
                         <th>Items</th>
                         <th>Priority</th>
                       </tr>
                     </thead>
                     <tbody>
                       ${zipOrders.map((order, index) => `
                         <tr>
                           <td>${zipIndex + 1}-${index + 1}</td>
                           <td>${order.orderNumber}</td>
                           <td>${order.customerName}</td>
                           <td>${order.shippingCity}, ${order.shippingState}</td>
                           <td>${order.customerEmail}</td>
                           <td>$${order.total.toFixed(2)}</td>
                           <td>${order.items.length}</td>
                           <td>${order.etaLabel || 'Standard'}</td>
                         </tr>
                       `).join('')}
                     </tbody>
                   </table>
                 </div>
               `).join('')}
             </div>
             
             ${manifestData.routeOptimization ? `
               <div class="section">
                 <div class="section-title">Route Optimization</div>
                 <p><strong>Total Distance:</strong> ${manifestData.routeOptimization.totalDistance} miles</p>
                 <p><strong>Estimated Time:</strong> ${Math.round(manifestData.routeOptimization.estimatedTime / 60)} hours</p>
                 <p><strong>Fuel Cost:</strong> $${manifestData.routeOptimization.fuelCost}</p>
                 <p><strong>ZIP Groups:</strong> ${Object.keys(groupedByZip).length}</p>
               </div>
             ` : ''}
           </div>
         </body>
         </html>
       `;
       
       // Open new window with print content
       const printWindow = window.open('', '_blank');
       if (!printWindow) {
         toast.error('Please allow popups to print the manifest');
         return;
       }
       
       printWindow.document.write(printContent);
       printWindow.document.close();
       
       // Auto-print after content loads
       printWindow.onload = () => {
         printWindow.print();
       };
       
       toast.success('Print dialog opened');
     } catch (error) {
       console.error('Error printing manifest:', error);
       toast.error('Failed to print manifest');
     }
   };

  if (isLoading) {
    return (
      <VendorDashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </VendorDashboardLayout>
    );
  }

  if (error) {
    return (
      <VendorDashboardLayout>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">Error loading delivery batches: {error.message}</p>
            </div>
          </div>
        </div>
      </VendorDashboardLayout>
    );
  }

  if (!batchedOrders) {
    return (
      <VendorDashboardLayout>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-600">No delivery batches found.</p>
            </div>
          </div>
        </div>
      </VendorDashboardLayout>
    );
  }

  // Filter batches based on selected day and search term
  const filteredBatches = Object.entries(batchedOrders.batches).filter(([day, orders]) => {
    const matchesDay = selectedDay === 'all' || day === selectedDay;
    const matchesSearch = searchTerm === '' || orders.some(order => 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingZip.includes(searchTerm)
    );
    return matchesDay && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'READY':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDayColor = (day: string) => {
    switch (day) {
      case 'Monday':
        return 'bg-blue-50 border-blue-200';
      case 'Tuesday':
        return 'bg-purple-50 border-purple-200';
      case 'Wednesday':
        return 'bg-green-50 border-green-200';
      case 'Thursday':
        return 'bg-yellow-50 border-yellow-200';
      case 'Friday':
        return 'bg-orange-50 border-orange-200';
      case 'Saturday':
        return 'bg-pink-50 border-pink-200';
      case 'Sunday':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <VendorDashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="h-8 w-8 text-blue-600" />
          <h1 className="responsive-heading text-gray-900">Delivery Batching Dashboard</h1>
        </div>
        <p className="text-gray-600">
          Organize and manage orders by delivery day for efficient fulfillment
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="optimize-routes"
            checked={optimizeRoutes}
            onChange={(e) => setOptimizeRoutes(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="optimize-routes" className="responsive-text font-medium text-gray-700">
            <Route className="h-4 w-4 inline mr-1" />
            AI Route Optimization
          </label>
        </div>
        
        {batchedOrders.optimization && (
          <div className="flex items-center gap-4 responsive-text text-gray-600">
            <span>ðŸ“ {batchedOrders.optimization.totalDistance} miles</span>
            <span>â±ï¸ {Math.round(batchedOrders.optimization.totalTime / 60)} hours</span>
            <span>â›½ ${batchedOrders.optimization.totalFuelCost}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-blue-600" />
            <div>
              <p className="responsive-text text-gray-600">Total Orders</p>
              <p className="responsive-heading text-gray-900">{batchedOrders.totalOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-green-600" />
            <div>
              <p className="responsive-text text-gray-600">Delivery Days</p>
              <p className="responsive-heading text-gray-900">{batchedOrders.totalBatches}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-purple-600" />
            <div>
              <p className="responsive-text text-gray-600">Total Value</p>
              <p className="responsive-heading text-gray-900">
                ${Object.values(batchedOrders.batches)
                  .flat()
                  .reduce((sum, order) => sum + order.total, 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block responsive-text font-medium text-gray-700 mb-2">
              Search Orders
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                placeholder="Search by customer name, order number, or ZIP code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="md:w-48">
            <label htmlFor="day-filter" className="block responsive-text font-medium text-gray-700 mb-2">
              Filter by Day
            </label>
            <select
              id="day-filter"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Days</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Delivery Batches */}
      <div className="space-y-6">
        {filteredBatches.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No orders found matching your criteria.</p>
          </div>
        ) : (
          filteredBatches.map(([day, orders]) => (
            <div key={day} className={`border rounded-lg overflow-hidden ${getDayColor(day)}`}>
              <div className="bg-white border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{day}</h3>
                    <span className="bg-blue-100 text-blue-800 responsive-text font-medium px-2.5 py-0.5 rounded-full">
                      {orders.length} orders
                    </span>
                  </div>
                                       <div className="responsive-text text-gray-600">
                       Total: ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                     </div>
                   </div>
                   
                                       {/* Batch Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => generateManifestMutation.mutate(day)}
                        disabled={generateManifestMutation.isPending}
                        className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                        title="Generate delivery manifest"
                      >
                        {generateManifestMutation.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <FileText className="h-3 w-3" />
                        )}
                        Manifest
                      </button>
                      
                                             <button
                         onClick={() => {
                           setSelectedBatchDay(day);
                           setShowStatusModal(true);
                         }}
                         className="flex items-center gap-1 px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                         title="Update batch status"
                       >
                         <Truck className="h-3 w-3" />
                         Status
                       </button>
                       
                       <a
                         href={`/vendor/delivery/${day.toLowerCase()}-${new Date().toISOString().split('T')[0]}`}
                         className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                         title="Start delivery route"
                       >
                         <MapPin className="h-3 w-3" />
                         Start Route
                       </a>
                    </div>
                    
                                         {/* Manifest Actions */}
                     <div className="mt-2 flex gap-4">
                       <button
                         onClick={() => generateManifestPDF(day, orders)}
                         className="text-sm text-blue-600 underline hover:text-blue-800"
                         title="Download manifest as PDF"
                       >
                         Download Manifest PDF
                       </button>
                       <button
                         onClick={() => printManifest(day, orders)}
                         className="text-sm text-green-600 underline hover:text-green-800"
                         title="Print manifest directly"
                       >
                         Print Manifest
                       </button>
                     </div>
                 </div>
              
              <div className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900">{order.orderNumber}</h4>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          {order.etaLabel && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {order.etaLabel}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 responsive-text text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{order.customerName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{order.shippingCity}, {order.shippingState} ({order.shippingZip})</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            <span>{order.items.length} items</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 responsive-text text-gray-600">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-medium">${order.total.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <button
                          onClick={() => window.open(`/dashboard/vendor/orders/${order.id}`, '_blank')}
                          className="text-blue-600 hover:text-blue-800 responsive-text font-medium"
                        >
                          View Details â†’
                        </button>
                      </div>
                    </div>
                    
                    {/* Order Items Preview */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex flex-wrap gap-2">
                        {order.items.map((item) => (
                          <span
                            key={item.id}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                          >
                            {item.quantity}x {item.productName}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Batch Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Update Batch Status</h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                âœ•
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block responsive-text font-medium text-gray-700 mb-2">
                  Batch: {selectedBatchDay}
                </label>
                
                <div className="space-y-2">
                  {['PENDING', 'PACKED', 'LOADED', 'OUT_FOR_DELIVERY', 'COMPLETED'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        updateBatchStatusMutation.mutate({ day: selectedBatchDay, status });
                        setShowStatusModal(false);
                      }}
                      disabled={updateBatchStatusMutation.isPending}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left border rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                      {updateBatchStatusMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </VendorDashboardLayout>
  );
};

export default VendorDeliveryBatchingPage; 
