import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'
import { ProfileFormSection } from './ProfileFormSection'
import { ProfileSecuritySection } from './ProfileSecuritySection'

const ORDER_STATUS_LABELS = {
  CREATED: 'Создан',
  PAYMENT_AUTHORIZED: 'Платёж авторизован',
  PROCESSING_REISSUE: 'Перевыпуск в работе',
  WAITING_MANUAL_REISSUE: 'Ждёт организатора',
  COMPLETED: 'Завершён',
  REFUND_REQUIRED: 'Нужен возврат',
}

const PAYMENT_STATUS_LABELS = {
  AUTHORIZED: 'Авторизован',
  CAPTURED: 'Списан',
  REFUND_REQUIRED: 'Нужен возврат',
}

const formatDateTime = (value) => {
  if (!value) return 'Дата не указана'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatMoney = (value, currency = 'RUB') => {
  if (value == null || value === '') {
    return '-'
  }

  const amount = Number(value)
  if (Number.isNaN(amount)) {
    return `${value} ${currency === 'RUB' ? '₽' : currency}`
  }

  return `${amount} ${currency === 'RUB' ? '₽' : currency}`
}

const getOrderStatusLabel = (status) => ORDER_STATUS_LABELS[status] || status || 'Неизвестно'
const getPaymentStatusLabel = (status) => PAYMENT_STATUS_LABELS[status] || status || 'Неизвестно'

function EmptyState({ children }) {
  return (
    <div className="rounded-xl bg-white p-6 text-center text-gray-500 shadow-sm">
      {children}
    </div>
  )
}

function ProfileTicketCard({ ticket, label, statusLabel, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(ticket?.id)}
      className="flex w-full items-start justify-between gap-4 rounded-xl bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div>
        <h3 className="text-lg font-semibold">{ticket?.eventName || 'Без названия'}</h3>
        <p className="mt-2 text-sm text-gray-600">{formatDateTime(ticket?.eventDate)}</p>
        <p className="mt-1 text-xs text-gray-500">Место: {ticket?.venue || '-'}</p>
        <p className="mt-1 text-xs text-gray-500">ID: {ticket?.uid || ticket?.id}</p>
      </div>
      <div className="text-right">
        <span className="block text-xs text-gray-400">{label}</span>
        <div className="text-lg font-medium">{formatMoney(ticket?.resalePrice || ticket?.price)}</div>
        <span className="mt-2 inline-block rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
          {statusLabel}
        </span>
      </div>
    </button>
  )
}

function HoldCard({ hold, isPending, onOpen, onRelease }) {
  const listing = hold?.listing

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <button
        type="button"
        onClick={() => onOpen(listing?.id)}
        className="block w-full text-left"
      >
        <h3 className="text-lg font-semibold">{listing?.eventName || 'Без названия'}</h3>
        <p className="mt-2 text-sm text-gray-600">{formatDateTime(listing?.eventDate)}</p>
        <p className="mt-1 text-xs text-gray-500">Место: {listing?.venue || '-'}</p>
        <p className="mt-1 text-xs text-gray-500">Резерв до: {formatDateTime(hold?.holdUntil)}</p>
      </button>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => onOpen(listing?.id)}
          className="bg-black text-white"
        >
          Открыть билет
        </Button>
        <Button
          type="button"
          onClick={() => onRelease(hold)}
          disabled={isPending}
          className="border border-gray-300 bg-white text-black"
        >
          {isPending ? 'Снимаем...' : 'Снять резерв'}
        </Button>
      </div>
    </div>
  )
}

function OrderCard({ order, onOpen }) {
  const canOpenTicket = Boolean(order?.listingId)

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{order?.eventName || `Заказ #${order?.id}`}</h3>
          <p className="mt-2 text-sm text-gray-600">Заказ #{order?.id}</p>
          <p className="mt-1 text-xs text-gray-500">Создан: {formatDateTime(order?.createdAt)}</p>
          {order?.completedAt && (
            <p className="mt-1 text-xs text-gray-500">Завершён: {formatDateTime(order.completedAt)}</p>
          )}
        </div>
        <div className="text-right">
          <span className="block text-xs text-gray-400">Сумма</span>
          <div className="text-lg font-medium">{formatMoney(order?.amount, order?.currency)}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded bg-gray-100 px-2 py-1 font-medium text-gray-700">
          Статус: {getOrderStatusLabel(order?.status)}
        </span>
        <span className="rounded bg-gray-100 px-2 py-1 font-medium text-gray-700">
          Платёж: {getPaymentStatusLabel(order?.paymentStatus)}
        </span>
      </div>

      {order?.failureReason && (
        <p className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {order.failureReason}
        </p>
      )}

      {canOpenTicket && (
        <div className="mt-4">
          <Button
            type="button"
            onClick={() => onOpen(order.listingId)}
            className="bg-black text-white"
          >
            Открыть билет
          </Button>
        </div>
      )}
    </div>
  )
}

