import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Chip } from './Chip.tsx'

const meta = {
  title: 'UI-kit/Chip',
  component: Chip,
  tags: ['autodocs'],
  args: { children: 'Фронтенд', onClick: fn() },
} satisfies Meta<typeof Chip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Pressed: Story = {
  args: { pressed: true },
}

export const WithCount: Story = {
  args: { count: 10 },
}
