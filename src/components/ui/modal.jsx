import { useEffect } from 'react'

export function Modal({ children, onClose }) {
  useEffect(() => {
    if (!onClose) return undefined

    const handleEscape = (event) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose()
    }
  }

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      style={{ animation: 'fadeIn 200ms ease-out' }}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
        style={{ animation: 'scaleIn 200ms ease-out' }}
      >
        {children}
      </div>
    </div>
  )
}

export default Modal
