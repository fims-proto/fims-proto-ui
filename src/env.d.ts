/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@vue/runtime-dom' {
  interface HTMLAttributes {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }
}

declare module '@vue/runtime-core' {
  interface AllowedComponentProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }
}

interface ImportMetaEnv {
  readonly VITE_KRATOS_PUBLIC_URL: string
  readonly VITE_FIMS_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

export {}
