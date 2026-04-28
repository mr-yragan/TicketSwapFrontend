import { useAuth } from '@/context'
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader'
import { AdminPurchaseOrdersTable } from '@/features/admin/components/AdminPurchaseOrdersTable'
import { AdminStatusMessage } from '@/features/admin/components/AdminStatusMessage'
import { OrganizerCreateForm } from '@/features/admin/components/OrganizerCreateForm'
import { OrganizersTable } from '@/features/admin/components/OrganizersTable'
import { useAdminOrganizers } from '@/features/admin/hooks/useAdminOrganizers'
import { useAdminPurchaseOrders } from '@/features/admin/hooks/useAdminPurchaseOrders'

export default function AdminPage() {
  const { user } = useAuth()
  const role = (user?.role || '').toUpperCase()
  const isAdmin = role === 'ADMIN'
  const adminState = useAdminOrganizers(isAdmin)
  const ordersState = useAdminPurchaseOrders(isAdmin)

  const handleToggleBan = (organizer) => {
    if (!organizer.banned && !window.confirm(`Заблокировать организатора "${organizer.name}"?`)) {
      return
    }

    adminState.toggleOrganizerBan(organizer)
  }

  if (!user) {
    return <AdminAccessNotice message="Войдите в аккаунт администратора, чтобы продолжить." />
  }

  if (!isAdmin) {
    return (
      <AdminAccessNotice
        tone="error"
        message={`Нет доступа: текущая роль ${role || 'UNKNOWN'}. Если права ADMIN только что выдали через backend, выйдите и войдите снова.`}
      />
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <AdminPageHeader
        loading={adminState.loading || ordersState.loading}
        onRefresh={() => {
          adminState.loadOrganizers()
          ordersState.loadPurchaseOrders()
        }}
      />
      <AdminStatusMessage status={adminState.status} onDismiss={adminState.clearStatus} />

      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <OrganizerCreateForm
            actionId={adminState.actionId}
            form={adminState.form}
            onChange={adminState.updateField}
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
          error={ordersState.error}
          loading={ordersState.loading}
          orders={ordersState.orders}
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
