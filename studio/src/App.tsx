import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StudioLayout } from '@/components/layout/studio-layout'
import { Toaster } from '@/components/ui/toaster'

// Pages
import { Dashboard } from '@/pages/Dashboard'
import { PatternList } from '@/pages/patterns/index'
import { PatternEdit } from '@/pages/patterns/[id]'
import { PatternNew } from '@/pages/patterns/new'
import { QuestionList } from '@/pages/questions/index'
import { QuestionEdit } from '@/pages/questions/[id]'
import { QuestionNew } from '@/pages/questions/new'
import { TemplateList } from '@/pages/templates/index'
import { TemplateEdit } from '@/pages/templates/[id]'
import { TemplateNew } from '@/pages/templates/new'
import { EmbeddingsPage } from '@/pages/tools/embeddings'
import { ExportPage } from '@/pages/tools/export'
import { PhotoImportPage } from '@/pages/tools/photo-import'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<StudioLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/patterns" element={<PatternList />} />
          <Route path="/patterns/new" element={<PatternNew />} />
          <Route path="/patterns/:id" element={<PatternEdit />} />
          <Route path="/questions" element={<QuestionList />} />
          <Route path="/questions/new" element={<QuestionNew />} />
          <Route path="/questions/:id" element={<QuestionEdit />} />
          <Route path="/templates" element={<TemplateList />} />
          <Route path="/templates/new" element={<TemplateNew />} />
          <Route path="/templates/:id" element={<TemplateEdit />} />
          <Route path="/tools/photo-import" element={<PhotoImportPage />} />
          <Route path="/tools/embeddings" element={<EmbeddingsPage />} />
          <Route path="/tools/export" element={<ExportPage />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}
