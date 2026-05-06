import { useAuth, useModal } from '@/context'
import { AdminAuditLogTable } from '@/features/admin/components/AdminAuditLogTable'
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader'
import { AdminPurchaseOrdersTable } from '@/features/admin/components/AdminPurchaseOrdersTable'
import { AdminStatusMessage } from '@/features/admin/components/AdminStatusMessage'
import { OrganizerCreateForm } from '@/features/admin/components/OrganizerCreateForm'
import { OrganizersTable } from '@/features/admin/components/OrganizersTable'
import { useAdminAuditLog } from '@/features/admin/hooks/useAdminAuditLog'
import { useAdminOrganizers } from '@/features/admin/hooks/useAdminOrganizers'
import { useAdminPurchaseOrders } from '@/features/admin/hooks/useAdminPurchaseOrders'

/*
  Админка собирает три независимые зоны:
  - организаторы;
  - журнал заказов и возвратов;
  - аудит действий.
  Сами запросы и состояние живут в feature-hooks, а страница только связывает их с UI и confirm-диалогами.
*/
export default function AdminPage() {
  const { user } = useAuth()
  const { confirmAction } = useModal()
  const role = (user?.role || '').toUpperCase()
  const isAdmin = role === 'ADMIN'
  const adminState = useAdminOrganizers(isAdmin)
  const ordersState = useAdminPurchaseOrders(isAdmin)
  const auditState = useAdminAuditLog(isAdmin)

  const handleToggleBan = async (organizer) => {
    const confirmed = await confirmAction({
      title: organizer.banned ? 'Разблокировать организатора?' : 'Заблокировать организатора?',
      message: organizer.banned
        ? `Организатор «${organizer.name}» снова сможет работать в системе.`
        : `Организатор «${organizer.name}» потеряет доступ к рабочему процессу, пока его не разблокируют.`,
      confirmLabel: organizer.banned ? 'Разблокировать' : 'Заблокировать',
    })

    if (!confirmed) {
      return
    }

    adminState.toggleOrganizerBan(organizer)
  }

  const handleCompleteRefund = async (order) => {
    const confirmed = await confirmAction({
      title: 'Подтвердить возврат?',
      message: `Возврат по заказу #${order.id} будет отмечен как завершённый.`,
      confirmLabel: 'Подтвердить возврат',
    })

    if (!confirmed) {
      return
    }

    ordersState.completeRefund(order)
  }

  if (!user) {
    return <AdminAccessNotice message="Войдите в аккаунт администратора, чтобы продолжить." />
  }

  if (!isAdmin) {
    return (
      <AdminAccessNotice
        tone="error"
        message={`Нет доступа: текущая роль ${role || 'UNKNOWN'}. Если права Вам выдали, перезайдите в аккаунт.`}
      />
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <AdminPageHeader
        loading={adminState.loading || ordersState.loading || auditState.loading}
        onRefresh={() => {
          adminState.loadOrganizers()
          ordersState.loadPurchaseOrders()
          auditState.loadAuditLog()
        }}
      />
      <AdminStatusMessage status={adminState.status} onDismiss={adminState.clearStatus} />
      <AdminStatusMessage status={ordersState.status} onDismiss={ordersState.clearStatus} />

      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <OrganizerCreateForm
            actionId={adminState.actionId}
            form={adminState.form}
            issuedCredentials={adminState.issuedCredentials}
            onChange={adminState.updateField}
            onDismissCredentials={adminState.clearIssuedCredentials}
            onSubmit={adminState.createOrganizer}
          />
          <OrganizersTable
            actionId={adminState.actionId}
            loading={adminState.loading}
            organizers={adminState.sortedOrganizers}
            onToggleBan={handleToggleBan}
          />
        </div>

        <AdminPurchaseOrdersTable
          actionId={ordersState.actionId}
          error={ordersState.error}
          loading={ordersState.loading}
          onCompleteRefund={handleCompleteRefund}
          orders={ordersState.orders}
        />

        <AdminAuditLogTable
          entries={auditState.entries}
          error={auditState.error}
          filters={auditState.filters}
          loading={auditState.loading}
          onApplyFilters={auditState.applyFilters}
          onFilterChange={auditState.updateFilter}
          onResetFilters={auditState.resetFilters}
        />
      </div>
    </main>
  )
}

function AdminAccessNotice({ message, tone = 'default' }) {
  const isError = tone === 'error'

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-950">Админ-панель</h1>
      <div className={isError ? 'mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800' : 'mt-2 text-gray-600'}>
        {message}
      </div>
    </div>
  )
}
