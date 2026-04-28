import { useModal } from '@/context'
import { useAuth } from '@/context'
import { Button, DismissibleAlert, Modal, FormField } from '@/components/ui'
import { X } from 'lucide-react'
import { useRegisterForm } from '@/hooks/useRegisterForm'

export function RegisterModal() {
  const { closeModal, openModalAfterClose } = useModal()
  const { register } = useAuth()
  const { form, error, success, loading, handleFieldChange, handleSubmit, constants, setError, setSuccess } = useRegisterForm()

  const handleSwitchToLogin = () => {
    openModalAfterClose('login')
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
        <DismissibleAlert tone="error" onDismiss={() => setError('')}>
          {error}
        </DismissibleAlert>
      )}

      {success && (
        <DismissibleAlert tone="success" onDismiss={() => setSuccess('')}>
          {success}
        </DismissibleAlert>
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
          label="Логин"
          type="text"
          value={form.login}
          onChange={(e) => handleFieldChange('login', e.target.value)}
          placeholder="Придумайте логин"
          helperText="3-32 символа: буквы, цифры, _ . -"
          required
          minLength={3}
          maxLength={32}
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

      <p className="mt-3 text-xs text-gray-500">
        После регистрации мы отправим письмо для подтверждения email. Без подтверждения вход будет недоступен.
      </p>

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
