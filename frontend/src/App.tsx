import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { Landing } from '@/pages/Landing'
import { Dashboard, DashboardHome } from '@/pages/Dashboard'
import { AskJeet } from '@/pages/AskJeet'
import { Topics } from '@/pages/Topics'
import { SubjectTopics } from '@/pages/SubjectTopics'
import { TopicDetail } from '@/pages/TopicDetail'
import { Practice } from '@/pages/Practice'
import { QuickPractice } from '@/pages/QuickPractice'
import { History } from '@/pages/History'

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="jeet-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<DashboardHome />} />
            <Route path="ask" element={<AskJeet />} />
            <Route path="topics" element={<Topics />} />
            <Route path="topics/:subject" element={<SubjectTopics />} />
            <Route path="topics/:subject/:topic" element={<TopicDetail />} />
            <Route path="practice" element={<Practice />} />
            <Route path="practice/daily" element={<Practice />} />
            <Route path="practice/quick" element={<QuickPractice />} />
            <Route path="history" element={<History />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
