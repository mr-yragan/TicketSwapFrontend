import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginModal } from '@/components/LoginModal'

const mocks = vi.hoisted(() => ({
  closeModal: vi.fn(),
  login: vi.fn(),
  openModalAfterClose: vi.fn(),
  resendVerification: vi.fn(),
  setError: vi.fn(),
  useLoginForm: vi.fn(),
}))

vi.mock('@/context', () => ({
  useAuth: () => ({
    login: mocks.login,
  }),
  useModal: () => ({
    closeModal: mocks.closeModal,
    modalData: null,
    openModalAfterClose: mocks.openModalAfterClose,
  }),
}))

vi.mock('@/hooks/useLoginForm', () => ({
  useLoginForm: mocks.useLoginForm,
}))

vi.mock('@/api', () => ({
  authApi: {
    resendVerification: mocks.resendVerification,
  },
}))

describe('LoginModal', () => {
  beforeEach(() => {
    mocks.closeModal.mockReset()
    mocks.login.mockReset()
    mocks.openModalAfterClose.mockReset()
    mocks.resendVerification.mockReset()
    mocks.setError.mockReset()
    mocks.useLoginForm.mockReset()

    mocks.useLoginForm.mockReturnValue({
      form: {
        identifier: 'user@test.com',
        password: '',
      },
      error: 'Почта не подтверждена',
      loading: false,
      handleFieldChange: vi.fn(),
      handleSubmit: vi.fn(),
      setError: mocks.setError,
    })
  })

  it('shows resend verification action for unverified email errors and sends request', async () => {
    const user = userEvent.setup()
    mocks.resendVerification.mockResolvedValue({
      success: true,
      data: { message: 'Письмо отправлено повторно' },
    })

    render(<LoginModal />)

    await user.click(screen.getByRole('button', { name: 'Отправить письмо подтверждения ещё раз' }))

    expect(mocks.resendVerification).toHaveBeenCalledWith('user@test.com')

    await waitFor(() => {
      expect(screen.getByText('Письмо отправлено повторно')).toBeInTheDocument()
    })
  })

  it('does not show resend action for unrelated login errors', () => {
    mocks.useLoginForm.mockReturnValue({
      form: {
        identifier: 'user@test.com',
        password: '',
      },
      error: 'Неверные данные для входа',
      loading: false,
      handleFieldChange: vi.fn(),
      handleSubmit: vi.fn(),
      setError: mocks.setError,
    })

    render(<LoginModal />)

    expect(screen.queryByRole('button', { name: 'Отправить письмо подтверждения ещё раз' })).not.toBeInTheDocument()
  })
})
