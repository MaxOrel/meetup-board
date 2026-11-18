import type { Preview } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router'
import '../src/styles/tokens.css'
import '../src/styles/base.css'

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Проверка доступности (контраст, подписи, aria) — вкладка Accessibility
    a11y: { test: 'todo' },
  },
  globalTypes: {
    theme: {
      description: 'Тема из tokens.css',
      toolbar: { icon: 'mirror', items: ['light', 'dark'], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [
    (Story, context) => {
      document.documentElement.dataset.theme = context.globals.theme as string
      // Карточка и шапка используют Link — им нужен роутер. В историях — в памяти, без адресной строки.
      return (
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      )
    },
  ],
}

export default preview
