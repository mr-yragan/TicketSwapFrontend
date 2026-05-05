import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EditListingModal } from '@/components/EditListingModal'

const mocks = vi.hoisted(() => ({
  useModal: vi.fn(),
  useOrganizerCatalog: vi.fn(),
  getById: vi.fn(),
  searchEvents: vi.fn(),
}))

vi.mock('@/context', () => ({
  useModal: mocks.useModal,
}))

vi.mock('@/features/organizer/hooks/useOrganizerCatalog', () => ({
  useOrganizerCatalog: mocks.useOrganizerCatalog,
}))

vi.mock('@/api', async () => {
  const actual = await vi.importActual('@/api')
  return {
    ...actual,
    ticketsApi: {
      ...actual.ticketsApi,
      getById: mocks.getById,
    },
    organizerApi: {
      ...actual.organizerApi,
      searchEvents: mocks.searchEvents,
    },
  }
})

describe('EditListingModal', () => {
  beforeEach(() => {
    mocks.useModal.mockReturnValue({
      closeModal: vi.fn(),
      modalData: {
        listingId: 77,
        listingSnapshot: {
          id: 77,
          uid: 'MANUAL-UID-777',
        },
      },
    })
    mocks.useOrganizerCatalog.mockReturnValue({
      organizers: [],
      loading: false,
    })
    mocks.getById.mockResolvedValue({
      details: {
        eventName: '',
        eventDate: '',
        venue: '',
        price: null,
        additionalInfo: '',
        sellerComment: '',
        organizerId: '',
        organizerName: '',
        selectedEventId: '',
        eventId: '',
      },
    })
    mocks.searchEvents.mockResolvedValue([])
  })

  it('prefills uid from listing snapshot when backend details do not include it', async () => {
    render(<EditListingModal />)

    expect(await screen.findByDisplayValue('MANUAL-UID-777')).toBeInTheDocument()
  })
})
