import { useState } from 'react'
import { useModal } from '@/context/ModalContext'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export function LoginModal() {
  const { closeModal, openModal } = useModal()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)
    
    setLoading(false)

    if (result.success) {
      closeModal()
    } else {
      setError(result.error || 'Ошибка входа')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-overlay">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md relative modal-card">
        <button
          onClick={closeModal}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <h1 className="text-2xl font-bold text-center mb-6">Авторизация на сайт</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email или логин
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите почту или логин"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Пароль
            </label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              name="remember"
              className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="remember" className="ml-3 text-sm text-gray-700 cursor-pointer">
              Запомнить меня
            </label>
          </div>

          <Button 
            type="submit"
            disabled={loading}
            className="w-full !bg-black !text-white py-3 text-base rounded-lg font-medium mt-6 disabled:opacity-50"
          >
            {loading ? 'Вход...' : 'Вход'}
          </Button>
        </form>

        <div className="flex justify-between text-sm mt-6">
          <button 
            type="button"
            className="text-blue-500 hover:text-blue-700 font-medium cursor-pointer"
          >
            Забыли пароль?
          </button>
          <button 
            type="button"
            onClick={() => {
              closeModal()
              openModal('register')
            }}
            className="text-blue-500 hover:text-blue-700 font-medium cursor-pointer"
          >
            Зарегистрироваться
          </button>
        </div>
      </div>
    </div>
  )
}
