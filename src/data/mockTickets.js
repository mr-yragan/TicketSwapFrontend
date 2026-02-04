/*
const tickets = [
  {
    id: 1, 
    artist: 'Би-2', 
    date: '01.01.2026', 
    price: '8 500 ₽', 
    verified: true,
    section: 'Танцпол',
    organizer: 'МТС Фестиваль',
    seller: {
      name: 'Амир С.',
      rating: 0.0,
      ticketsSold: 0,
      memberSince: 'Ноябрь 2025'
    },
    comment: 'Билет был куплен еще год назад, не могу прийти по личным обстоятельствам.'
  },
  { 
    id: 2, artist: 'Би-2', venue: 'Ледовый дворец, Санкт-Петербург', date: '01.01.2026', price: '8 500 ₽', verified: true,
    section: 'Танцпол', organizer: 'МТС Фестиваль',
    seller: { name: 'Продавец 2', rating: 0.0, ticketsSold: 0, memberSince: 'Ноябрь 2025' },
    comment: 'Комментарий от продавца.'
  },
  { 
    id: 3, artist: 'Би-2', venue: 'Ледовый дворец, Санкт-Петербург', date: '01.01.2026', price: '8 500 ₽', verified: true,
    section: 'Танцпол', organizer: 'МТС Фестиваль',
    seller: { name: 'Продавец 3', rating: 0.0, ticketsSold: 0, memberSince: 'Ноябрь 2025' },
    comment: 'Комментарий от продавца.'
  },
]

let nextId = tickets.length + 1
const listeners = new Set()

export function getMockTickets() {
  // возвращаем копию
  return [...tickets]
}

export function addMockTicket(ticket) {
  const t = {
    id: nextId++,
    artist: ticket.eventName || 'Событие',
    date: ticket.eventDate ? ticket.eventDate.replace('T', ' ') : '',
    price: `${ticket.resalePrice} ₽`,
    verified: false,
    section: ticket.section || '',
    organizer: ticket.organizer || '',
    seller: { name: ticket.sellerName || 'Продавец', rating: 0, ticketsSold: 0, memberSince: '' },
    comment: ticket.comment || '',
    ...ticket,
  }
  tickets.unshift(t)
  // уведомляем подписчиков
  listeners.forEach(fn => fn(getMockTickets()))
  return t
}

export function subscribeToTickets(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export { tickets as mockTickets }
*/
