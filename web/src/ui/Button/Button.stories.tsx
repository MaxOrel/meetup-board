import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Button } from './Button.tsx'

const meta = {
  title: 'UI-kit/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: 'Записаться', onClick: fn() },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'ghost'] },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Сбросить фильтры' },
}

export const Disabled: Story = {
  args: { disabled: true, children: 'Записываем…' },
}

export const Wide: Story = {
  args: { wide: true },
  parameters: { layout: 'padded' },
}
