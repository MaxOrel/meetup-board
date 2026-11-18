import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { SearchField } from './SearchField.tsx'

// Контролируемое поле проверяем вместе с состоянием — так, как его использует страница
function Harness() {
  const [value, setValue] = useState('')
  return (
    <>
      <SearchField value={value} onChange={setValue} />
      <p>Ищем: {value}</p>
    </>
  )
}

describe('SearchField', () => {
  it('поле находится по подписи и передаёт введённый текст', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    // user-event печатает по буквам, как человек: keydown → input → keyup
    await user.type(screen.getByRole('searchbox', { name: 'Поиск по событиям' }), 'react')

    expect(screen.getByText('Ищем: react')).toBeInTheDocument()
  })
})
