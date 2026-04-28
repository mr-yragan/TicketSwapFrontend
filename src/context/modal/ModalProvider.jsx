import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

const ModalContext = createContext(null)

export function ModalProvider({ children }) {
  const [currentModal, setCurrentModal] = useState(null)
  const [modalData, setModalData] = useState(null)
  const timeoutIdsRef = useRef(new Set())
  const clearScheduledActions = useCallback(() => {
    timeoutIdsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
    timeoutIdsRef.current.clear()
  }, [])

  const schedule = useCallback((callback, delay = 0) => {
    const timeoutId = window.setTimeout(() => {
      timeoutIdsRef.current.delete(timeoutId)
      callback()
    }, delay)

    timeoutIdsRef.current.add(timeoutId)
    return timeoutId
  }, [])

  useEffect(() => {
    return () => {
      clearScheduledActions()
    }
  }, [clearScheduledActions])

  const openModal = useCallback((modalName, data = null) => {
    clearScheduledActions()
    setCurrentModal(modalName)
    setModalData(data)
  }, [clearScheduledActions])

  const closeModal = useCallback(() => {
    clearScheduledActions()
    setCurrentModal(null)
    setModalData(null)
  }, [clearScheduledActions])

  const openModalAfterClose = useCallback((modalName, data = null, delay = 200) => {
    clearScheduledActions()
    setCurrentModal(null)
    setModalData(null)
    schedule(() => {
      openModal(modalName, data)
    }, delay)
  }, [clearScheduledActions, openModal, schedule])

  const value = useMemo(() => ({
    currentModal,
    modalData,
    openModal,
    closeModal,
    openModalAfterClose,
  }), [closeModal, currentModal, modalData, openModal, openModalAfterClose])

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
