/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KRATOS_PUBLIC_URL: string
  readonly VITE_FIMS_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
