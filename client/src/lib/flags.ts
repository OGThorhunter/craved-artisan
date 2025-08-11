export const flags = {
  LIVE_PRODUCTS: import.meta.env.VITE_FEATURE_LIVE_PRODUCTS === 'true',
  LIVE_ANALYTICS: import.meta.env.VITE_FEATURE_LIVE_ANALYTICS === 'true',
  FINANCIALS: import.meta.env.VITE_FEATURE_FINANCIALS === 'true',
  CHECKOUT: import.meta.env.VITE_FEATURE_CHECKOUT === 'true',
};
