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
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatMoney = (value, currency = 'RUB') => {
  if (value == null || value === '') return '-'

  const amount = Number(value)
  if (Number.isNaN(amount)) {
    return `${value} ${currency === 'RUB' ? '₽' : currency}`
  }

  return `${amount} ${currency === 'RUB' ? '₽' : currency}`
}

const getOrderStatusLabel = (status) => ORDER_STATUS_LABELS[status] || status || '-'
const getPaymentStatusLabel = (status) => PAYMENT_STATUS_LABELS[status] || status || '-'

export function AdminPurchaseOrdersTable({ error, loading, orders }) {
  return (
    <section className="min-w-0 rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-950">Журнал заказов</h2>
          <p className="text-sm text-gray-500">Все покупки и их платёжные статусы</p>
        </div>
        <p className="text-sm text-gray-500">Всего: {orders.length}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-5 py-3">Заказ</th>
              <th className="px-5 py-3">Билет</th>
              <th className="px-5 py-3">Покупатель / продавец</th>
              <th className="px-5 py-3">Статус</th>
              <th className="px-5 py-3">Платёж</th>
              <th className="px-5 py-3">Сумма</th>
              <th className="px-5 py-3">Даты</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading && orders.length === 0 && <TableMessage colSpan={7}>Загрузка заказов...</TableMessage>}
            {!loading && error && <TableMessage colSpan={7}>{error}</TableMessage>}
            {!loading && !error && orders.length === 0 && <TableMessage colSpan={7}>Заказов пока нет</TableMessage>}

            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-5 py-4">
                  <div className="font-medium text-gray-950">#{order.id}</div>
                  <div className="text-xs text-gray-500">Создан: {formatDateTime(order.createdAt)}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="font-medium text-gray-950">{order.eventName || '-'}</div>
                  <div className="text-xs text-gray-500">Listing ID: {order.listingId || '-'}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="text-gray-950">{order.buyerEmail || '-'}</div>
                  <div className="text-xs text-gray-500">seller: {order.sellerEmail || '-'}</div>
                </td>
                <td className="px-5 py-4">
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700">
                    {getOrderStatusLabel(order.status)}
                  </span>
                  {order.failureReason && (
                    <div className="mt-2 max-w-xs text-xs text-red-700">{order.failureReason}</div>
                  )}
                </td>
                <td className="px-5 py-4">
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700">
                    {getPaymentStatusLabel(order.paymentStatus)}
                  </span>
                </td>
                <td className="px-5 py-4 font-medium text-gray-950">
                  {formatMoney(order.amount, order.currency)}
                </td>
                <td className="px-5 py-4 text-xs text-gray-500">
                  <div>Обновлён: {formatDateTime(order.updatedAt)}</div>
                  <div className="mt-1">Завершён: {formatDateTime(order.completedAt)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function TableMessage({ children, colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-10 text-center text-gray-500">
        {children}
      </td>
    </tr>
  )
}
