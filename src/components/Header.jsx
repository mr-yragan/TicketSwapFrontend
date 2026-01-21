import { useModal } from '@/context/ModalContext'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { PlusCircle, LogIn, UserPlus } from 'lucide-react'

export function Header() {
  const { openModal } = useModal()
  const { isAuthenticated, user, logout } = useAuth()
  
  return (
    <header className="bg-white border-b border-gray-300">
      <div className="max-w-[1400px] mx-auto px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-700">TicketSwap</h1>
        <nav className="flex gap-3">
          {isAuthenticated && (
            <Button 
              className="!bg-black !text-white px-6 gap-2 rounded-lg"
            >
              <PlusCircle size={18} />
              Продать билет
            </Button>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 bg-gray-50">
                {user?.email || 'Профиль'}
              </span>
              <Button 
                variant="outline" 
                className="!bg-white text-black border border-gray-300 px-4 rounded-lg"
                onClick={logout}
              >
                Выйти
              </Button>
            </div>
          ) : (
            <>
              <Button 
                onClick={() => openModal('login')}
                variant="outline" 
                className="!bg-white text-black border border-gray-300 px-6 gap-2 rounded-lg hover:shadow-xl transition-all hover-gray-400 cursor-pointer"
              >
                <LogIn size={18} />
                Вход
              </Button>
              <Button 
                onClick={() => openModal('register')}
                variant="outline" 
                className="!bg-white text-black border border-gray-300 px-6 gap-2 rounded-lg"
              >
                <UserPlus size={18} />
                Регистрация
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
