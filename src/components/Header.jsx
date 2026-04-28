import { useEffect, useRef, useState } from 'react'
import { useModal } from '@/context'
import { useAuth } from '@/context'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'
import { LogIn, PlusCircle, Settings2, Shield, UserPlus, UserRound } from 'lucide-react'

const OUTLINE_BUTTON_CLASS = 'bg-white text-black border border-gray-300 px-6 gap-2'

export function Header() {
  const { openModal } = useModal()
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setSettingsOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setSettingsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const handleProfileClick = () => navigate('/profile')
  const handleOrganizerClick = () => navigate('/organizer')
  const handleAdminClick = () => navigate('/admin')
  const handleLogoClick = () => navigate('/')
  const handleOpenSettings = () => {
    setSettingsOpen(false)
    navigate('/profile',
      { state: { tab: 'settings' } })
  }

  return (
    <header className="bg-white border-b border-gray-300">
      <div className="max-w-350 mx-auto px-8 py-4 flex justify-between items-center">
        <h1
          className="text-2xl font-bold cursor-pointer hover:text-gray-700 transition-colors"
          onClick={handleLogoClick}>
          TicketSwap
        </h1>
        <nav className="flex gap-3">
          {isAuthenticated && (
            <Button
              onClick={() => openModal('sell')}
              className="bg-black text-white px-6 gap-2">
              <PlusCircle size={18} />
              Продать билет
            </Button>
          )}

          {isAuthenticated ? (
            <AuthenticatedNav
              user={user}
              logout={logout}
              onProfileClick={handleProfileClick}
              onOrganizerClick={handleOrganizerClick}
              onAdminClick={handleAdminClick}
              settingsOpen={settingsOpen}
              setSettingsOpen={setSettingsOpen}
              settingsRef={settingsRef}
              onOpenSettings={handleOpenSettings}
            />
          ) : (
            <GuestNav openModal={openModal} />
          )}
        </nav>
      </div>
    </header>
  )
}

function AuthenticatedNav({ user, logout, onProfileClick, onOrganizerClick, onAdminClick, settingsOpen, setSettingsOpen, settingsRef, onOpenSettings }) {
  const role = (user?.role || '').toUpperCase()

  return (
    <div className="flex items-center gap-2 relative">
      <div ref={settingsRef} className="relative">
        <Button
          type="button"
          aria-label="Открыть меню настроек"
          className="h-11 w-11 bg-white px-0 text-black border border-gray-300"
          onClick={() => setSettingsOpen((prev) => !prev)}>
          <Settings2 size={18} />
        </Button>

        {settingsOpen && (
          <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
            <button
              type="button"
              onClick={() => {
                setSettingsOpen(false)
                onProfileClick()
              }}
              className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors">
              <UserRound size={18} className="mt-0.5 shrink-0 text-gray-500" />
              <div>
                <div className="font-medium text-gray-900">Личный кабинет</div>
                <div className="text-sm text-gray-500 mt-1">Объявления, покупки и профиль</div>
              </div>
            </button>
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex w-full items-start gap-3 border-t border-gray-100 px-4 py-3 text-left hover:bg-gray-50 transition-colors">
              <Shield size={18} className="mt-0.5 shrink-0 text-gray-500" />
              <div>
                <div className="font-medium text-gray-900">Настройки и безопасность</div>
                <div className="text-sm text-gray-500 mt-1">Профиль, 2FA и защита входа</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {role === 'ADMIN' && (
        <Button
          type="button"
          className="bg-white text-black border border-gray-300 px-4"
          onClick={onAdminClick}>
          Админ-панель
        </Button>
      )}

      {role === 'ORGANIZER' && (
        <Button
          type="button"
          className="bg-white text-black border border-gray-300 px-4"
          onClick={onOrganizerClick}>
          Панель организатора
        </Button>
      )}

      <button
        onClick={onProfileClick}
        className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 bg-gray-50 hover:bg-gray-100 transition-colors">
        {user?.email || 'Профиль'}
      </button>
      <Button
        className="bg-white text-black border border-gray-300 px-4"
        onClick={logout}>
        Выйти
      </Button>
    </div>
  )
}

function GuestNav({ openModal }) {
  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => openModal('login')}
        className={OUTLINE_BUTTON_CLASS}>
        <LogIn size={18} />
        Вход
      </Button>
      <Button
        onClick={() => openModal('register')}
        className={OUTLINE_BUTTON_CLASS}>
        <UserPlus size={18} />
        Регистрация
      </Button>
    </div>
  )
}
