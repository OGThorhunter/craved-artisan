export const flags = {
  LIVE_PRODUCTS: import.meta.env.VITE_FEATURE_LIVE_PRODUCTS === 'true',
  LIVE_ANALYTICS: import.meta.env.VITE_FEATURE_LIVE_ANALYTICS === 'true',
  FINANCIALS: import.meta.env.VITE_FEATURE_FINANCIALS === 'true',
  PRODUCT_ANALYTICS: import.meta.env.VITE_FEATURE_PRODUCT_ANALYTICS === 'true',
  INVENTORY: import.meta.env.VITE_FEATURE_INVENTORY === 'true',
  SMART_RESTOCK: import.meta.env.VITE_FEATURE_SMART_RESTOCK === 'true',
  MESSAGING: import.meta.env.VITE_FEATURE_MESSAGING === 'true',
  CHECKOUT: import.meta.env.VITE_FEATURE_CHECKOUT === 'true',
};
