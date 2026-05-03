import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Download,
  Info,
  MapPin,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui'
import { TicketCarousel } from '@/components/TicketCarousel'
import PurchaseButton from '@/components/PurchaseButton'
import { ticketsApi } from '@/api'
import { useAuth } from '@/context'
import { useTicket } from '@/hooks/useTicket'
import { useTicketStatusHistory } from '@/hooks/useTicketStatusHistory'
import { useOrganizerCatalog } from '@/features/organizer/hooks/useOrganizerCatalog'
import { getTicketStatusLabel } from '@/utils/ticketFormatters'

const getValidationBadgeLabel = ({ isVerified, partnerSupported }) => {
  if (!isVerified) {
    return ''
  }

  if (partnerSupported === false) {
    return 'Проверен организатором'
  }

  if (partnerSupported === true) {
    return 'Проверен автоматически'
  }

  return 'Билет подтверждён'
}

const getTicketStatusMessage = ({ isVerified, partnerSupported }) => {
  if (isVerified) {
    return 'Билет подтверждён и доступен к покупке.'
  }

  if (partnerSupported === false) {
    return 'Этот билет пока не подтверждён организатором. Статус обновится, как только проверка завершится.'
  }

  if (partnerSupported === true) {
    return 'Проверка билета ещё идёт. Как только она завершится, объявление станет доступно для покупки.'
  }

  return 'Проверка билета ещё не завершена.'
}

const formatEventDate = (dateString) => {
  if (!dateString) {
    return 'Дата не указана'
  }

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return dateString
  }

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatMemberSince = (dateString) => {
  if (!dateString) {
    return 'Неизвестно'
  }

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return dateString
  }

  return date.toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  })
}

const formatPrice = (price) => {
  if (!price) {
    return '—'
  }

  return `${price} ₽`
}

