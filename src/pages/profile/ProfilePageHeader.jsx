import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui'
import { Settings2, Shield, UserRound } from 'lucide-react'

export function ProfilePageHeader({
  userEmail,
  emailVerified,
  verificationLoading,
  onResendVerification,
  activeTab,
  onTabChange,
  onOpenSettings,
  ordersSupported,
  counts,
}) {
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

  const handleOpenSettings = (section) => {
    setSettingsOpen(false)
    onOpenSettings(section)
  }

  return (
    <div className="mb-6 rounded-2xl bg-white p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Личный кабинет</h1>
          <p className="text-sm text-gray-500">Пользователь: {userEmail || 'гость'}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-700">Подтверждение email:</span>
            <span className={emailVerified ? 'text-sm font-medium text-green-700' : 'text-sm font-medium text-orange-700'}>
              {emailVerified ? 'подтвержден' : 'не подтвержден'}
            </span>
            {!emailVerified && (
              <Button
                onClick={onResendVerification}
                disabled={verificationLoading}
                className="h-10 bg-gray-100 px-4 py-2 text-gray-800 hover:bg-gray-200">
                {verificationLoading ? 'Отправка...' : 'Отправить письмо ещё раз'}
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <Button
            onClick={() => onTabChange('my-listings')}
            className={activeTab === 'my-listings' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}>
            Мои объявления ({counts.listings})
          </Button>
          <Button
            onClick={() => onTabChange('archived-listings')}
            className={activeTab === 'archived-listings' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}>
            Архив объявлений ({counts.archivedListings})
          </Button>
          <Button
            onClick={() => onTabChange('active-holds')}
            className={activeTab === 'active-holds' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}>
            Резервы ({counts.holds})
          </Button>
          <Button
            onClick={() => onTabChange('upcoming-purchases')}
            className={activeTab === 'upcoming-purchases' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}>
            Предстоящие события ({counts.upcomingPurchases})
          </Button>
          <Button
            onClick={() => onTabChange('past-purchases')}
            className={activeTab === 'past-purchases' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}>
            Прошедшие события ({counts.pastPurchases})
          </Button>
          {ordersSupported && (
            <Button
              onClick={() => onTabChange('orders')}
              className={activeTab === 'orders' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}>
              Заказы ({counts.orders})
            </Button>
          )}

          <div ref={settingsRef} className="relative">
            <Button
              type="button"
              aria-label="Открыть настройки"
              onClick={() => setSettingsOpen((prev) => !prev)}
              className={activeTab === 'settings' || settingsOpen
                ? 'h-11 w-11 bg-black px-0 text-white'
                : 'h-11 w-11 bg-gray-100 px-0 text-gray-700 hover:bg-gray-200'}>
              <Settings2 size={18} />
            </Button>

            {settingsOpen && (
              <div className="absolute right-0 top-full z-20 mt-2 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                <button
                  type="button"
                  onClick={() => handleOpenSettings('profile')}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50">
                  <UserRound size={18} className="mt-0.5 shrink-0 text-gray-500" />
                  <span>
                    <span className="block font-medium text-gray-900">Настройки профиля</span>
                    <span className="mt-1 block text-sm text-gray-500">Логин и основные данные аккаунта</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenSettings('security')}
                  className="flex w-full items-start gap-3 border-t border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50">
                  <Shield size={18} className="mt-0.5 shrink-0 text-gray-500" />
                  <span>
                    <span className="block font-medium text-gray-900">Безопасность</span>
                    <span className="mt-1 block text-sm text-gray-500">2FA и подтверждение доступа</span>
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
        <Settings2 size={14} />
        <span>Шестерёнка справа открывает разделы настроек аккаунта.</span>
      </div>
    </div>
  )
}
