import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button.tsx'
import { ButtonStyled } from './ButtonStyled.tsx'

// Одна и та же кнопка двумя способами: снаружи не отличить, разница — в том, где живут стили
const meta = {
  title: 'UI-kit/Button/Сравнение подходов',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

export const CssModulesVsStyledComponents: StoryObj = {
  name: 'CSS-модули и styled-components',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, max-content)', gap: 24, alignItems: 'center' }}>
      <p>CSS-модуль</p>
      <p>styled-components</p>
      <Button>Записаться</Button>
      <ButtonStyled>Записаться</ButtonStyled>
      <Button variant="ghost">Сбросить</Button>
      <ButtonStyled $variant="ghost">Сбросить</ButtonStyled>
    </div>
  ),
}
