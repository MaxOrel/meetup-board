import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { EventCard } from './EventCard.tsx'
import { baseEvent, lowEvent, onlineEvent, soldEvent } from '../../fixtures/events.ts'

// Все состояния билета в изоляции: не нужно искать в каталоге распроданное событие, чтобы проверить штамп
const meta = {
  title: 'Афиша/EventCard',
  component: EventCard,
  tags: ['autodocs'],
  args: { event: baseEvent, isFavorite: false, onToggleFavorite: fn() },
  decorators: [
    (Story) => (
      <div style={{ width: 377 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EventCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Favorite: Story = {
  args: { isFavorite: true },
}

export const LowSeats: Story = {
  name: 'Мало мест',
  args: { event: lowEvent },
}

export const SoldOut: Story = {
  name: 'Мест нет',
  args: { event: soldEvent },
}

export const Online: Story = {
  args: { event: onlineEvent },
}

export const LongTitle: Story = {
  name: 'Длинное название',
  args: { event: { ...baseEvent, title: 'Очень длинное название доклада, которое проверяет перенос строк и выравнивание текста' } },
}
