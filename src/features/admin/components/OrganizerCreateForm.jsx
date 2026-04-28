import { Building2, Loader2, Plus } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { VERIFICATION_MODES } from '../constants'

export function OrganizerCreateForm({ actionId, form, onChange, onSubmit }) {
  const isCreating = actionId === 'create'

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <Building2 size={20} />
        <h2 className="text-lg font-semibold text-gray-950">Новый организатор</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">Название</span>
          <Input
            value={form.name}
            onChange={(event) => onChange('name', event.target.value)}
            required
            maxLength={255}
            placeholder="Manual Organizer"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">Почта пользователя</span>
          <Input
            type="email"
            value={form.contactEmail}
            onChange={(event) => onChange('contactEmail', event.target.value)}
            required
            maxLength={255}
            placeholder="user@example.com"
          />
        </label>

        <VerificationModePicker value={form.verificationMode} onChange={(value) => onChange('verificationMode', value)} />

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">
            API-ключ {form.verificationMode === 'MANUAL' ? '(необязательно)' : '*'}
          </span>
          <Input
            value={form.apiKey}
            onChange={(event) => onChange('apiKey', event.target.value)}
            required={form.verificationMode === 'EXTERNAL_API'}
            maxLength={64}
            placeholder="partner_code"
          />
          <span className="mt-1 block text-xs text-gray-500">A-Z, a-z, 0-9, дефис и подчёркивание, 2..64 символа.</span>
        </label>

        <Button
          type="submit"
          disabled={isCreating}
          className="w-full bg-black text-white gap-2">
          {isCreating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
          Создать
        </Button>
      </form>
    </section>
  )
}

function VerificationModePicker({ value, onChange }) {
  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-gray-700">Тип проверки</span>
      <div className="grid gap-2">
        {VERIFICATION_MODES.map((mode) => (
          <label
            key={mode.value}
            className={`cursor-pointer rounded-lg border p-3 transition-colors ${
              value === mode.value ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
            }`}>
            <span className="flex items-start gap-2">
              <input
                type="radio"
                name="verificationMode"
                value={mode.value}
                checked={value === mode.value}
                onChange={(event) => onChange(event.target.value)}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-medium text-gray-950">{mode.label}</span>
                <span className="mt-1 block text-xs leading-5 text-gray-500">{mode.description}</span>
              </span>
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
