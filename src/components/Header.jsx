import { useModal } from '@/context/ModalContext'
import { useAuth } from '@/context/useAuth'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'
import { PlusCircle, LogIn, UserPlus } from 'lucide-react'

const OUTLINE_BUTTON_CLASS = "bg-white text-black border border-gray-300 px-6 gap-2"

export function Header() {
    const { openModal } = useModal()
    const { isAuthenticated, user, logout } = useAuth()
    const navigate = useNavigate()

    const handleProfileClick = () => navigate('/profile')
    const handleLogoClick = () => navigate('/')

    return (
        <header className="bg-white border-b border-gray-300">
            <div className="max-w-350 mx-auto px-8 py-4 flex justify-between items-center">
                <h1
                    className="text-2xl font-bold cursor-pointer hover:text-gray-700 transition-colors"
                    onClick={handleLogoClick}>
                    TicketSwap
                </h1>
                <nav className="flex gap-3">
                    {isAuthenticated && (
                        <Button
                            onClick={() => openModal('sell')}
                            className="bg-black text-white px-6 gap-2">
                            <PlusCircle size={18} />
                            Продать билет
                        </Button>
                    )}

                    {isAuthenticated ? (
                        <AuthenticatedNav user={user} logout={logout} onProfileClick={handleProfileClick} />
                    ) : (
                        <GuestNav openModal={openModal} />
                    )}
                </nav>
            </div>
        </header>
    )
}

function AuthenticatedNav({ user, logout, onProfileClick }) {
    return (
        <div className="flex items-center gap-2">
            <button
                onClick={onProfileClick}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 bg-gray-50 hover:bg-gray-100 transition-colors">
                {user?.email || 'Профиль'}
            </button>
            <Button
                className="bg-white text-black border border-gray-300 px-4"
                onClick={logout}>
                Выйти
            </Button>
        </div>
    )
}

function GuestNav({ openModal }) {
    return (
        <div className="flex items-center gap-2">
            <Button
                onClick={() => openModal('login')}
                className={OUTLINE_BUTTON_CLASS}>
                <LogIn size={18} />
                Вход
            </Button>
            <Button
                onClick={() => openModal('register')}
                className={OUTLINE_BUTTON_CLASS}>
                <UserPlus size={18} />
                Регистрация
            </Button>
        </div>
    )
}
