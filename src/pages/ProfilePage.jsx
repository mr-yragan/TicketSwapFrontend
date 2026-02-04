import { useEffect, useState } from 'react'
import { useAuth } from '@/context/useAuth'
import { Button } from '@/components/ui/button'
import { profileApi } from '@/api/apiClient'
import { purchaseApi } from '@/api/purchaseApi'
import { useLocation } from 'react-router-dom'

function TicketCard({ ticket }) {
    const eventDate = ticket?.eventDate ? new Date(ticket.eventDate) : null
    const dateText = eventDate ? eventDate.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) : 'Дата не указана'

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-start gap-4">
            <div>
                <h3 className="text-lg font-semibold">{ticket?.eventName || 'Без названия'}</h3>
                <p className="text-sm text-gray-600 mt-2">{dateText}</p>
                <p className="text-xs text-gray-500 mt-1">ID: {ticket?.uid || ticket?.id}</p>
            </div>
            <div className="text-right">
                <span className="text-xs text-gray-400 block">Цена продажи</span>
                <div className="text-lg font-medium">{ticket?.resalePrice ? `${ticket.resalePrice} ₽` : '-'}</div>
                <span className="text-xs text-gray-400 block mt-1">Оригинал: {ticket?.originalPrice ? `${ticket.originalPrice} ₽` : '-'}</span>
            </div>
        </div>
    )
}

export default function ProfilePage() {
    const { user } = useAuth() || {}
    const location = useLocation()
    const [tickets, setTickets] = useState([])
    const [purchases, setPurchases] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [tab, setTab] = useState('upcoming-purchases')

    useEffect(() => {
        if (!user) return
        const loadTickets = async () => {
            setLoading(true)
            setError('')
            try {
                const data = await profileApi.getMyListings()
                setTickets(Array.isArray(data) ? data : [])

                try {
                    const purchasesData = await purchaseApi.getMyPurchases('active')
                    setPurchases(Array.isArray(purchasesData) ? purchasesData : [])
                } catch (purchaseError) {
                    console.error('Ошибка загрузки покупок:', purchaseError)
                }
            } catch (e) {
                console.error('Ошибка загрузки билетов:', e)
                setError(e.message || 'Не удалось загрузить билеты')

                if (e.response?.status === 401) {
                    setTimeout(() => window.location.href = '/', 2000)
                }
            } finally {
                setLoading(false)
            }
        }
        loadTickets()
    }, [user])

    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message)
            setTimeout(() => setSuccessMessage(''), 5000)
        }
        if (location.state?.tab) {
            setTab(location.state.tab)
        }
        window.history.replaceState({}, document.title)
    }, [location])

    const now = new Date()

    const upcomingListings = tickets.filter(t => {
        const d = t?.eventDate ? new Date(t.eventDate) : null
        return d ? d >= now : true
    })

    const upcomingPurchases = purchases.filter(p => {
        const d = p?.eventDate ? new Date(p.eventDate) : null
        return d ? d >= now : true
    })
    const pastPurchases = purchases.filter(p => {
        const d = p?.eventDate ? new Date(p.eventDate) : null
        return d ? d < now : false
    })

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl p-6 mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Личный кабинет</h1>
                        <p className="text-sm text-gray-500">Пользователь: {user?.email || 'гость'}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setTab('my-listings')}
                            variant={tab === 'my-listings' ? 'default' : 'ghost'}
                        >
                            Мои объявления ({tickets.length})
                        </Button>
                        <Button
                            onClick={() => setTab('upcoming-purchases')}
                            variant={tab === 'upcoming-purchases' ? 'default' : 'ghost'}
                        >
                            Предстоящие события ({upcomingPurchases.length})
                        </Button>
                        <Button
                            onClick={() => setTab('past-purchases')}
                            variant={tab === 'past-purchases' ? 'default' : 'ghost'}
                        >
                            Прошедшие события ({pastPurchases.length})
                        </Button>
                    </div>
                </div>

                {successMessage && (
                    <div className="bg-green-50 border-2 border-green-200 text-green-700 rounded-xl p-4 mb-4 flex items-center justify-between">
                        <span className="font-medium">✅ {successMessage}</span>
                        <button
                            onClick={() => setSuccessMessage('')}
                            className="text-green-700 hover:text-green-900 font-bold">✕
                        </button>
                    </div>
                )}

                <div className="space-y-4">
                    {loading && (
                        <div className="p-6 bg-white rounded-xl text-center text-gray-600">
                            Загрузка билетов...
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    {!loading && !error && (
                        <div>
                            {tab === 'my-listings' && (
                                upcomingListings.length === 0 ? (
                                    <div className="p-6 bg-white rounded-xl text-center text-gray-500">
                                        У вас нет активных объявлений
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {upcomingListings.map(t => <TicketCard key={t.id} ticket={t} />)}
                                    </div>
                                )
                            )}

                            {tab === 'upcoming-purchases' && (
                                upcomingPurchases.length === 0 ? (
                                    <div className="p-6 bg-white rounded-xl text-center text-gray-500">
                                        Нет предстоящих событий
                                    </div>) : (
                                    <div className="grid gap-4">
                                        {upcomingPurchases.map(p => (
                                            <div key={p.id} className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-start gap-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold">{p.eventName || 'Без названия'}</h3>
                                                    <p className="text-sm text-gray-600 mt-2">
                                                        {p.eventDate ? new Date(p.eventDate).toLocaleDateString('ru-RU', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        }) : 'Дата не указана'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">Место: {p.venue || '-'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs text-gray-400 block">Цена покупки</span>
                                                    <div className="text-lg font-medium text-green-600">{p.price} ₽</div>
                                                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded mt-2 inline-block">
                                                        Куплено
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}

                            {tab === 'past-purchases' && (
                                pastPurchases.length === 0 ? (
                                    <div className="p-6 bg-white rounded-xl text-center text-gray-500">
                                        Нет прошедших событий
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {pastPurchases.map(p => (
                                            <div key={p.id} className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-start gap-4 opacity-75">
                                                <div>
                                                    <h3 className="text-lg font-semibold">{p.eventName || 'Без названия'}</h3>
                                                    <p className="text-sm text-gray-600 mt-2">
                                                        {p.eventDate ? new Date(p.eventDate).toLocaleDateString('ru-RU', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        }) : 'Дата не указана'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">Место: {p.venue || '-'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs text-gray-400 block">Цена покупки</span>
                                                    <div className="text-lg font-medium text-gray-600">{p.price} ₽</div>
                                                    <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded mt-2 inline-block">
                                                        Завершено
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
