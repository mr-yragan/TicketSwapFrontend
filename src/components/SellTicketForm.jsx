import { useAuth } from '@/context/useAuth'
import { useTicketsRefresh } from '@/context/TicketsRefreshContext'
import { Button } from '@/components/ui'
import { FormInput } from './FormInput'
import { useSellForm } from '@/hooks/useSellForm'
export default function SellTicketForm({ onSuccess } = {}) {
  const { token } = useAuth()
  const { triggerRefresh } = useTicketsRefresh()
  const { form, loading, error, success, handleFieldChange, handleSubmit, constants } = useSellForm(onSuccess)
  return (
    <div className="max-w-xl w-full bg-white p-6 rounded-2xl shadow-md">
      <h3 className="text-lg font-semibold mb-4">Продать билет</h3>
      {!token && (
        <div className="mb-4 text-sm text-yellow-700 bg-yellow-50 p-3 rounded">
          Чтобы создать заявку, войдите в аккаунт
        </div>
      )}
      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 p-3 rounded">{error}</div>
      )}
      {success && (
        <div className="mb-4 text-sm text-green-700 bg-green-50 p-3 rounded">{success}</div>
      )}
      <form onSubmit={(e) => handleSubmit(e, token, triggerRefresh)} className="flex flex-col gap-3">
        <FormInput
          label="ID билета (необязательно)"
          value={form.uid}
          onChange={(e) => handleFieldChange('uid', e.target.value)}
          placeholder="Оставьте пустым для автогенерации"
        />
        <FormInput
          label="Название события *"
          value={form.eventName}
          onChange={(e) => handleFieldChange('eventName', e.target.value)}
          placeholder="Например: Концерт Imagine Dragons"
          required
        />
        <FormInput
          label="Место проведения *"
          value={form.venue}
          onChange={(e) => handleFieldChange('venue', e.target.value)}
          placeholder="Например: Олимпийский стадион"
          required
        />
        <FormInput
          label="Дата и время события *"
          type="datetime-local"
          value={form.eventDate}
          onChange={(e) => handleFieldChange('eventDate', e.target.value)}
        />
        <FormInput
          label="Цена билета (₽) *"
          type="number"
          value={form.price}
          onChange={(e) => handleFieldChange('price', e.target.value)}
          placeholder="5000"
          inputMode="decimal"
          required
        />
        <FormInput
          label="Организатор (необязательно)"
          value={form.organizerName}
          onChange={(e) => handleFieldChange('organizerName', e.target.value)}
          placeholder="Название компании-организатора"
        />
        <FormInput
          label="Дополнительная информация (необязательно)"
          value={form.additionalInfo}
          onChange={(e) => handleFieldChange('additionalInfo', e.target.value)}
          placeholder="Ряд, место, сектор и т.д."
          rows={3}
          maxLength={constants.MAX_TEXT_LENGTH}
        />
        <FormInput
          label="Комментарий продавца (необязательно)"
          value={form.sellerComment}
          onChange={(e) => handleFieldChange('sellerComment', e.target.value)}
          placeholder="Причина продажи, особенности и т.д."
          rows={2}
          maxLength={constants.MAX_TEXT_LENGTH}
        />
        <button
          type="submit"
          disabled={loading || !token}
          className="mt-2 bg-black text-white py-2 rounded disabled:opacity-60">
          {loading ? 'Отправка...' : 'Отправить заявку'}
        </button>
      </form>
    </div>
  )
}
