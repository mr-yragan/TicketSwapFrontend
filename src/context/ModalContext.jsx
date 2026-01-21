import { createContext, useContext, useState } from 'react'

const ModalContext = createContext(null)

export function ModalProvider({ children }) {
  const [currentModal, setCurrentModal] = useState(null)

  const openModal = (modalName) => {
    setCurrentModal(modalName)
  }

  const closeModal = () => {
    setCurrentModal(null)
  }

  return (
    <ModalContext.Provider value={{ currentModal, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal должен быть внутри ModalProvider')
  }
  return context
}
