export function TicketsPagination({ currentPage, onPageChange, pageButtons, totalPages }) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Пагинация билетов">
      <PaginationButton disabled={currentPage <= 0} onClick={() => onPageChange(Math.max(currentPage - 1, 0))}>
        Назад
      </PaginationButton>

      {pageButtons.map((pageNumber, index) => {
        const previousPage = pageButtons[index - 1]
        const hasGap = index > 0 && pageNumber - previousPage > 1

        return (
          <span key={pageNumber} className="flex items-center gap-2">
            {hasGap && <span className="px-1 text-gray-400">...</span>}
            <button
              type="button"
              onClick={() => onPageChange(pageNumber)}
              aria-current={pageNumber === currentPage ? 'page' : undefined}
              className={`h-10 min-w-10 rounded-lg border px-3 text-sm font-medium ${
                pageNumber === currentPage
                  ? 'border-black bg-black text-white'
                  : 'border-gray-300 bg-white text-gray-800'
              }`}>
              {pageNumber + 1}
            </button>
          </span>
        )
      })}

      <PaginationButton disabled={currentPage >= totalPages - 1} onClick={() => onPageChange(Math.min(currentPage + 1, totalPages - 1))}>
        Вперёд
      </PaginationButton>
    </nav>
  )
}

function PaginationButton({ children, disabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-10 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-800 disabled:opacity-50">
      {children}
    </button>
  )
}
