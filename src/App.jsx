import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ModalProvider, useModal } from './context/ModalContext'
import { AuthProvider } from './context/AuthContext'
import { Header } from './components/Header'
import { LoginModal } from './components/LoginModal'
import { RegisterModal } from './components/RegisterModal'
import { SellTicketModal } from './components/SellTicketModal'
import HomePage from './pages/HomePage'
import TicketDetailPage from './pages/TicketDetailPage'
import ProfilePage from './pages/ProfilePage'
import { TicketsRefreshProvider } from '@/context/TicketsRefreshContext';

function AppContent() {
  const { currentModal } = useModal()

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ticket/:id" element={<TicketDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
      </Routes>

      {currentModal === 'login' && <LoginModal />}
      {currentModal === 'register' && <RegisterModal />}
        {currentModal === 'sell' && <SellTicketModal />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <TicketsRefreshProvider>
        <ModalProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </ModalProvider>
      </TicketsRefreshProvider>
    </AuthProvider>
  )
}
