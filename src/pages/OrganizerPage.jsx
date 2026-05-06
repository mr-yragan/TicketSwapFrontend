import { useAuth, useModal } from '@/context'
import { DismissibleAlert } from '@/components/ui'
import { ManualQueues } from '@/features/organizer/components/ManualQueues'
import { OrganizerEventForm } from '@/features/organizer/components/OrganizerEventForm'
import { OrganizerEventsList } from '@/features/organizer/components/OrganizerEventsList'
import { OrganizerPageHeader } from '@/features/organizer/components/OrganizerPageHeader'
import { OrganizerProfileSummary } from '@/features/organizer/components/OrganizerProfileSummary'
import { OrganizerStatusMessage } from '@/features/organizer/components/OrganizerStatusMessage'
import { useOrganizerWorkspace } from '@/features/organizer/hooks/useOrganizerWorkspace'

/*
  Экран организатора — это в первую очередь оболочка над useOrganizerWorkspace.
  Важная развилка здесь одна: manual organizer и API organizer видят разный рабочий процесс,
  но сама страница старается не держать бизнес-детали у себя.
*/
export default function OrganizerPage() {
  const { user } = useAuth()
  const { confirmAction } = useModal()
  const role = (user?.role || '').toUpperCase()
  const isOrganizer = role === 'ORGANIZER'
  const workspace = useOrganizerWorkspace(isOrganizer)

  const handleDeleteEvent = async (eventItem) => {
    const confirmed = await confirmAction({
      title: 'Удалить мероприятие?',
      message: `Мероприятие «${eventItem.name}» будет удалено, если сервер разрешит это сделать.`,
      confirmLabel: 'Удалить мероприятие',
    })

    if (!confirmed) return
    workspace.deleteEvent(eventItem)
  }

  if (!user) {
    return <OrganizerAccessNotice message="Войдите в аккаунт организатора, чтобы продолжить." />
  }

  if (!isOrganizer) {
    return (
      <OrganizerAccessNotice
        tone="error"
        message={`Нет доступа: текущая роль ${role || 'UNKNOWN'}. Если роль ORGANIZER только что выдали, выйдите и войдите снова.`}
      />
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <OrganizerPageHeader
        loading={workspace.loading}
        organizerName={workspace.organizer?.name}
        userEmail={user.email}
        onRefresh={workspace.loadOrganizerData}
      />

      {workspace.loading && !workspace.profile && (
        <div className="rounded-lg border border-gray-200 p-6 text-gray-600">Загрузка данных...</div>
      )}

      {!workspace.loading && workspace.error && (
        <DismissibleAlert tone="error" className="mb-0 p-4" onDismiss={workspace.clearError}>
          {workspace.error}
        </DismissibleAlert>
      )}

      {workspace.profile && (
        <div className="space-y-6">
          <OrganizerStatusMessage status={workspace.status} onDismiss={workspace.clearStatus} />

          <OrganizerProfileSummary
            currentUser={workspace.legacyUser || user}
            isBanned={workspace.isBanned}
            isManual={workspace.isManual}
            metrics={workspace.metrics}
            organizer={workspace.organizer}
          />

          <section className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
            <OrganizerEventForm
              canMutate={workspace.canMutateManualWorkflow}
              editingEventId={workspace.editingEventId}
              eventAction={workspace.eventAction}
              form={workspace.eventForm}
              onCancel={workspace.resetEventForm}
              onChange={workspace.updateEventField}
              onSubmit={workspace.saveEvent}
            />
            <OrganizerEventsList
              canMutate={workspace.canMutateManualWorkflow}
              eventAction={workspace.eventAction}
              events={workspace.events}
              onDelete={handleDeleteEvent}
              onEdit={workspace.editEvent}
            />
          </section>

          {workspace.canMutateManualWorkflow && (
            <ManualQueues
              listingAction={workspace.listingAction}
              onCompleteReissue={workspace.completeReissue}
              onRejectReissue={workspace.rejectReissue}
              onReissueFileChange={workspace.setReissueFile}
              onReissueReasonChange={workspace.setReissueReason}
              onReissueUidChange={workspace.setReissueUid}
              onValidationReasonChange={workspace.setValidationReason}
              onVerifyListing={workspace.verifyListing}
              pendingReissue={workspace.pendingReissue}
              pendingValidation={workspace.pendingValidation}
              reissueReasons={workspace.reissueReasons}
              reissueUids={workspace.reissueUids}
              validationReasons={workspace.validationReasons}
            />
          )}
        </div>
      )}
    </main>
  )
}

function OrganizerAccessNotice({ message, tone = 'default' }) {
  const isError = tone === 'error'

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-950">Панель организатора</h1>
      <div className={isError ? 'mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800' : 'mt-2 text-gray-600'}>
        {message}
      </div>
    </div>
  )
}
