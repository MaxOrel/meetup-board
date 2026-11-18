import { defineConfig } from 'cypress'

// e2e — настоящий браузер, настоящий фронт и настоящий API. Перед запуском:
//   server: npm run db:up && npm run start:dev   (API на :3000)
//   web:    npm run dev                          (сайт на :5173)
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    video: false,
    supportFile: false, // общих команд пока нет
  },
})
