import { describe, expect, it } from 'vitest'
import { pluralize, seatsLabel } from './format.ts'

// Чистые функции — самые дешёвые тесты: вход → выход, никакого DOM и сети
describe('pluralize', () => {
  const forms: [string, string, string] = ['место', 'места', 'мест']

  // it.each — одна проверка на много случаев. Особенно важны 11–14: там правило ломается.
  it.each([
    [1, 'место'],
    [3, 'места'],
    [5, 'мест'],
    [11, 'мест'],
    [14, 'мест'],
    [21, 'место'],
    [22, 'места'],
    [111, 'мест'],
  ])('%i → %s', (count, expected) => {
    expect(pluralize(count, forms)).toBe(expected)
  })
})

describe('seatsLabel', () => {
  it('нет мест — отдельный текст', () => {
    expect(seatsLabel(0)).toBe('Мест нет')
  })

  it('склоняет число мест', () => {
    expect(seatsLabel(21)).toBe('Осталось 21 место')
    expect(seatsLabel(3)).toBe('Осталось 3 места')
  })
})
