// Predefined tooltip configurations for common analytics metrics
export const AnalyticsTooltips = {
  revenue: {
    title: "Total Revenue",
    content: "Your total income from all sales during the selected period. This includes all product sales, services, and other revenue streams before any deductions.",
    dataSource: "Sales transactions, order data, and payment records from your marketplace account",
    calculation: "Sum of all completed orders × unit price",
    impact: "Primary indicator of business growth and market demand for your products"
  },
  
  profit: {
    title: "Net Profit",
    content: "The amount of money remaining after subtracting all costs (materials, labor, overhead, fees) from your total revenue. This is your actual earnings.",
    dataSource: "Revenue data minus all cost of goods sold (COGS) and operating expenses",
    calculation: "Total Revenue - (COGS + Operating Expenses + Platform Fees)",
    impact: "Measures your business profitability and financial health. Higher profits mean more resources for growth and investment"
  },
  
  margin: {
    title: "Profit Margin",
    content: "The percentage of revenue that becomes profit. Shows how efficiently you're converting sales into earnings.",
    dataSource: "Calculated from revenue and cost data across all transactions",
    calculation: "(Net Profit ÷ Total Revenue) × 100",
    impact: "Indicates pricing efficiency and cost control. Higher margins mean better pricing power and cost management"
  },
  
  netWorth: {
    title: "Net Worth",
    content: "Your total business value calculated as assets minus liabilities. Represents the true value of your business.",
    dataSource: "Balance sheet data including cash, inventory, equipment, and outstanding debts",
    calculation: "Total Assets - Total Liabilities",
    impact: "Shows overall business value and financial stability. Growing net worth indicates healthy business expansion"
  },
  
  cashFlow: {
    title: "Cash Flow",
    content: "The net amount of cash moving in and out of your business. Positive cash flow means more money coming in than going out.",
    dataSource: "Bank account transactions, payment receipts, and expense records",
    calculation: "Cash In - Cash Out",
    impact: "Critical for day-to-day operations. Positive cash flow ensures you can pay bills and invest in growth"
  },
  
  burnRate: {
    title: "Burn Rate",
    content: "How quickly your business is spending money. Shows monthly cash consumption rate and how long your current funds will last.",
    dataSource: "Monthly expense data and current cash balance",
    calculation: "Monthly Expenses ÷ Current Cash Balance",
    impact: "Helps predict when you'll need additional funding. Lower burn rate means longer runway for growth"
  },
  
  customerAcquisition: {
    title: "Customer Acquisition",
    content: "The cost and efficiency of gaining new customers. Measures how much you spend to acquire each new customer.",
    dataSource: "Marketing spend data and new customer registrations",
    calculation: "Total Marketing Spend ÷ New Customers Acquired",
    impact: "Lower acquisition costs mean more efficient marketing and higher profit potential per customer"
  },
  
  inventoryTurnover: {
    title: "Inventory Turnover",
    content: "How quickly you sell through your inventory. Higher turnover means better cash flow and less tied-up capital.",
    dataSource: "Inventory levels and sales data over time",
    calculation: "Cost of Goods Sold ÷ Average Inventory Value",
    impact: "Higher turnover improves cash flow and reduces storage costs. Indicates strong product demand"
  }
};





