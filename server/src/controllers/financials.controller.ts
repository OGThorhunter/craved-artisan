import { Request, Response } from 'express';
import { pnl, cashFlow, balanceSheet } from "../services/financials.service";
import LRU from "lru-cache";

const cache = new LRU<string, any>({ ttl: 30_000, max: 200 });

export async function getPNL(req: Request, res: Response) {
  const { vendorId } = req.params;
  const { from, to } = req.query as any;
  const key = `pnl:${vendorId}:${from || ""}:${to || ""}`;
  
  if (cache.has(key)) return res.json(cache.get(key));
  
  const data = await pnl(vendorId, { 
    from: from ? new Date(from) : undefined, 
    to: to ? new Date(to) : undefined 
  });
  
  cache.set(key, data); 
  res.json(data);
}

export async function getCashFlow(req: Request, res: Response) {
  const { vendorId } = req.params;
  const { from, to, method = "direct" } = req.query as any;
  const key = `cf:${vendorId}:${from || ""}:${to || ""}:${method}`;
  
  if (cache.has(key)) return res.json(cache.get(key));
  
  const data = await cashFlow(vendorId, { 
    from: from ? new Date(from) : undefined, 
    to: to ? new Date(to) : undefined 
  }, method);
  
  cache.set(key, data); 
  res.json(data);
}

export async function getBalanceSheet(req: Request, res: Response) {
  const { vendorId } = req.params;
  const { asOf } = req.query as any;
  const key = `bs:${vendorId}:${asOf}`;
  
  if (cache.has(key)) return res.json(cache.get(key));
  
  const data = await balanceSheet(vendorId, new Date(asOf));
  
  cache.set(key, data); 
  res.json(data);
}

export async function downloadPNLcsv(req: Request, res: Response) {
  const { vendorId } = req.params;
  const { from, to } = req.query as any;
  const data = await pnl(vendorId, { 
    from: from ? new Date(from) : undefined, 
    to: to ? new Date(to) : undefined 
  });
  
  // Flatten the data for CSV
  const csvData = [{
    "Period From": data.period.from.toISOString().split('T')[0],
    "Period To": data.period.to.toISOString().split('T')[0],
    "Revenue": data.revenue,
    "COGS": data.cogs,
    "Platform Fees": data.fees.platform,
    "Stripe Fees": data.fees.stripe,
    "Total Fees": data.fees.total,
    "Gross Profit": data.grossProfit,
    "Total Expenses": data.expenses,
    "Net Income": data.netIncome
  }];
  
  // Convert to CSV
  const headers = Object.keys(csvData[0]);
  const csv = [
    headers.join(','),
    ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
  ].join('\n');
  
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=pnl-${vendorId}-${new Date().toISOString().split('T')[0]}.csv`);
  res.send(csv);
}

export async function downloadCashFlowCsv(req: Request, res: Response) {
  const { vendorId } = req.params;
  const { from, to, method = "direct" } = req.query as any;
  const data = await cashFlow(vendorId, { 
    from: from ? new Date(from) : undefined, 
    to: to ? new Date(to) : undefined 
  }, method);
  
  // Flatten the data for CSV based on method
  let csvData;
  if (data.method === "direct") {
    csvData = [{
      "Period From": data.period.from.toISOString().split('T')[0],
      "Period To": data.period.to.toISOString().split('T')[0],
      "Sales Inflows": data.inflows.sales,
      "COGS Outflows": data.outflows.cogs,
      "Fees Outflows": data.outflows.fees,
      "Net Cash Flow": data.net
    }];
  } else {
    csvData = [{
      "Period From": data.period.from.toISOString().split('T')[0],
      "Period To": data.period.to.toISOString().split('T')[0],
      "Net Income": data.netIncome,
      "Working Capital Change": data.adjustments.deltaWorkingCapital,
      "Net Cash Flow": data.net
    }];
  }
  
  // Convert to CSV
  const headers = Object.keys(csvData[0]);
  const csv = [
    headers.join(','),
    ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
  ].join('\n');
  
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=cashflow-${vendorId}-${new Date().toISOString().split('T')[0]}.csv`);
  res.send(csv);
}
