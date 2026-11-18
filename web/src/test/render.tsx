import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { makeStore } from '../store/index.ts'

// Рендер «как в приложении»: свой store и роутер на нужном адресе
export function renderWithProviders(ui: ReactElement, { route = '/' }: { route?: string } = {}) {
  const store = makeStore()
  const result = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </Provider>,
  )
  return { store, ...result }
}
