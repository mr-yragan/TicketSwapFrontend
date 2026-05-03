import { useModal } from '@/context'
import { useAuth } from '@/context'
import { Modal } from '@/components/ui'
import { DismissibleAlert } from '@/components/ui'
import { X } from 'lucide-react'
import SellTicketForm from '@/components/SellTicketForm'

export function SellTicketModal() {
  const { closeModal } = useModal()
  const { user } = useAuth()
  const role = (user?.role || '').toUpperCase()
  const canSellTickets = role !== 'ADMIN' && role !== 'ORGANIZER'

  return (
    <Modal onClose={closeModal}>
      <button
        onClick={closeModal}
        className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
        <X size={24} />
      </button>

      <h2 className="text-xl font-semibold mb-4">Создать объявление о продаже</h2>
      {canSellTickets ? (
        <SellTicketForm />
      ) : (
        <DismissibleAlert tone="info" onDismiss={closeModal}>
          Администратор и организатор не могут размещать билеты на продажу через обычный пользовательский сценарий.
        </DismissibleAlert>
      )}
    </Modal>
  )
}
