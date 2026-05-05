import { ImageIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTicketFilePreviews } from '@/hooks/useTicketFilePreviews'
import { formatPrice, formatDate, getTicketField } from '@/utils/ticketFormatters'

export function TicketCard({ ticket }) {
  const navigate = useNavigate()
  const { previews } = useTicketFilePreviews(ticket?.id)
  const firstPreview = previews[0]?.url || null

  const goToTicket = () => {
    navigate(`/ticket/${ticket?.id}`)
  }

  const artist = getTicketField(ticket, 'eventName', 'artist') || 'Событие'
  const venue = getTicketField(ticket, 'venue', 'organizer') || 'Место уточняется'
  const date = getTicketField(ticket, 'eventDate', 'date') || ''

  return (
    <div
      onClick={goToTicket}
      className="bg-white border-2 border-gray-300 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-xl hover:border-gray-400 flex flex-col h-full min-h-45">
      <div className="relative mb-3 overflow-hidden rounded-2xl border-2 border-gray-300 bg-gray-100 aspect-video flex items-center justify-center">
        {firstPreview ? (
          <>
            <img
              src={firstPreview}
              alt={`Защищённое превью билета ${artist}`}
              className="h-full w-full scale-105 object-cover blur-md sm:blur-lg"
              loading="lazy"
            />
            <div className="absolute inset-x-3 bottom-3 rounded-lg bg-white/90 px-3 py-2 text-left shadow-sm backdrop-blur-sm">
              <p className="text-xs font-semibold text-gray-800">Защищённое превью билета</p>
              <p className="mt-1 text-[11px] text-gray-600">Оригинал откроется на странице объявления при наличии доступа.</p>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500">
            <ImageIcon size={28} className="mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium text-gray-600">Фото билета</p>
            <p className="mt-1 text-xs text-gray-500">Доступно на странице объявления</p>
          </div>
        )}
      </div>
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-lg">{artist}</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">
        {venue}
      </p>
      
      <div className="grow"></div>
      <div className="flex items-center justify-between mt-auto">
        <span className="text-sm text-gray-500">{formatDate(date)}</span>
        <span className="text-lg font-bold">{formatPrice(ticket?.price)}</span>
      </div>
    </div>
  )
}
