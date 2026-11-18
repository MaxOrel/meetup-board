import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { CategoryFilter } from './CategoryFilter.tsx'
import type { CategoryFilterValue } from '../../constants.ts'

const meta = {
  title: 'Афиша/CategoryFilter',
  component: CategoryFilter,
  tags: ['autodocs'],
  args: { value: 'all', onChange: fn() },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CategoryFilter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

// Живая история: состояние хранится в обёртке, как в App
function InteractiveFilter({ onChange }: { onChange: (value: CategoryFilterValue) => void }) {
  const [value, setValue] = useState<CategoryFilterValue>('all')
  return (
    <CategoryFilter
      value={value}
      onChange={(next) => {
        setValue(next)
        onChange(next)
      }}
    />
  )
}

export const Interactive: Story = {
  render: (args) => <InteractiveFilter onChange={args.onChange} />,
}
