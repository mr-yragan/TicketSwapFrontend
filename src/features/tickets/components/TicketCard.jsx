import { useNavigate } from 'react-router-dom'

export function TicketCard({ ticket }) {
  const navigate = useNavigate()

  const goToTicket = () => {
    navigate(`/ticket/${ticket.id}`)
  }
  
  let priceText = ticket.price
  if (! priceText.includes('₽')) {
    priceText = priceText + ' ₽'
  }

  return (
    <div
      onClick={goToTicket}
      className="bg-white border-2 border-gray-300 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-xl hover:border-gray-400"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-lg">{ticket. artist}</h3>
        {ticket.verified && (
          <span className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded-md font-medium">
            Verified
          </span>
        )}
      </div>
      
      <p className="text-sm text-gray-600 mb-3">
        {ticket.venue ?  ticket.venue : 'Место уточняется'}
      </p>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{ticket.date}</span>
        <span className="font-bold text-lg">{priceText}</span>
      </div>
    </div>
  )
}