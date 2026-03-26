import { useModal } from '@/context/ModalContext'
import { Modal } from '@/components/ui'
import { X } from 'lucide-react'
import SellTicketForm from '@/components/SellTicketForm'

export function SellTicketModal() {
  const { closeModal } = useModal()

  const handleSuccess = () => {
    setTimeout(closeModal, 1500)
  }

  return (
    <Modal onClose={closeModal}>
      <button
        onClick={closeModal}
        className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
        <X size={24} />
      </button>

      <h2 className="text-xl font-semibold mb-4">Создать объявление о продаже</h2>
      <SellTicketForm onSuccess={handleSuccess} />
    </Modal>
  )
}
