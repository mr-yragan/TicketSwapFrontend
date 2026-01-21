import { useState } from 'react'
import { useModal } from '@/context/ModalContext'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export function RegisterModal() {
  const { closeModal, openModal } = useModal()
  const { register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов')
      return
    }

    setLoading(true)

    const result = await register(email, password)
    
    setLoading(false)

    if (result.success) {
      setSuccess('Регистрация прошла успешно')
      setTimeout(() => closeModal(), 1200)
    } else {
      setError(result.error || 'Ошибка регистрации')
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

        <h1 className="text-2xl font-bold text-center mb-6">Регистрация</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-800 rounded-lg">
            {success}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите вашу почту"
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
              placeholder="Придумайте пароль"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Подтверждение пароля
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Повторите пароль"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              required
            />
          </div>

          <Button 
            type="submit"
            disabled={loading}
            className="w-full !bg-black !text-white py-3 text-base rounded-lg font-medium mt-6 disabled:opacity-50"
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>
        </form>

        <div className="text-center text-sm mt-6">
          <span className="text-gray-600">Уже есть аккаунт? </span>
          <button 
            type="button"
            onClick={() => {
              closeModal()
              openModal('login')
            }}
            className="text-blue-500 hover:text-blue-700 font-medium cursor-pointer"
          >
            Войти
          </button>
        </div>
      </div>
    </div>
  )
}
  