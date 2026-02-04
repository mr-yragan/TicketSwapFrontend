import { useModal } from '@/context/ModalContext'
import SellTicketForm from '@/components/SellTicketForm'


export function SellTicketModal() {
  const { closeModal } = useModal()

  const handleSuccess = () => {
    setTimeout(() => {
      closeModal()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-overlay">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl relative modal-overlay">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"> ×
        </button>

        <h2 className="text-xl font-semibold mb-4">Создать объявление о продаже</h2>

        <SellTicketForm onSuccess={handleSuccess} />
      </div>
    </div>
  )
}
