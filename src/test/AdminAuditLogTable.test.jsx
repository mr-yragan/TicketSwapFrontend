import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AdminAuditLogTable } from '@/features/admin/components/AdminAuditLogTable'

describe('AdminAuditLogTable', () => {
  const baseProps = {
    entries: [
      {
        id: 10,
        action: 'ORGANIZER_CREATED',
        entityType: 'ORGANIZER',
        entityId: 42,
        actorUserId: 7,
        details: 'code=bilety',
        createdAt: '2026-05-03T10:00:00.000Z',
      },
    ],
    error: '',
    filters: {
      action: '',
      entityType: '',
      entityId: '',
      actorUserId: '',
    },
    loading: false,
    onApplyFilters: vi.fn(),
    onFilterChange: vi.fn(),
    onResetFilters: vi.fn(),
  }

  beforeEach(() => {
    baseProps.onApplyFilters.mockClear()
    baseProps.onFilterChange.mockClear()
    baseProps.onResetFilters.mockClear()
  })

  it('renders audit entries and human-readable action labels', () => {
    render(<AdminAuditLogTable {...baseProps} />)

    expect(screen.getByText('Организатор создан')).toBeInTheDocument()
    expect(screen.getByText('ORGANIZER')).toBeInTheDocument()
    expect(screen.getByText('code=bilety')).toBeInTheDocument()
  })

  it('passes changed filter values to callbacks and applies/reset filters', async () => {
    const user = userEvent.setup()
    render(<AdminAuditLogTable {...baseProps} />)

    fireEvent.change(screen.getByLabelText('Действие'), {
      target: { value: 'REFUND_COMPLETED' },
    })
    fireEvent.change(screen.getByLabelText('ID сущности'), {
      target: { value: '12' },
    })

    expect(baseProps.onFilterChange).toHaveBeenCalledWith('action', 'REFUND_COMPLETED')
    expect(baseProps.onFilterChange).toHaveBeenCalledWith('entityId', '12')

    await user.click(screen.getByRole('button', { name: 'Применить фильтры' }))
    await user.click(screen.getByRole('button', { name: 'Сбросить' }))

    expect(baseProps.onApplyFilters).toHaveBeenCalledTimes(1)
    expect(baseProps.onResetFilters).toHaveBeenCalledTimes(1)
  })
})
