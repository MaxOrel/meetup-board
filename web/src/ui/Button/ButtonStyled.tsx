import styled, { css } from 'styled-components'

// Та же кнопка на styled-components — только для сравнения подходов на вебинаре.
// В приложении используется Button.tsx с CSS-модулем.
interface ButtonStyledProps {
  $variant?: 'primary' | 'ghost'
}

export const ButtonStyled = styled.button.attrs({ type: 'button' })<ButtonStyledProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: 0;
  border-radius: var(--radius-control);
  padding: var(--space-3) var(--space-6);
  font-weight: 600;
  line-height: 1.2;
  cursor: pointer;

  ${({ $variant = 'primary' }) =>
    $variant === 'primary'
      ? css`
          background: var(--color-primary);
          color: var(--color-primary-ink);
        `
      : css`
          background: transparent;
          color: var(--color-primary);
          box-shadow: inset 0 0 0 1.5px currentColor;
        `}

  &:hover {
    filter: brightness(1.1);
  }
`
