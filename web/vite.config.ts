import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vitest берёт настройки Vite: те же плагины, алиасы и CSS-модули, что и в приложении.
  // API тестов совпадает с Jest: describe, it, expect; вместо jest.fn — vi.fn.
  test: {
    environment: 'jsdom', // браузерный DOM в Node: document, window, события
    setupFiles: ['./src/test/setup.ts'],
    css: { modules: { classNameStrategy: 'non-scoped' } }, // в тестах классы без хеша
  },
})
