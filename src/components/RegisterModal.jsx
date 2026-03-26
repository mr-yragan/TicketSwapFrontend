import { useModal } from '@/context/ModalContext'
import { useAuth } from '@/context/useAuth'
import { Button, Modal, FormField } from '@/components/ui'
import { X } from 'lucide-react'
import { useRegisterForm } from '@/hooks/useRegisterForm'

export function RegisterModal() {
  const { closeModal, openModal } = useModal()
  const { register } = useAuth()
  const { form, error, success, loading, handleFieldChange, handleSubmit, constants } = useRegisterForm(closeModal)

  const handleSwitchToLogin = () => {
    closeModal()
    setTimeout(() => openModal('login'), 200)
  }

  return (
    <Modal onClose={closeModal}>
      <button
        onClick={closeModal}
        className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
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

      <form className="space-y-4" onSubmit={(e) => handleSubmit(e, register)}>
        <FormField
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => handleFieldChange('email', e.target.value)}
          placeholder="Введите вашу почту"
          required
        />

        <FormField
          label="Пароль"
          type="password"
          value={form.password}
          onChange={(e) => handleFieldChange('password', e.target.value)}
          placeholder="Придумайте пароль"
          helperText={`${constants.MIN}-${constants.MAX} символов`}
          required
          minLength={constants.MIN}
          maxLength={constants.MAX}
        />

        <FormField
          label="Подтверждение пароля"
          type="password"
          value={form.confirmPassword}
          onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
          placeholder="Повторите пароль"
          required
          minLength={constants.MIN}
          maxLength={constants.MAX}
        />

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white mt-6">
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </Button>
      </form>

      <div className="text-center text-sm mt-6">
        <span className="text-gray-600">Уже есть аккаунт? </span>
        <button
          type="button"
          onClick={handleSwitchToLogin}
          className="text-blue-500 hover:text-blue-700 font-medium">
          Войти
        </button>
      </div>
    </Modal>
  )
}
