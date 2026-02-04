import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, MapPin, User, Info, Building2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTicket } from '@/hooks/useTicket'
import PurchaseButton from '@/components/PurchaseButton'

export default function TicketDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { ticket, loading, error } = useTicket(id)

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

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto p-8">
        <div className="text-center py-20 text-gray-500">
          Загрузка билета...
        </div>
      </div>
    )
  }

  if (error || !ticket) {
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
          {/* Заглушка изображения */}
          <div className="bg-gray-100 border-2 border-gray-300 rounded-2xl p-20 mb-6 flex items-center justify-center">
            <div className="text-gray-400">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
          </div>

          {/* Название события */}
          <h1 className="text-3xl font-bold mb-4">{ticket.eventName || 'Событие'}</h1>

          {/* Дата события */}
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Calendar size={18} />
            <span>{formatDate(ticket.eventDate)}</span>
          </div>

          {/* Место проведения */}
          <div className="flex items-center gap-2 text-gray-600 mb-6">
            <MapPin size={18} />
            <span>{ticket.venue || 'Место не указано'}</span>
          </div>

          {/* Детали билета */}
          <div className="bg-white border-2 border-gray-300 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Детали билета</h2>
            <div className="space-y-3">
              {ticket.additionalInfo && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Info size={16} className="text-gray-500" />
                    <p className="text-sm text-gray-500">Дополнительная информация</p>
                  </div>
                  <p className="font-medium pl-6">{ticket.additionalInfo}</p>
                </div>
              )}

              {ticket.organizerName && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 size={16} className="text-gray-500" />
                    <p className="text-sm text-gray-500">Организатор</p>
                  </div>
                  <p className="font-medium pl-6">{ticket.organizerName}</p>
                </div>
              )}

              {!ticket.additionalInfo && !ticket.organizerName && (
                <p className="text-gray-500 text-sm">Дополнительная информация отсутствует</p>
              )}
            </div>
          </div>

          {/* Комментарий от продавца */}
          {ticket.sellerComment && (
            <div className="bg-white border-2 border-gray-300 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare size={20} />
                <h2 className="text-xl font-bold">Комментарий от продавца</h2>
              </div>
              <p className="text-gray-700">{ticket.sellerComment}</p>
            </div>
          )}
        </div>

        {/* Правая колонка - цена и продавец */}
        <div className="lg:col-span-1 space-y-6">
          {/* Блок с ценой и кнопками */}
          <div className="bg-white border-2 border-gray-300 rounded-2xl p-6">
            <p className="text-sm text-gray-500 mb-2">Цена билета</p>
            <p className="text-3xl font-bold mb-6">{formatPrice(ticket.price)}</p>

            <PurchaseButton 
              listingId={ticket.id} 
              price={ticket.price}
              sellerId={ticket.seller?.id}
            />
            <Button 
              variant="outline" 
              className="w-full !bg-white text-black border-2 border-gray-300 py-6 text-base rounded-xl mt-3"
            >
              Написать продавцу
            </Button>
          </div>

          {/* Информация о продавце */}
          {ticket.seller && (
            <div className="bg-white border-2 border-gray-300 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Продавец</h3>
                {ticket.verified && (
                  <span className="bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-md">
                    Verified
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="font-semibold">{ticket.seller.displayName || 'Продавец'}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">На платформе с:</span>
                  <span className="font-medium">{formatMemberSince(ticket.seller.memberSince)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
