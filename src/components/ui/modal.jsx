export function Modal({ children, onClose }) {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose()
    }
  }

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      style={{ animation: 'fadeIn 200ms ease-out' }}
    >
      <div
        className="bg-white rounded-2xl p-8 w-full max-w-md relative"
        style={{ animation: 'scaleIn 200ms ease-out' }}
      >
        {children}
      </div>
    </div>
  )
}

export default Modal
