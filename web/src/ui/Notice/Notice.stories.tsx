import type { Meta, StoryObj } from '@storybook/react-vite'
import { Notice } from './Notice.tsx'
import { Button } from '../Button/Button.tsx'

const meta = {
  title: 'UI-kit/Notice',
  component: Notice,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Notice>

export default meta
type Story = StoryObj<typeof meta>

export const LoadError: Story = {
  name: 'Ошибка загрузки',
  args: {
    variant: 'error',
    title: 'Не удалось загрузить события',
    children: 'Сервер не ответил за 10 секунд. Проверьте подключение и попробуйте ещё раз.',
    action: <Button>Повторить</Button>,
  },
}

export const Empty: Story = {
  args: {
    variant: 'empty',
    title: 'Под эти фильтры событий нет',
    children: 'Попробуйте другой город или категорию.',
    action: <Button variant="ghost">Сбросить фильтры</Button>,
  },
}

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Вы записаны',
    children: 'Билет отправили на anna@example.com. Напомним за день до события.',
  },
}