const formatDateTime = (value) => {
  if (!value) {
    return '—'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function TicketDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { ticket, loading, error } = useTicket(id)
  const { organizers } = useOrganizerCatalog()
  const details = ticket?.details ?? ticket
  const status = ticket?.status
  const isAdmin = (user?.role || '').toUpperCase() === 'ADMIN'
  const [reissuedDownloadLoading, setReissuedDownloadLoading] = useState(false)
  const [reissuedDownloadError, setReissuedDownloadError] = useState('')
  const { history: statusHistory, loading: historyLoading, error: historyError } = useTicketStatusHistory(details?.id, isAdmin)

  const partnerSupported = useMemo(() => {
    const organizerName = String(details?.organizerName || '').trim().toLowerCase()
    if (!organizerName) {
      return null
    }

    const organizer = organizers.find((item) => (
      String(item?.name || '').trim().toLowerCase() === organizerName
    ))

    if (!organizer) {
      return null
    }

    return Boolean(organizer.hasExternalApi)
  }, [details?.organizerName, organizers])

  const isVerified = Boolean(details?.verified)
  const validationBadgeLabel = getValidationBadgeLabel({ isVerified, partnerSupported })
  const statusMessage = getTicketStatusMessage({ isVerified, partnerSupported })

  const handleDownloadReissuedTicket = async () => {
    setReissuedDownloadError('')
    setReissuedDownloadLoading(true)

    try {
      const response = await ticketsApi.getReissuedFileDownloadUrl(details.id)
      if (!response?.url) {
        setReissuedDownloadError('Ссылка на новый билет не получена')
        return
      }

      window.location.href = response.url
    } catch (downloadError) {
      const data = downloadError?.response?.data
      setReissuedDownloadError(data?.message || data?.error || 'Не удалось получить новый билет')
    } finally {
      setReissuedDownloadLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
        <div className="py-20 text-center text-gray-500">Загрузка билета...</div>
      </div>
    )
  }

  if (error || !details) {
    return (
      <div className="mx-auto max-w-350 px-4 py-6 sm:px-6 sm:py-8">
        <div className="text-center text-red-600">
          Ошибка: {error || 'Билет не найден'}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
      <button
        onClick={() => navigate('/')}
        className="mb-5 flex items-center gap-2 text-sm text-gray-700 transition-colors hover:text-black sm:mb-6 sm:text-base"
      >
        <ArrowLeft size={20} />
        Назад к доске объявлений
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TicketCarousel key={details.id} ticketId={details.id} />

          <h1 className="mb-4 text-2xl font-bold sm:text-3xl">{details.eventName || 'Событие'}</h1>

          <div className="mb-2 flex items-center gap-2 text-gray-600">
            <Calendar size={18} />
            <span>{formatEventDate(details.eventDate)}</span>
          </div>

          <div className="mb-2 text-sm text-gray-700">
            <span className="font-medium">Статус:</span> {getTicketStatusLabel(status)}
          </div>

          <div
            className={`mb-4 rounded-lg border p-3 text-sm ${
              isVerified
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-gray-200 bg-gray-50 text-gray-700'
            }`}
          >
            <div className="flex items-start gap-2">
              {isVerified && (
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-600" />
              )}
              <div>
                {isVerified && (
                  <div className="mb-1 font-medium">Билет подтверждён</div>
                )}
                <span className="font-medium">{isVerified ? 'Статус:' : 'Проверка:'}</span>{' '}
                {statusMessage}
              </div>
            </div>
          </div>

          <div className="mb-6 flex items-center gap-2 text-gray-600">
            <MapPin size={18} />
            <span>{details.venue || 'Место не указано'}</span>
          </div>

          <div className="mb-6 rounded-2xl border-2 border-gray-300 bg-white p-4 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold">Детали билета</h2>
              {isVerified && (
                <span className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white">
                  {validationBadgeLabel}
                </span>
              )}
            </div>

            <div className="space-y-3">
              {details.additionalInfo && (
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <Info size={16} className="text-gray-500" />
                    <p className="text-sm text-gray-500">Дополнительная информация</p>
                  </div>
                  <p className="pl-6 font-medium">{details.additionalInfo}</p>
                </div>
              )}

              {details.organizerName && (
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <Building2 size={16} className="text-gray-500" />
                    <p className="text-sm text-gray-500">Организатор</p>
                  </div>
                  <p className="pl-6 font-medium">{details.organizerName}</p>
                </div>
              )}

              {!details.additionalInfo && !details.organizerName && (
                <p className="text-sm text-gray-500">Дополнительная информация отсутствует</p>
              )}
            </div>
          </div>

          {details.reissuedTicketUid && (
            <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-4 sm:p-6">
              <h2 className="mb-2 text-lg font-bold text-green-900">Перевыпущенный билет</h2>
              <p className="text-sm text-green-800">
                Новый билет был перевыпущен и доступен покупателю.
              </p>
              <p className="mt-2 text-sm font-medium text-green-900">
                UID: {details.reissuedTicketUid}
              </p>
              <Button
                type="button"
                onClick={handleDownloadReissuedTicket}
                disabled={reissuedDownloadLoading}
                className="mt-4 gap-2 bg-black text-white"
              >
                <Download size={18} />
                {reissuedDownloadLoading ? 'Получаем ссылку...' : 'Скачать новый билет'}
              </Button>
              {reissuedDownloadError && (
                <p className="mt-2 text-sm text-red-700">{reissuedDownloadError}</p>
              )}
            </div>
          )}

          {isAdmin && (
            <div className="rounded-2xl border-2 border-gray-300 bg-white p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">История статусов</h2>
                  <p className="mt-1 text-sm text-gray-500">Этот блок виден только администратору.</p>
                </div>
                <span className="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                  Записей: {statusHistory.length}
                </span>
              </div>

              {historyLoading && (
                <p className="text-sm text-gray-500">Загружаем историю статусов...</p>
              )}

              {!historyLoading && historyError && (
                <p className="text-sm text-red-700">{historyError}</p>
              )}

              {!historyLoading && !historyError && statusHistory.length === 0 && (
                <p className="text-sm text-gray-500">История изменений для этого объявления пока пуста.</p>
              )}

              {!historyLoading && !historyError && statusHistory.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                      <tr>
                        <th className="px-3 py-2">Когда</th>
                        <th className="px-3 py-2">Из статуса</th>
                        <th className="px-3 py-2">В статус</th>
                        <th className="px-3 py-2">Кто</th>
                        <th className="px-3 py-2">Причина</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {statusHistory.map((entry) => (
                        <tr key={entry.id}>
                          <td className="px-3 py-3 text-xs text-gray-500">{formatDateTime(entry.changedAt)}</td>
                          <td className="px-3 py-3 text-gray-700">{getTicketStatusLabel(entry.fromStatus) || '—'}</td>
                          <td className="px-3 py-3 font-medium text-gray-950">{getTicketStatusLabel(entry.toStatus)}</td>
                          <td className="px-3 py-3 text-gray-700">
                            {entry.changedBy?.displayName || entry.changedBy?.email || 'system'}
                          </td>
                          <td className="px-3 py-3 text-gray-700">{entry.reason || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-2xl border-2 border-gray-300 bg-white p-4 sm:p-6">
            <p className="mb-2 text-sm text-gray-500">Цена билета</p>
            <p className="mb-6 text-3xl font-bold sm:text-4xl">{formatPrice(details.price)}</p>

            <PurchaseButton
              listingId={details.id}
              price={details.price}
              status={status}
              sellerId={details.seller?.id}
              sellerEmail={details.seller?.email || details.seller?.displayName}
            />
          </div>

          {details.seller && (
            <div className="rounded-2xl border-2 border-gray-300 bg-white p-4 sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-bold">Продавец</h3>
                {isVerified && (
                  <span className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white">
                    {validationBadgeLabel}
                  </span>
                )}
              </div>

              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                  <User className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="font-semibold">{details.seller.displayName || 'Продавец'}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">На платформе с:</span>
                  <span className="font-medium">{formatMemberSince(details.seller.memberSince)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
