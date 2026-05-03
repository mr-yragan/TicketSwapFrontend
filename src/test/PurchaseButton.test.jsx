import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PurchaseButton from '@/components/PurchaseButton'

const mocks = vi.hoisted(() => ({
  openModal: vi.fn(),
  useAuth: vi.fn(),
  usePurchaseLogic: vi.fn(),
}))

vi.mock('@/context', () => ({
  useAuth: mocks.useAuth,
  useModal: () => ({
    openModal: mocks.openModal,
  }),
}))

vi.mock('@/hooks/usePurchaseLogic', () => ({
  usePurchaseLogic: mocks.usePurchaseLogic,
}))

const renderButton = (props = {}) => {
  return render(
    <MemoryRouter>
      <PurchaseButton listingId={12} price={5000} {...props} />
    </MemoryRouter>
  )
}

describe('PurchaseButton', () => {
  beforeEach(() => {
    mocks.openModal.mockReset()
    mocks.useAuth.mockReset()
    mocks.usePurchaseLogic.mockReset()

    mocks.usePurchaseLogic.mockReturnValue({
      clearError: vi.fn(),
      loading: false,
      error: null,
      handlePurchase: vi.fn(),
    })
  })

  it('shows restricted purchase state for admin users', () => {
    mocks.useAuth.mockReturnValue({
      user: { id: 1, role: 'ADMIN', email: 'admin@test.com' },
    })

    renderButton()

    expect(screen.getByRole('button', { name: 'Покупка доступна только обычным пользователям' })).toBeDisabled()
  })

  it('shows sold state for completed listings', () => {
    mocks.useAuth.mockReturnValue({
      user: { id: 2, role: 'USER', email: 'user@test.com' },
    })

    renderButton({ status: 'COMPLETED' })

    expect(screen.getByRole('button', { name: 'Билет уже продан' })).toBeDisabled()
  })

  it('opens login modal for guests when purchase button is clicked', async () => {
    const user = userEvent.setup()
    mocks.useAuth.mockReturnValue({ user: null })

    renderButton()

    await user.click(screen.getByRole('button', { name: 'Купить за 5000 ₽' }))

    expect(mocks.openModal).toHaveBeenCalledWith('login')
  })
})
