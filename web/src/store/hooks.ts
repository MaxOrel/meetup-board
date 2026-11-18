import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './index.ts'

// Типизированные хуки: в компонентах используем их вместо useDispatch и useSelector
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
