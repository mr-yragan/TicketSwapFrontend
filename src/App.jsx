import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, ModalProvider, TicketsRefreshProvider, useModal } from '@/context'
import { Header } from './components/Header'
import { LoginModal } from './components/LoginModal'
import { RegisterModal } from './components/RegisterModal'
import { SellTicketModal } from './components/SellTicketModal'
import { TwoFactorModal } from './components/TwoFactorModal'
import { ForgotPasswordModal } from './components/ForgotPasswordModal'
import { EditListingModal } from './components/EditListingModal'
import { ConfirmActionModal } from './components/ConfirmActionModal'
import ErrorBoundary from './components/ErrorBoundary'
import HomePage from './pages/HomePage'
import TicketDetailPage from './pages/TicketDetailPage'
import ProfilePage from './pages/ProfilePage'
import OrganizerPage from './pages/OrganizerPage'
import AdminPage from './pages/AdminPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import VerifyEmailPage from './pages/VerifyEmailPage'

/*
  Корневая точка фронта:
  - маршруты рендерятся здесь;
  - глобальные модалки монтируются здесь же, чтобы их можно было открыть из любого места;
  - providers оборачивают приложение снаружи и дают auth/modal/refresh-контекст всем страницам.
*/
function AppContent() {
  const { currentModal, confirmation } = useModal()

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ticket/:id" element={<TicketDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/organizer" element={<OrganizerPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Routes>

      {currentModal === 'login' && <LoginModal />}
      {currentModal === 'register' && <RegisterModal />}
      {currentModal === 'sell' && <SellTicketModal />}
      {currentModal === 'editListing' && <EditListingModal />}
      {currentModal === 'twoFactor' && <TwoFactorModal />}
      {currentModal === 'forgotPassword' && <ForgotPasswordModal />}
      {confirmation && <ConfirmActionModal />}
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <TicketsRefreshProvider>
          <ModalProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </ModalProvider>
        </TicketsRefreshProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
