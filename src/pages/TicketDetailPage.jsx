import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowLeft, Calendar, MapPin, User, Info, Building2, MessageSquare, CheckCircle2, Download } from 'lucide-react'
import { Button } from '@/components/ui'
import { partnerApi, ticketsApi } from '@/api'
import { useTicket } from '@/hooks/useTicket'
import { TicketCarousel } from '@/components/TicketCarousel'
import PurchaseButton from '@/components/PurchaseButton'
import { getTicketStatusLabel } from '@/utils/ticketFormatters'

export default function TicketDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { ticket, loading, error } = useTicket(id)
  const details = ticket?.details ?? ticket
  const status = ticket?.status
  const statusHistory = Array.isArray(ticket?.statusHistory) ? ticket.statusHistory : []
  const latestHistoryEntry = statusHistory.length > 0 ? statusHistory[statusHistory.length - 1] : null
  const [partnerSupported, setPartnerSupported] = useState(null)
  const [reissuedDownloadLoading, setReissuedDownloadLoading] = useState(false)
  const [reissuedDownloadError, setReissuedDownloadError] = useState('')
  const isVerified = Boolean(details?.verified)
  const validationSuccessReasons = new Set([
    'Partner validation passed',
    'Validation completed successfully'
  ])
  const partnerValidated = isVerified || statusHistory.some((entry) =>
    validationSuccessReasons.has(entry?.reason)
  )
  const isSuccessfulValidation = isVerified || validationSuccessReasons.has(latestHistoryEntry?.reason)
  const statusReason = latestHistoryEntry?.reason || (isVerified ? 'Объявление прошло проверку и доступно к покупке.' : '')

  useEffect(() => {
    let cancelled = false

    const checkOrganizer = async () => {
      const organizerName = details?.organizerName
      if (!organizerName || !organizerName.trim()) {
        setPartnerSupported(null)
        return
      }

      try {
        const supported = await partnerApi.isOrganizerSupported(organizerName)
        if (!cancelled) {
          setPartnerSupported(supported)
        }
      } catch {
        if (!cancelled) {
          setPartnerSupported(null)
        }
      }
    }

    checkOrganizer()

    return () => {
      cancelled = true
    }
  }, [details?.organizerName])

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'Дата не указана'
    }
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return dateString
    }
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatMemberSince = (dateString) => {
    if (!dateString) {
      return 'Неизвестно'
    }
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return date.toLocaleDateString('ru-RU', {
      month: 'long',
      year: 'numeric'
    })
  }

  const formatPrice = (price) => {
    if (!price) return '—'
    return `${price} ₽`
  }

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
      <div className="max-w-[1400px] mx-auto p-8">
        <div className="text-center py-20 text-gray-500">
          Загрузка билета...
        </div>
      </div>
    )
  }

  if (error || !details) {
    return (
      <div className="max-w-350 mx-auto p-8">
        <div className="text-center text-red-600">
          Ошибка: {error || 'Билет не найден'}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto p-8">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-700 mb-6 hover:text-black transition-colors"
      >
        <ArrowLeft size={20} />
        Назад к доске объявлений
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Левая колонка - основная информация */}
        <div className="lg:col-span-2">
          <TicketCarousel key={details.id} ticketId={details.id} />

          {/* Название события */}
          <h1 className="text-3xl font-bold mb-4">{details.eventName || 'Событие'}</h1>

          {/* Дата события */}
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Calendar size={18} />
            <span>{formatDate(details.eventDate)}</span>
          </div>

          <div className="mb-2 text-sm text-gray-700">
            <span className="font-medium">Статус:</span> {getTicketStatusLabel(status)}
          </div>

          {statusReason && (
            <div
              className={`mb-4 p-3 rounded-lg border text-sm ${
                isSuccessfulValidation
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            >
              <div className="flex items-start gap-2">
                {isSuccessfulValidation && (
                  <CheckCircle2 size={16} className="mt-0.5 text-green-600 shrink-0" />
                )}
                <div>
                  {isSuccessfulValidation && (
                    <div className="font-medium mb-1">Проверка организации пройдена</div>
                  )}
                  {latestHistoryEntry?.reason ? (
                    <>
                      <span className="font-medium">{isSuccessfulValidation ? 'Комментарий:' : 'Причина:'}</span>{' '}
                      {statusReason}
                    </>
                  ) : (
                    statusReason
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Место проведения */}
          <div className="flex items-center gap-2 text-gray-600 mb-6">
            <MapPin size={18} />
            <span>{details.venue || 'Место не указано'}</span>
          </div>

          {/* Детали билета */}
          <div className="bg-white border-2 border-gray-300 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <h2 className="text-xl font-bold">Детали билета</h2>
              {partnerValidated && (
                <span className="bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-md">
                  Подтверждён партнёром
                </span>
              )}
            </div>
            <div className="space-y-3">
              {details.additionalInfo && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Info size={16} className="text-gray-500" />
                    <p className="text-sm text-gray-500">Дополнительная информация</p>
                  </div>
                  <p className="font-medium pl-6">{details.additionalInfo}</p>
                </div>
              )}

              {details.organizerName && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 size={16} className="text-gray-500" />
                    <p className="text-sm text-gray-500">Организатор</p>
                  </div>
                  <p className="font-medium pl-6">{details.organizerName}</p>
                </div>
              )}

              {!details.additionalInfo && !details.organizerName && (
                <p className="text-gray-500 text-sm">Дополнительная информация отсутствует</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Комментарий от продавца */}
            {details.sellerComment && (
              <div className="bg-white border-2 border-gray-300 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare size={20} />
                  <h2 className="text-xl font-bold">Комментарий от продавца</h2>
                </div>
                <p className="text-gray-700">{details.sellerComment}</p>
              </div>
            )}

            {details.reissuedTicketUid && (
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-green-900 mb-2">Перевыпущенный билет</h2>
                <p className="text-sm text-green-800">
                  Новый билет был перевыпущен и доступен покупателю.
                </p>
                <p className="mt-2 text-sm text-green-900 font-medium">
                  UID: {details.reissuedTicketUid}
                </p>
                <Button
                  type="button"
                  onClick={handleDownloadReissuedTicket}
                  disabled={reissuedDownloadLoading}
                  className="mt-4 bg-black text-white gap-2">
                  <Download size={18} />
                  {reissuedDownloadLoading ? 'Получаем ссылку...' : 'Скачать новый билет'}
                </Button>
                {reissuedDownloadError && (
                  <p className="mt-2 text-sm text-red-700">{reissuedDownloadError}</p>
                )}
              </div>
            )}

            {details.organizerName && partnerSupported === false && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-amber-900 mb-2">Проверка партнёра</h2>
                <p className="text-sm text-amber-800">
                  Организатор <span className="font-medium">{details.organizerName}</span> не поддерживается partner API.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Правая колонка - цена и продавец */}
        <div className="lg:col-span-1 space-y-6">
          {/* Блок с ценой и кнопками */}
          <div className="bg-white border-2 border-gray-300 rounded-2xl p-6">
            <p className="text-sm text-gray-500 mb-2">Цена билета</p>
            <p className="text-3xl font-bold mb-6">{formatPrice(details.price)}</p>

            <PurchaseButton 
              listingId={details.id}
              price={details.price}
              status={status}
              sellerId={details.seller?.id}
              sellerEmail={details.seller?.email || details.seller?.displayName}
            />
          </div>

          {/* Информация о продавце */}
          {details.seller && (
            <div className="bg-white border-2 border-gray-300 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Продавец</h3>
                {partnerValidated && (
                  <span className="bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-md">
                    Подтверждён партнёром
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
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
