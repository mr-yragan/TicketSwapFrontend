import { useState, useEffect } from 'react'

export function useModal() {
    const {currentModal, setCurrentModal, closeModal} = useContext(ModalContext);
    return {currentModal, setCurrentModal, closeModal}
}