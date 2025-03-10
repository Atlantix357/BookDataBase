import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout'
import { BookList } from './pages/book-list'
import { Dashboard } from './pages/dashboard'
import { BookShelf } from './pages/book-shelf'
import { Settings } from './pages/settings'
import { NotFound } from './pages/not-found'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<BookList />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="bookshelf" element={<BookShelf />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
