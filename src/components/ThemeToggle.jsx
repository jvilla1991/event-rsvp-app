import { useTheme } from '../contexts/ThemeContext'

function ThemeToggle() {
  const { dark, toggle } = useTheme()

  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? 'Light' : 'Dark'}
    </button>
  )
}

export default ThemeToggle
