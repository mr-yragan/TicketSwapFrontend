import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

const getOrganizerHint = (organizer) => {
  if (organizer?.verificationMode === 'EXTERNAL_API' || organizer?.hasExternalApi) {
    return 'Проверка у партнёра'
  }

  if (organizer?.verificationMode === 'MANUAL') {
    return 'Проверка у организатора'
  }

  return 'Тип проверки не указан'
}

export function OrganizerSelect({
  disabled = false,
  loading = false,
  onChange,
  organizers = [],
  placeholder = 'Выберите организатора',
  value = '',
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  const selectedOrganizer = useMemo(
    () => organizers.find((organizer) => String(organizer.id) === String(value)),
    [organizers, value]
  )

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const buttonLabel = selectedOrganizer?.name || (loading ? 'Загрузка...' : placeholder)
  const buttonHint = selectedOrganizer ? getOrganizerHint(selectedOrganizer) : ''

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded border border-gray-300 bg-white px-3 py-2 text-left text-sm transition-colors hover:border-gray-400 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
      >
        <span className="min-w-0">
          <span className={`block truncate ${selectedOrganizer ? 'text-gray-950' : 'text-gray-500'}`}>
            {buttonLabel}
          </span>
          {buttonHint && (
            <span className="mt-0.5 block truncate text-xs text-gray-500">
              {buttonHint}
            </span>
          )}
        </span>
        <ChevronDown size={16} className={`ml-3 shrink-0 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          <button
            type="button"
            onClick={() => {
              onChange?.('')
              setOpen(false)
            }}
            className="flex w-full items-center gap-3 border-b border-gray-100 px-3 py-3 text-left text-sm text-gray-500 hover:bg-gray-50"
          >
            <span className="flex h-4 w-4 items-center justify-center">
              {!selectedOrganizer && <Check size={16} className="text-black" />}
            </span>
            <span>Выберите организатора</span>
          </button>

          {organizers.map((organizer) => {
            const isSelected = String(organizer.id) === String(value)

            return (
              <button
                key={organizer.id}
                type="button"
                onClick={() => {
                  onChange?.(String(organizer.id))
                  setOpen(false)
                }}
                className="flex w-full items-start gap-3 border-b border-gray-100 px-3 py-3 text-left text-sm last:border-b-0 hover:bg-gray-50"
              >
                <span className="flex h-5 w-4 items-center justify-center pt-0.5">
                  {isSelected && <Check size={16} className="text-black" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium text-gray-950">{organizer.name}</span>
                  <span className="mt-0.5 block truncate text-xs text-gray-500">
                    {getOrganizerHint(organizer)}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
