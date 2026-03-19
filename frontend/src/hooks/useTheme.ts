import { useContext } from 'react'
import { ThemeContext, type ThemeContextValue } from '../components/layout/ThemeContext'

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}
