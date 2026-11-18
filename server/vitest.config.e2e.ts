import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    // Отдельная база для тестов: тесты чистят таблицу, рабочие данные не трогаем
    globalSetup: ['./test/global-setup.ts'],
    env: {
      DATABASE_URL: 'postgres://meetup:meetup@localhost:5437/meetup_test',
      SEED_FILE: 'data/events.json', // 60 событий — быстро и предсказуемо
    },
    fileParallelism: false,
  },
});
