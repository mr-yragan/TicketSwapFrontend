import { useModal } from '@/context/ModalContext'
import { useAuth } from '@/context/useAuth'
import { Button, Modal, FormField } from '@/components/ui'
import { X } from 'lucide-react'
import { useLoginForm } from '@/hooks/useLoginForm'

export function LoginModal() {
  const { closeModal, openModal } = useModal()
  const { login } = useAuth()
  const { form, error, loading, handleFieldChange, handleSubmit } = useLoginForm(closeModal)

  const handleSwitchToRegister = () => {
    closeModal()
    setTimeout(() => openModal('register'), 200)
  }

  return (
    <Modal onClose={closeModal}>
      <button
        onClick={closeModal}
        className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
        <X size={24} />
      </button>

      <h1 className="text-2xl font-bold text-center mb-6">Авторизация</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={(e) => handleSubmit(e, login)}>
        <FormField
          label="Email или логин"
          type="email"
          value={form.email}
          onChange={(e) => handleFieldChange('email', e.target.value)}
          placeholder="Введите почту или логин"
          required
        />

        <FormField
          label="Пароль"
          type="password"
          value={form.password}
          onChange={(e) => handleFieldChange('password', e.target.value)}
          placeholder="Введите пароль"
          helperText="8-72 символов"
          required
          minLength={8}
          maxLength={72}
        />

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white mt-6">
          {loading ? 'Вход...' : 'Вход'}
        </Button>
      </form>

      <div className="text-center text-sm mt-6">
        <button
          type="button"
          onClick={handleSwitchToRegister}
          className="text-blue-500 hover:text-blue-700 font-medium">
          Нет аккаунта? Зарегистрироваться
        </button>
      </div>
    </Modal>
  )
}
