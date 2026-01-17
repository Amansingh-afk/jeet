import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { Landing } from '@/pages/Landing'
import { Dashboard, DashboardHome } from '@/pages/Dashboard'
import { AskJeet } from '@/pages/AskJeet'

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="jeet-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<DashboardHome />} />
            <Route path="ask" element={<AskJeet />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
