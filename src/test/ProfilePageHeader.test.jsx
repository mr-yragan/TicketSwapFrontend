import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProfilePageHeader } from '@/pages/profile/ProfilePageHeader'

describe('ProfilePageHeader', () => {
  it('shows user email, id and role in profile summary', () => {
    render(
      <ProfilePageHeader
        userEmail="user@test.com"
        userId={15}
        userRole="ADMIN"
        emailVerified
        verificationLoading={false}
        onResendVerification={vi.fn()}
        activeTab="my-listings"
        onTabChange={vi.fn()}
        onOpenSettings={vi.fn()}
        ordersSupported
        counts={{
          listings: 2,
          archivedListings: 1,
          holds: 0,
          upcomingPurchases: 3,
          pastPurchases: 4,
          orders: 5,
        }}
      />
    )

    expect(screen.getByText('Пользователь: user@test.com')).toBeInTheDocument()
    expect(screen.getByText('ID: 15')).toBeInTheDocument()
    expect(screen.getByText('Роль: Админ')).toBeInTheDocument()
  })
})
