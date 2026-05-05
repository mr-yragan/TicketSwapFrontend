import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TicketCard } from '@/features/tickets/components/TicketCard'

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  useTicketFilePreviews: vi.fn(),
}))

vi.mock('react-router-dom', () => ({
  useNavigate: () => mocks.navigate,
}))

vi.mock('@/hooks/useTicketFilePreviews', () => ({
  useTicketFilePreviews: mocks.useTicketFilePreviews,
}))

describe('TicketCard', () => {
  beforeEach(() => {
    mocks.navigate.mockReset()
    mocks.useTicketFilePreviews.mockReset()
  })

  it('applies blur styling to protected preview images', () => {
    mocks.useTicketFilePreviews.mockReturnValue({
      previews: [
        {
          fileId: 1,
          url: 'https://example.com/preview.png',
        },
      ],
    })

    render(
      <TicketCard
        ticket={{
          id: 7,
          eventName: 'Linkin Park',
          venue: 'Almaty Arena',
          eventDate: '2031-09-15T17:00:00Z',
          price: 10000,
        }}
      />
    )

    expect(screen.getByAltText('Защищённое превью билета Linkin Park')).toHaveClass('blur-md')
  })
})
