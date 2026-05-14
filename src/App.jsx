import { useEffect } from 'react'
import usePDFStore from './store/usePDFStore'
import UploadView from './components/upload/UploadView'
import ComparisonView from './components/comparison/ComparisonView'
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts'

export default function App() {
  const { oldPDF, newPDF, theme, setTheme } = usePDFStore()

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [theme])

  useKeyboardShortcuts()

  const inComparison = oldPDF && newPDF

  return (
    <div className="h-full w-full bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 flex flex-col overflow-hidden">
      {inComparison ? <ComparisonView /> : <UploadView />}
    </div>
  )
}
