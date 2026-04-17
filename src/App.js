import { useState, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import IoTDashboard from './components/IoTDashboard.jsx'

// ─── Theme Context ────────────────────────────────────────────────────────────
export const ThemeContext = createContext({ dark: true, toggle: () => {} })
export const useTheme = () => useContext(ThemeContext)

function App() {
  const [dark, setDark] = useState(true)

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      <div className={dark ? 'theme-dark' : 'theme-light'}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<IoTDashboard />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeContext.Provider>
  )
}

export default App