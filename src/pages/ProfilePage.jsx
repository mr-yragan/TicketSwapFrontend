import { useEffect, useState } from 'react'
import { useAuth, useModal } from '@/context'
import { authApi, listingsApi, profileApi, purchaseApi, purchasesApi, twoFactorApi } from '@/api'
import { formatErrorMessage } from '@/api/formatters'
import { useLocation, useNavigate } from 'react-router-dom'
import { ProfilePageHeader } from './profile/ProfilePageHeader'
import { ProfilePageAlerts } from './profile/ProfilePageAlerts'
import { ProfilePageTabs } from './profile/ProfilePageTabs'

const LOGIN_PATTERN = /^(?!.*@)[A-Za-z0-9_.-]+$/

export default function ProfilePage() {
  const { user, logout } = useAuth() || {}
  const { openModal } = useModal()
  const location = useLocation()
  const navigate = useNavigate()
  const [activeListings, setActiveListings] = useState([])
  const [archivedListings, setArchivedListings] = useState([])
  const [upcomingPurchases, setUpcomingPurchases] = useState([])
  const [pastPurchases, setPastPurchases] = useState([])
  const [activeHolds, setActiveHolds] = useState([])
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [ordersSupported, setOrdersSupported] = useState(true)
  const [ordersError, setOrdersError] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [tab, setTab] = useState('upcoming-purchases')
  const [settingsSection, setSettingsSection] = useState('profile')
  const [holdActionId, setHoldActionId] = useState(null)
  const [verificationLoading, setVerificationLoading] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [twoFactorLoading, setTwoFactorLoading] = useState(false)
  const [twoFactorSupported, setTwoFactorSupported] = useState(true)
  const [profileForm, setProfileForm] = useState({ login: '' })
  const [profileSaving, setProfileSaving] = useState(false)

  // Используем emailVerified из user (AuthContext), не из локального состояния
  const emailVerified = user?.emailVerified ?? false

  useEffect(() => {
    if (!user) return

    const loadTickets = async () => {
      setLoading(true)
      setError('')
      setOrdersError('')
      try {
        const profile = await profileApi.getProfile()
        const legacyProfileShape = Object.prototype.hasOwnProperty.call(profile ?? {}, 'phoneNumber')

        setOrdersSupported(!legacyProfileShape)
        // Обновляем только профиль-форму, но не переписываем emailVerified
        setProfileForm({
          login: profile?.login || '',
        })

        const twoFactorStatus = await twoFactorApi.getTwoFactorStatus()
        if (twoFactorStatus?.unsupported) {
          setTwoFactorSupported(false)
        } else if (twoFactorStatus?.unavailable) {
          setTwoFactorSupported(false)
        } else if (typeof twoFactorStatus?.twoFactorEnabled === 'boolean') {
          setTwoFactorEnabled(twoFactorStatus.twoFactorEnabled)
          setTwoFactorSupported(true)
        } else {
          setTwoFactorSupported(false)
        }

        const [
          activeListingsData,
          archivedListingsData,
          activePurchasesData,
          archivedPurchasesData,
          holdsData,
        ] = await Promise.all([
          listingsApi.getMyListings('active'),
          listingsApi.getMyListings('archived'),
          purchasesApi.getMyPurchases('active'),
          purchasesApi.getMyPurchases('archived'),
          purchasesApi.getMyHolds(),
        ])

        setActiveListings(Array.isArray(activeListingsData) ? activeListingsData : [])
        setArchivedListings(Array.isArray(archivedListingsData) ? archivedListingsData : [])
        setUpcomingPurchases(Array.isArray(activePurchasesData) ? activePurchasesData : [])
        setPastPurchases(Array.isArray(archivedPurchasesData) ? archivedPurchasesData : [])
        setActiveHolds(Array.isArray(holdsData) ? holdsData : [])

        if (legacyProfileShape) {
          setPurchaseOrders([])
          return
        }

        try {
          const ordersData = await purchasesApi.getMyOrders()
          setPurchaseOrders(Array.isArray(ordersData) ? ordersData : [])
        } catch (ordersFetchError) {
          console.error('Ошибка загрузки журнала заказов:', ordersFetchError)

          const status = ordersFetchError?.response?.status
          if (status === 401 || status === 403) {
            throw ordersFetchError
          }

          setPurchaseOrders([])
          setOrdersError('Журнал заказов временно недоступен. Остальные разделы кабинета загружены.')
        }
      } catch (e) {
        console.error('Ошибка загрузки билетов:', e)
        const status = e?.response?.status
        if (status === 401 || status === 403) {
          setError('Сессия истекла. Войдите снова.')
        } else {
          setError(e?.response?.data?.message || e.message || 'Не удалось загрузить билеты')
        }
      } finally {
        setLoading(false)
      }
    }

    loadTickets()
  }, [user])

  useEffect(() => {
    if (!ordersSupported && tab === 'orders') {
      setTab('upcoming-purchases')
    }
  }, [ordersSupported, tab])

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
    }
    if (location.state?.tab) {
      setTab(location.state.tab)
    }
    if (location.state?.settingsSection) {
      setSettingsSection(location.state.settingsSection)
    }
    window.history.replaceState({}, document.title)
  }, [location])

  const handleOpenSettings = (section = 'profile') => {
    setSettingsSection(section)
    setTab('settings')
  }

  const handleReleaseHold = async (hold) => {
    const listingId = hold?.listing?.id
    if (!listingId) {
      setError('Не удалось определить объявление для снятия резерва')
      return
    }

    setHoldActionId(hold.id)
    setError('')

    try {
      await purchaseApi.releaseHold(listingId)
      setActiveHolds((current) => current.filter((item) => item.id !== hold.id))
      setSuccessMessage('Резерв снят')
    } catch (releaseError) {
      console.error('Ошибка снятия резерва:', releaseError)
      setError(formatErrorMessage(releaseError, 'Не удалось снять резерв'))
    } finally {
      setHoldActionId(null)
    }
  }

  const handleResendVerification = async () => {
    if (!user?.email) return

    setVerificationLoading(true)
    setError('')

    try {
      const result = await authApi.resendVerification(user.email)
      if (!result.success) {
        setError(result.error || 'Не удалось отправить письмо подтверждения')
        return
      }

      setSuccessMessage(result.data?.message || 'Письмо подтверждения отправлено')
    } catch (e) {
      console.error('Ошибка отправки письма подтверждения:', e)
      setError(e?.response?.data?.message || 'Не удалось отправить письмо подтверждения')
    } finally {
      setVerificationLoading(false)
    }
  }

  const handleToggleTwoFactor = async (nextValue, password) => {
    if (!twoFactorSupported) {
      setError('Настройка 2FA недоступна в текущей версии бэкенда')
      return
    }

    const normalizedPassword = typeof password === 'string' ? password.trim() : ''
    if (!normalizedPassword) {
      setError('Введите текущий пароль, чтобы изменить настройку 2FA')
      return
    }

    const targetState = typeof nextValue === 'boolean' ? nextValue : !twoFactorEnabled
    setTwoFactorLoading(true)
    setError('')

    try {
      const response = targetState
        ? await twoFactorApi.enableTwoFactor(normalizedPassword)
        : await twoFactorApi.disableTwoFactor(normalizedPassword)

      if (response?.unsupported) {
        setTwoFactorSupported(false)
        setError('Настройка 2FA недоступна в текущей версии бэкенда')
        return
      }

      const resolvedState = Boolean(response?.twoFactorEnabled)
      setTwoFactorEnabled(resolvedState)
      logout?.()
      navigate('/', { replace: true })
      openModal('login', {
        message: resolvedState
          ? 'Двухэтапная аутентификация включена. Войдите снова, чтобы продолжить.'
          : 'Двухэтапная аутентификация отключена. Войдите снова, чтобы продолжить.',
      })
    } catch (e) {
      console.error('Ошибка обновления 2FA:', e)
      setError(e?.response?.data?.message || 'Не удалось обновить настройки 2FA')
    } finally {
      setTwoFactorLoading(false)
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setProfileSaving(true)
    setError('')

    const login = (profileForm.login || '').trim()

    if (login && (!LOGIN_PATTERN.test(login) || login.length < 3 || login.length > 32)) {
      setError('Логин: 3-32 символа, только буквы, цифры и символы _. -, без @')
      setProfileSaving(false)
      return
    }

    try {
      const updated = await profileApi.updateProfile({ login })
      setProfileForm({
        login: updated?.login || '',
      })
      setSuccessMessage('Профиль обновлен')
    } catch (e) {
      console.error('Ошибка обновления профиля:', e)
      if (e?.response?.status === 401) {
        setError('Сессия истекла. Войдите снова.')
        logout?.()
      } else {
        setError(formatErrorMessage(e, 'Не удалось обновить профиль'))
      }
    } finally {
      setProfileSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <ProfilePageHeader
          userEmail={user?.email}
          emailVerified={emailVerified}
          verificationLoading={verificationLoading}
          onResendVerification={handleResendVerification}
          activeTab={tab}
          onTabChange={setTab}
          onOpenSettings={handleOpenSettings}
          ordersSupported={ordersSupported}
          counts={{
            listings: activeListings.length,
            archivedListings: archivedListings.length,
            holds: activeHolds.length,
            upcomingPurchases: upcomingPurchases.length,
            pastPurchases: pastPurchases.length,
            orders: purchaseOrders.length,
          }}
        />

        <ProfilePageAlerts
          successMessage={successMessage}
          onClearSuccess={() => setSuccessMessage('')}
          error={error}
          onClearError={() => setError('')}
        />

        {loading ? (
          <div className="p-6 bg-white rounded-xl text-center text-gray-600">
            Загрузка билетов...
          </div>
        ) : (
          <ProfilePageTabs
            tab={tab}
            tickets={activeListings}
            archivedListings={archivedListings}
            upcomingPurchases={upcomingPurchases}
            pastPurchases={pastPurchases}
            activeHolds={activeHolds}
            purchaseOrders={purchaseOrders}
            purchaseOrdersError={ordersError}
            ordersSupported={ordersSupported}
            holdActionId={holdActionId}
            profileForm={profileForm}
            setProfileForm={setProfileForm}
            onSaveProfile={handleSaveProfile}
            profileSaving={profileSaving}
            settingsSection={settingsSection}
            onSettingsSectionChange={setSettingsSection}
            onReleaseHold={handleReleaseHold}
            onToggleTwoFactor={handleToggleTwoFactor}
            twoFactorEnabled={twoFactorEnabled}
            twoFactorLoading={twoFactorLoading}
            twoFactorSupported={twoFactorSupported}
          />
        )}
      </div>
    </div>
  )
}
