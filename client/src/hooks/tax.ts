export async function getTaxQuote(payload: { customer: any; items: any[] }) {
  const r = await fetch("/api/tax/quote", {
    method: "POST", 
    headers: { "Content-Type": "application/json" }, 
    body: JSON.stringify(payload)
  });
  return r.json();
}
