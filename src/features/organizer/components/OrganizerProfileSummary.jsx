import { Ban, ClipboardCheck } from 'lucide-react'
import { formatVerificationMode } from '../utils'

export function OrganizerProfileSummary({ currentUser, isBanned, isManual, metrics, organizer }) {
  const keyFootprint = organizer?.apiKeyLast4 ? `••••${organizer.apiKeyLast4}` : '-'
  const keyIssuedAt = organizer?.apiKeyCreatedAt
    ? new Date(organizer.apiKeyCreatedAt).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-'

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <ClipboardCheck size={20} />
          <h2 className="text-lg font-semibold text-gray-950">Профиль</h2>
        </div>

        <div className="grid gap-3 text-sm md:grid-cols-2">
          <InfoLine label="Почта" value={currentUser?.email} />
          <InfoLine label="Логин" value={currentUser?.login} />
          <InfoLine label="Роль" value={currentUser?.role} />
          <InfoLine label="Email подтвержден" value={currentUser?.emailVerified ? 'Да' : 'Нет'} />
          <InfoLine label="Контакт организатора" value={organizer?.contactEmail} />
          <InfoLine label="Код организатора" value={organizer?.organizerCode} mono />
          <InfoLine label="Тип проверки" value={formatVerificationMode(organizer?.verificationMode)} />
          <InfoLine label="Секрет интеграции" value={keyFootprint} mono />
          <InfoLine label="Секрет выдан" value={keyIssuedAt} />
        </div>

        {isBanned && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <Ban size={18} className="mt-0.5 shrink-0" />
            Организатор заблокирован: создание событий и ручные очереди недоступны.
          </div>
        )}

        {!isManual && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
            External API организатор использует код <span className="font-mono">{organizer?.organizerCode || '-'}</span> и закрытый секрет интеграции. Ручное создание и обработка очередей доступны только типу MANUAL.
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-sm text-gray-500">{metric.label}</div>
            <div className="mt-2 text-3xl font-semibold text-gray-950">{metric.value}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function InfoLine({ label, value, mono = false }) {
  return (
    <div>
      <div className="text-xs uppercase text-gray-500">{label}</div>
      <div className={`mt-1 text-gray-950 ${mono ? 'font-mono text-xs' : ''}`}>{value || '-'}</div>
    </div>
  )
}
