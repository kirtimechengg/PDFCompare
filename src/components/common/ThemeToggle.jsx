import usePDFStore from '../../store/usePDFStore'

export default function ThemeToggle() {
  const { theme, setTheme } = usePDFStore()
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-lg"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  )
}
