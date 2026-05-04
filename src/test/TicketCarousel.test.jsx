import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TicketCarousel } from '@/components/TicketCarousel'

const mocks = vi.hoisted(() => ({
  useTicketFiles: vi.fn(),
  useTicketFilePreviews: vi.fn(),
}))

vi.mock('@/hooks/useTicketFiles', () => ({
  useTicketFiles: mocks.useTicketFiles,
}))

vi.mock('@/hooks/useTicketFilePreviews', () => ({
  useTicketFilePreviews: mocks.useTicketFilePreviews,
}))

describe('TicketCarousel', () => {
  const originalOpen = window.open

  beforeEach(() => {
    window.open = vi.fn()
    mocks.useTicketFiles.mockReset()
    mocks.useTicketFilePreviews.mockReset()
    mocks.useTicketFilePreviews.mockReturnValue({
      previews: [
        {
          fileId: 1,
          url: 'https://example.com/blur-preview.png',
        },
      ],
      loading: false,
      error: null,
    })
    mocks.useTicketFiles.mockReturnValue({
      error: null,
      files: [
        {
          id: 1,
          originalName: 'ticket-image.jpg',
          contentType: 'image/jpeg',
          sizeBytes: 2048,
        },
        {
          id: 2,
          originalName: 'ticket-source.pdf',
          contentType: 'application/pdf',
          sizeBytes: 4096,
        },
      ],
      loading: false,
      downloadUrls: {
        1: 'https://example.com/ticket-image.jpg',
      },
      getDownloadUrl: vi.fn().mockResolvedValue('https://example.com/ticket-source.pdf'),
      preloadDownloadUrls: vi.fn(),
    })
  })

  afterEach(() => {
    window.open = originalOpen
  })

  it('shows protected files only after explicit access check and allows opening pdf files', async () => {
    const user = userEvent.setup()

    render(<TicketCarousel ticketId={77} />)

    expect(screen.getByText('Защищённое превью')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Проверить доступ к оригиналам' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Проверить доступ к оригиналам' }))

    expect(await screen.findByText('Доступные файлы')).toBeInTheDocument()
    expect(screen.getByText('ticket-image.jpg')).toBeInTheDocument()
    expect(screen.getByText('ticket-source.pdf')).toBeInTheDocument()

    const openButtons = screen.getAllByRole('button', { name: 'Открыть файл' })
    await user.click(openButtons[1])

    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith('https://example.com/ticket-source.pdf', '_blank', 'noopener,noreferrer')
    })
  })
})
