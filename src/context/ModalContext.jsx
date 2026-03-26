import { createContext, useContext, useState, useMemo } from 'react'

const ModalContext = createContext(null)

export function ModalProvider({ children }) {
  const [currentModal, setCurrentModal] = useState(null)

  const openModal = (modalName) => {
    setCurrentModal(modalName)
  }

  const closeModal = () => {
    setCurrentModal(null)
  }

  const value = useMemo(() => ({
    currentModal,
    openModal,
    closeModal
  }), [currentModal])

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal должен быть внутри ModalProvider')
  }
  return context
}
