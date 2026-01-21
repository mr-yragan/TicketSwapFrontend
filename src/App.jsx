import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ModalProvider, useModal } from './context/ModalContext'
import { AuthProvider } from './context/AuthContext'
import { Header } from './components/Header'
import { LoginModal } from './components/LoginModal'
import { RegisterModal } from './components/RegisterModal'
import HomePage from './pages/HomePage'
import TicketDetailPage from './pages/TicketDetailPage'

function AppContent() {
  const { currentModal } = useModal()

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ticket/:id" element={<TicketDetailPage />} />
      </Routes>

      {currentModal === 'login' && <LoginModal />}
      {currentModal === 'register' && <RegisterModal />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ModalProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ModalProvider>
    </AuthProvider>
  )
}
