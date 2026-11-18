import { useEffect, useState } from 'react'

// Значение «догоняет» исходное через delay мс тишины.
// Печатаем «react» быстро — наружу выйдет одно значение, а не пять.
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    // Новая буква раньше срока — старый таймер отменяется
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
