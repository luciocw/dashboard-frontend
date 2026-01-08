/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SLEEPER_API_URL?: string
  readonly VITE_SLEEPER_CDN_URL?: string
  readonly VITE_IDP_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
