/// <reference types="vite/client" />

// Типизируем переменные окружения: import.meta.env.VITE_API_URL — string, а не any
interface ImportMetaEnv {
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
