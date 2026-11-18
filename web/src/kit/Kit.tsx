import type { ReactNode } from 'react'
import { Button } from '../ui/Button/Button.tsx'
import { Chip } from '../ui/Chip/Chip.tsx'
import { Notice } from '../ui/Notice/Notice.tsx'

// Витрина UI-kit: каждый компонент во всех состояниях на одной странице.
// Открывается по адресу /kit.html — искать нужные события в каталоге не нужно.
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <h2 style={{ font: '700 var(--text-l) / 1.3 var(--font-display)' }}>{title}</h2>
      {children}
    </section>
  )
}

const row = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-3)' } as const

export function Kit() {
  return (
    <main className="container" style={{ display: 'grid', gap: 'var(--space-8)', paddingBlock: 'var(--space-8)' }}>
      <h1 style={{ font: '700 var(--text-xl) / 1.2 var(--font-display)' }}>Витрина UI-kit</h1>

      <Section title="Button">
        <div style={row}>
          <Button>Primary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Disabled</Button>
        </div>
        <Button wide>На всю ширину</Button>
      </Section>

      <Section title="Chip">
        <div style={row}>
          <Chip>Не выбран</Chip>
          <Chip pressed>Выбран</Chip>
          <Chip count={12}>Со счётчиком</Chip>
        </div>
      </Section>

      <Section title="Notice">
        <Notice variant="error" title="Не удалось загрузить события" action={<Button>Повторить</Button>}>
          Проверьте, что API запущен, и попробуйте ещё раз.
        </Notice>
        <Notice variant="empty" title="В этой категории пока нет событий" action={<Button variant="ghost">Показать все</Button>} />
        <Notice variant="success" title="Вы записаны">
          Письмо с билетом придёт на почту.
        </Notice>
      </Section>
    </main>
  )
}
