import { Building2, Loader2, Plus } from 'lucide-react'
import { Button, DismissibleAlert, Input } from '@/components/ui'
import { VERIFICATION_MODES } from '../constants'

export function OrganizerCreateForm({
  actionId,
  form,
  issuedCredentials,
  onChange,
  onDismissCredentials,
  onSubmit,
}) {
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
        {issuedCredentials?.integrationSecret && (
          <DismissibleAlert tone="success" className="p-4" onDismiss={onDismissCredentials}>
            <div className="space-y-2">
              <p className="font-medium text-green-900">
                Организатор «{issuedCredentials.organizerName}» создан.
              </p>
              <div className="grid gap-1 text-sm text-green-800">
                <span>Код организатора: <span className="font-mono">{issuedCredentials.organizerCode}</span></span>
                <span>
                  Ключ подключения:{' '}
                  <span className="break-all font-mono">{issuedCredentials.integrationSecret}</span>
                </span>
                <span className="text-xs text-green-700">
                  Ключ показывается только один раз.
                </span>
                <span className="text-xs text-green-700">
                  {issuedCredentials.generated
                    ? 'Система создала ключ автоматически.'
                    : 'Использован ключ, который был указан при создании.'}
                </span>
              </div>
            </div>
          </DismissibleAlert>
        )}

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">Название организатора</span>
          <Input
            value={form.name}
            onChange={(event) => onChange('name', event.target.value)}
            required
            maxLength={255}
            placeholder="Например, Билеты"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">Почта аккаунта</span>
          <Input
            type="email"
            value={form.contactEmail}
            onChange={(event) => onChange('contactEmail', event.target.value)}
            required
            maxLength={255}
            placeholder="user@example.com"
          />
          <span className="mt-1 block text-xs text-gray-500">
            На эту почту уже должен быть зарегистрирован пользователь.
          </span>
        </label>

        <VerificationModePicker value={form.verificationMode} onChange={(value) => onChange('verificationMode', value)} />

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">Короткий код организатора *</span>
          <Input
            value={form.organizerCode}
            onChange={(event) => onChange('organizerCode', event.target.value)}
            required
            maxLength={64}
            placeholder="bilety"
          />
          <span className="mt-1 block text-xs text-gray-500">
            Этот код будет использоваться в системе. Подойдут латинские буквы, цифры, дефис и подчёркивание.
          </span>
        </label>

        {form.verificationMode === 'EXTERNAL_API' && (
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Ключ подключения</span>
            <Input
              value={form.integrationSecret}
              onChange={(event) => onChange('integrationSecret', event.target.value)}
              maxLength={255}
              placeholder="Можно оставить пустым"
            />
            <span className="mt-1 block text-xs text-gray-500">
              Если не заполнять это поле, система сама создаст ключ и покажет его после создания.
            </span>
          </label>
        )}

        <Button
          type="submit"
          disabled={isCreating}
          className="w-full bg-black text-white gap-2">
          {isCreating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
          Создать организатора
        </Button>
      </form>
    </section>
  )
}

function VerificationModePicker({ value, onChange }) {
  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-gray-700">Как будут проверяться билеты</span>
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
