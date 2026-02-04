import { useState } from 'react'
import { useAuth } from '@/context/useAuth'
import { useModal } from '@/context/ModalContext'
import { ticketsApi } from '@/api/apiClient'
import { useTicketsRefresh } from '@/context/TicketsRefreshContext'

export default function SellTicketForm({ onSuccess } = {}) {
  const { token } = useAuth()
  const { openModal } = useModal()
  const { triggerRefresh } = useTicketsRefresh()

  const [eventName, setEventName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [venue, setVenue] = useState('')
  const [price, setPrice] = useState('')
  const [uid, setUid] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [organizerName, setOrganizerName] = useState('')
  const [sellerComment, setSellerComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const getMinDateTime = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const validate = () => {
    setError(null)
    if (!eventName.trim()) return 'Введите название события'
    if (!eventDate) return 'Выберите дату и время события'

    const selectedDate = new Date(eventDate)
    const now = new Date()
    if (selectedDate <= now) {
      return 'Дата события должна быть в будущем'
    }

    if (!venue.trim()) return 'Введите место проведения'
    if (!price || isNaN(Number(price))) return 'Введите корректную цену'
    if (Number(price) <= 0) return 'Цена должна быть больше 0'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess(null)
    const v = validate()
    if (v) {
      setError(v)
      return
    }
    if (!token) {
      openModal('login')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const body = {
        uid: uid.trim() || `TICKET-${Date.now()}`,
        eventName: eventName.trim(),
        eventDate: eventDate,
        venue: venue.trim(),
        price: Number(price),
        additionalInfo: additionalInfo.trim() || undefined,
        organizerName: organizerName.trim() || undefined,
        sellerComment: sellerComment.trim() || undefined,
      }

      await ticketsApi.sell(body)

      console.log('✅ Билет успешно выставлен на продажу!')
      setSuccess('Заявка на продажу успешно отправлена')

      console.log('🔄 Обновляем список билетов на главной...')
      triggerRefresh()

      if (typeof onSuccess === 'function') {
        onSuccess(body)
      }

      setUid('')
      setEventName('')
      setEventDate('')
      setVenue('')
      setPrice('')
      setAdditionalInfo('')
      setOrganizerName('')
      setSellerComment('')
    } catch (err) {
      console.error(err)
      setError(err.message || 'Не удалось отправить заявку')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl w-full bg-white p-6 rounded-2xl shadow-md">
      <h3 className="text-lg font-semibold mb-4">Продать билет</h3>

      {!token && (
        <div className="mb-4 text-sm text-yellow-700 bg-yellow-50 p-3 rounded">
          Чтобы создать заявку, войдите в аккаунт
        </div>
      )}

      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 p-3 rounded">{error}</div>
      )}

      {success && (
        <div className="mb-4 text-sm text-green-700 bg-green-50 p-3 rounded">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="text-sm text-gray-700">ID билета (необязательно)</label>
        <input
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
          placeholder="Оставьте пустым для автогенерации"
        />

        <label className="text-sm text-gray-700">Название события *</label>
        <input
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
          placeholder="Например: Концерт Imagine Dragons"
          required
        />

        <label className="text-sm text-gray-700">Место проведения *</label>
        <input
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
          placeholder="Например: Олимпийский стадион"
          required
        />

        <label className="text-sm text-gray-700">Дата и время события *</label>
        <input
          type="datetime-local"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          min={getMinDateTime()}
          className="border rounded px-3 py-2 text-sm"
          required
        />

        <label className="text-sm text-gray-700">Цена билета (₽) *</label>
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
          placeholder="5000"
          inputMode="decimal"
          required
        />

        <label className="text-sm text-gray-700">Организатор (необязательно)</label>
        <input
          value={organizerName}
          onChange={(e) => setOrganizerName(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
          placeholder="Название компании-организатора"/>

        <label className="text-sm text-gray-700">Дополнительная информация (необязательно)</label>
        <textarea
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
          placeholder="Ряд, место, сектор и т.д."
          rows={3}
          maxLength={2000}/>

        <label className="text-sm text-gray-700">Комментарий продавца (необязательно)</label>
        <textarea
          value={sellerComment}
          onChange={(e) => setSellerComment(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
          placeholder="Причина продажи, особенности и т.д."
          rows={2}
          maxLength={2000}/>

        <button
          type="submit"
          disabled={loading || !token}
          className="mt-2 bg-black text-white py-2 rounded disabled:opacity-60">
          {loading ? 'Отправка...' : 'Отправить заявку'}
        </button>
      </form>
    </div>
  )
}