export function ProfilePageTabs({
  tab,
  tickets,
  archivedListings,
  upcomingPurchases,
  pastPurchases,
  activeHolds,
  purchaseOrders,
  purchaseOrdersError,
  ordersSupported,
  holdActionId,
  profileForm,
  setProfileForm,
  onSaveProfile,
  profileSaving,
  settingsSection,
  onSettingsSectionChange,
  onReleaseHold,
  onToggleTwoFactor,
  twoFactorEnabled,
  twoFactorLoading,
  twoFactorSupported,
}) {
  const navigate = useNavigate()

  const openTicket = (ticketId) => {
    if (!ticketId) return
    navigate(`/ticket/${ticketId}`)
  }

  return (
    <div>
      {tab === 'my-listings' && (
        tickets.length === 0 ? (
          <EmptyState>У вас нет активных объявлений</EmptyState>
        ) : (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <ProfileTicketCard
                key={ticket.id}
                ticket={ticket}
                label="Цена продажи"
                statusLabel={ticket?.verified ? 'Проверен' : 'На модерации'}
                onOpen={openTicket}
              />
            ))}
          </div>
        )
      )}

      {tab === 'archived-listings' && (
        archivedListings.length === 0 ? (
          <EmptyState>Архивных объявлений пока нет</EmptyState>
        ) : (
          <div className="grid gap-4">
            {archivedListings.map((ticket) => (
              <ProfileTicketCard
                key={ticket.id}
                ticket={ticket}
                label="Финальная цена"
                statusLabel={ticket?.verified ? 'Завершено' : 'Архив'}
                onOpen={openTicket}
              />
            ))}
          </div>
        )
      )}

      {tab === 'active-holds' && (
        activeHolds.length === 0 ? (
          <EmptyState>У вас нет активных резервов</EmptyState>
        ) : (
          <div className="grid gap-4">
            {activeHolds.map((hold) => (
              <HoldCard
                key={hold.id}
                hold={hold}
                isPending={holdActionId === hold.id}
                onOpen={openTicket}
                onRelease={onReleaseHold}
              />
            ))}
          </div>
        )
      )}

      {tab === 'upcoming-purchases' && (
        upcomingPurchases.length === 0 ? (
          <EmptyState>Нет предстоящих событий</EmptyState>
        ) : (
          <div className="grid gap-4">
            {upcomingPurchases.map((purchase) => (
              <ProfileTicketCard
                key={purchase.id}
                ticket={purchase}
                label="Цена покупки"
                statusLabel="Куплено"
                onOpen={openTicket}
              />
            ))}
          </div>
        )
      )}

      {tab === 'past-purchases' && (
        pastPurchases.length === 0 ? (
          <EmptyState>Нет прошедших событий</EmptyState>
        ) : (
          <div className="grid gap-4">
            {pastPurchases.map((purchase) => (
              <ProfileTicketCard
                key={purchase.id}
                ticket={purchase}
                label="Цена покупки"
                statusLabel="Завершено"
                onOpen={openTicket}
              />
            ))}
          </div>
        )
      )}

      {tab === 'orders' && (
        !ordersSupported ? (
          <EmptyState>Журнал заказов появится после обновления backend до новой версии.</EmptyState>
        ) : purchaseOrdersError ? (
          <EmptyState>{purchaseOrdersError}</EmptyState>
        ) : purchaseOrders.length === 0 ? (
          <EmptyState>Заказов пока нет</EmptyState>
        ) : (
          <div className="grid gap-4">
            {purchaseOrders.map((order) => (
              <OrderCard key={order.id} order={order} onOpen={openTicket} />
            ))}
          </div>
        )
      )}

      {tab === 'settings' && (
        <div className="grid gap-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => onSettingsSectionChange('profile')}
                className={settingsSection === 'profile'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
              >
                Профиль
              </Button>
              <Button
                type="button"
                onClick={() => onSettingsSectionChange('security')}
                className={settingsSection === 'security'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
              >
                Безопасность
              </Button>
            </div>
          </div>

          {settingsSection === 'security' ? (
            <ProfileSecuritySection
              onToggleTwoFactor={onToggleTwoFactor}
              twoFactorEnabled={twoFactorEnabled}
              twoFactorLoading={twoFactorLoading}
              twoFactorSupported={twoFactorSupported}
            />
          ) : (
            <ProfileFormSection
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              onSaveProfile={onSaveProfile}
              profileSaving={profileSaving}
            />
          )}
        </div>
      )}
    </div>
  )
}
