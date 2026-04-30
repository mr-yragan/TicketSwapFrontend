import { useEffect, useRef, useState } from 'react'
import { useModal } from '@/context'
import { useAuth } from '@/context'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'
import { Building2, LayoutDashboard, LogIn, LogOut, Menu, PlusCircle, Settings2, Shield, UserPlus, UserRound, X } from 'lucide-react'

const OUTLINE_BUTTON_CLASS = 'bg-white text-black border border-gray-300 px-6 gap-2'

export function Header() {
  const { openModal } = useModal()
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  useEffect(() => {
    if (!mobileMenuOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [mobileMenuOpen])

  const handleProfileClick = () => {
    setSettingsOpen(false)
    setMobileMenuOpen(false)
    navigate('/profile')
  }
  const handleOrganizerClick = () => {
    setSettingsOpen(false)
    setMobileMenuOpen(false)
    navigate('/organizer')
  }
  const handleAdminClick = () => {
    setSettingsOpen(false)
    setMobileMenuOpen(false)
    navigate('/admin')
  }
  const handleLogoClick = () => {
    setSettingsOpen(false)
    setMobileMenuOpen(false)
    navigate('/')
  }
  const handleOpenSettings = () => {
    setSettingsOpen(false)
    setMobileMenuOpen(false)
    navigate('/profile',
      { state: { tab: 'settings' } })
  }

  return (
    <header className="bg-white border-b border-gray-300">
      <div className="mx-auto max-w-350 px-4 py-4 sm:px-6 lg:flex lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center justify-between gap-4 lg:flex-shrink-0">
          <h1
            className="cursor-pointer text-2xl font-bold transition-colors hover:text-gray-700"
            onClick={handleLogoClick}>
            TicketSwap
          </h1>

          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-300 bg-white text-black shadow-sm transition-colors hover:bg-gray-50 lg:hidden"
            onClick={() => setMobileMenuOpen((prev) => !prev)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {isAuthenticated && (
          <div className="mt-4 lg:hidden">
            <Button
              onClick={() => openModal('sell')}
              className="w-full justify-center gap-2 bg-black px-4 text-white">
              <PlusCircle size={18} />
              Продать билет
            </Button>
          </div>
        )}

        <nav className="mt-4 hidden flex-wrap items-center gap-2 sm:gap-3 lg:mt-0 lg:flex">
          {isAuthenticated && (
            <Button
              onClick={() => openModal('sell')}
              className="gap-2 bg-black px-4 text-white sm:px-6">
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

      {mobileMenuOpen && (
        <MobileMenu
          isAuthenticated={isAuthenticated}
          openModal={openModal}
          onAdminClick={handleAdminClick}
          onClose={() => setMobileMenuOpen(false)}
          onOpenSettings={handleOpenSettings}
          onOrganizerClick={handleOrganizerClick}
          onProfileClick={handleProfileClick}
          logout={logout}
          user={user}
        />
      )}
    </header>
  )
}

function AuthenticatedNav({ user, logout, onProfileClick, onOrganizerClick, onAdminClick, settingsOpen, setSettingsOpen, settingsRef, onOpenSettings }) {
  const role = (user?.role || '').toUpperCase()

  return (
    <div className="relative flex w-full flex-wrap items-center gap-2 sm:w-auto">
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
        className="max-w-full truncate rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 transition-colors hover:bg-gray-100 sm:max-w-52">
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
    <div className="flex flex-wrap items-center gap-2">
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

function MobileMenu({ isAuthenticated, logout, onAdminClick, onClose, onOpenSettings, onOrganizerClick, onProfileClick, openModal, user }) {
  const role = (user?.role || '').toUpperCase()

  const handleAction = (action) => {
    onClose()
    action()
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Закрыть меню"
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
        style={{ animation: 'fadeIn 200ms ease-out' }}
      />

      <div
        className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-2xl"
        style={{ animation: 'drawerIn 220ms ease-out' }}>
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
          <div>
            <div className="text-lg font-semibold text-gray-900">Меню</div>
            {isAuthenticated && (
              <div className="mt-1 text-sm text-gray-500">{user?.email || 'Профиль'}</div>
            )}
          </div>
          <button
            type="button"
            aria-label="Закрыть меню"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white text-black"
            onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {isAuthenticated ? (
            <>
              <MobileMenuButton
                icon={<UserRound size={18} />}
                title="Личный кабинет"
                description="Объявления, покупки и профиль"
                onClick={() => handleAction(onProfileClick)}
              />
              <MobileMenuButton
                icon={<Shield size={18} />}
                title="Настройки и безопасность"
                description="Профиль, пароль и 2FA"
                onClick={() => handleAction(onOpenSettings)}
              />

              {role === 'ADMIN' && (
                <MobileMenuButton
                  icon={<LayoutDashboard size={18} />}
                  title="Админ-панель"
                  description="Организаторы, заказы и аудит"
                  onClick={() => handleAction(onAdminClick)}
                />
              )}

              {role === 'ORGANIZER' && (
                <MobileMenuButton
                  icon={<Building2 size={18} />}
                  title="Панель организатора"
                  description="События и подтверждение билетов"
                  onClick={() => handleAction(onOrganizerClick)}
                />
              )}

              <Button
                className="mt-2 w-full justify-center border border-gray-300 bg-white px-4 text-black"
                onClick={() => handleAction(logout)}>
                <LogOut size={18} />
                Выйти
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={() => handleAction(() => openModal('login'))}
                className={`w-full justify-center ${OUTLINE_BUTTON_CLASS}`}>
                <LogIn size={18} />
                Вход
              </Button>
              <Button
                onClick={() => handleAction(() => openModal('register'))}
                className={`w-full justify-center ${OUTLINE_BUTTON_CLASS}`}>
                <UserPlus size={18} />
                Регистрация
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MobileMenuButton({ description, icon, onClick, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 text-left transition-colors hover:bg-gray-50">
      <span className="mt-0.5 shrink-0 text-gray-500">{icon}</span>
      <span>
        <span className="block font-medium text-gray-900">{title}</span>
        <span className="mt-1 block text-sm text-gray-500">{description}</span>
      </span>
    </button>
  )
}
