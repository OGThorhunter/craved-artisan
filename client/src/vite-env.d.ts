/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_FEATURE_LIVE_PRODUCTS?: string
  readonly VITE_FEATURE_LIVE_ANALYTICS?: string
  readonly VITE_FEATURE_FINANCIALS?: string
  readonly VITE_FEATURE_MESSAGING?: string
  readonly VITE_FEATURE_CHECKOUT?: string
  readonly VITE_FEATURE_INVENTORY?: string
  readonly VITE_FEATURE_SMART_RESTOCK?: string
  readonly VITE_FEATURE_PORTFOLIO?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}