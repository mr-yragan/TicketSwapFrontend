import { useNavigate } from 'react-router-dom'
import { formatPrice, formatDate, getTicketField } from '@/utils/ticketFormatters'

export function TicketCard({ ticket }) {
  const navigate = useNavigate()

  const goToTicket = () => {
    navigate(`/ticket/${ticket?.id}`)
  }

  const artist = getTicketField(ticket, 'eventName', 'artist') || 'Событие'
  const venue = getTicketField(ticket, 'venue', 'organizer') || 'Место уточняется'
  const date = getTicketField(ticket, 'eventDate', 'date') || ''
  const verified = !!ticket?.verified

  return (
    <div
      onClick={goToTicket}
      className="bg-white border-2 border-gray-300 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-xl hover:border-gray-400 flex flex-col h-full min-h-45">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-lg">{artist}</h3>
        {verified && (
          <span className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded-md font-medium">
            Verified
          </span>
        )}
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
        <span className="font-bold text-lg">{formatPrice(ticket?.price)}</span>
      </div>
    </div>
  )
}