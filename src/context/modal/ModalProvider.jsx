import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

const ModalContext = createContext(null)

/*
  Глобальный менеджер модалок.
  Отвечает сразу за три вещи:
  - какая модалка открыта сейчас;
  - какие данные ей переданы;
  - подтверждения действий через promise-based confirmAction().
  Дополнительно хранит "память" некоторых модалок, чтобы важное состояние не терялось от случайного клика мимо.
*/
export function ModalProvider({ children }) {
  const [currentModal, setCurrentModal] = useState(null)
  const [modalData, setModalData] = useState(null)
  const [confirmation, setConfirmation] = useState(null)
  const timeoutIdsRef = useRef(new Set())
  const modalMemoryRef = useRef(new Map())
  const confirmationResolverRef = useRef(null)
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
      if (confirmationResolverRef.current) {
        confirmationResolverRef.current(false)
        confirmationResolverRef.current = null
      }
    }
  }, [clearScheduledActions])

  const openModal = useCallback((modalName, data = null) => {
    clearScheduledActions()
    setCurrentModal(modalName)
    if (data != null) {
      setModalData(data)
      return
    }

    // Если модалку закрыли случайно без явного сброса, поднимем её последнее сохранённое состояние.
    setModalData(modalMemoryRef.current.get(modalName) ?? null)
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

  const rememberModalState = useCallback((modalName, data) => {
    if (!modalName) {
      return
    }

    if (data == null) {
      modalMemoryRef.current.delete(modalName)
      return
    }

    modalMemoryRef.current.set(modalName, data)
  }, [])

  const clearRememberedModalState = useCallback((modalName) => {
    if (!modalName) {
      return
    }

    modalMemoryRef.current.delete(modalName)
  }, [])

  const resolveConfirmation = useCallback((confirmed) => {
    const resolver = confirmationResolverRef.current
    confirmationResolverRef.current = null
    setConfirmation(null)
    resolver?.(confirmed)
  }, [])

  const confirmAction = useCallback((options = {}) => (
    new Promise((resolve) => {
      if (confirmationResolverRef.current) {
        confirmationResolverRef.current(false)
      }

      // Confirm живёт как модалка верхнего уровня, а не как local state кнопки.
      confirmationResolverRef.current = resolve
      setConfirmation({
        title: options.title || 'Подтвердите действие',
        message: options.message || 'Вы действительно хотите продолжить?',
        confirmLabel: options.confirmLabel || 'Подтвердить',
        cancelLabel: options.cancelLabel || 'Отмена',
        tone: options.tone || 'danger',
      })
    })
  ), [])

  const value = useMemo(() => ({
    currentModal,
    modalData,
    confirmation,
    openModal,
    closeModal,
    openModalAfterClose,
    rememberModalState,
    clearRememberedModalState,
    confirmAction,
    resolveConfirmation,
  }), [clearRememberedModalState, closeModal, confirmAction, confirmation, currentModal, modalData, openModal, openModalAfterClose, rememberModalState, resolveConfirmation])

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
