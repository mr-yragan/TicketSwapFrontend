import { Check, FileCheck2, Loader2, Upload, X } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { formatDateTime, formatMoney } from '../utils'

export function ManualQueues({
  listingAction,
  onCompleteReissue,
  onRejectReissue,
  onReissueFileChange,
  onReissueReasonChange,
  onReissueUidChange,
  onValidationReasonChange,
  onVerifyListing,
  pendingReissue,
  pendingValidation,
  reissueReasons,
  reissueUids,
  validationReasons,
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <ManualQueue
        title="Проверка билетов"
        icon={<FileCheck2 size={20} />}
        emptyText="Нет билетов на ручную проверку"
        listings={pendingValidation}
        renderActions={(listing) => (
          <ValidationActions
            listing={listing}
            listingAction={listingAction}
            onReasonChange={onValidationReasonChange}
            onVerifyListing={onVerifyListing}
            reason={validationReasons[listing.id] || ''}
          />
        )}
      />

      <ManualQueue
        title="Ручной перевыпуск"
        icon={<Upload size={20} />}
        emptyText="Нет билетов на перевыпуск"
        listings={pendingReissue}
        renderActions={(listing) => (
          <ReissueActions
            listing={listing}
            listingAction={listingAction}
            onCompleteReissue={onCompleteReissue}
            onFileChange={onReissueFileChange}
            onReasonChange={onReissueReasonChange}
            onRejectReissue={onRejectReissue}
            onUidChange={onReissueUidChange}
            reason={reissueReasons[listing.id] || ''}
            uid={reissueUids[listing.id] || ''}
          />
        )}
      />
    </section>
  )
}

function ManualQueue({ title, icon, emptyText, listings, renderActions }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4">
        {icon}
        <h2 className="text-lg font-semibold text-gray-950">{title}</h2>
      </div>

      <div className="divide-y divide-gray-100">
        {listings.length === 0 && (
          <div className="px-5 py-10 text-center text-gray-500">{emptyText}</div>
        )}

        {listings.map((listing) => (
          <div key={listing.id} className="grid gap-4 px-5 py-4">
            <ListingSummary listing={listing} />
            {renderActions(listing)}
          </div>
        ))}
      </div>
    </div>
  )
}

function ListingSummary({ listing }) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-medium text-gray-950">{listing.eventName || 'Без названия'}</h3>
        <span className="rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-600">{listing.status}</span>
      </div>
      <div className="mt-1 text-sm text-gray-600">{formatDateTime(listing.eventDate)} · {listing.venue || '-'}</div>
      <div className="mt-1 text-sm text-gray-500">
        UID {listing.uid} · {formatMoney(listing.price)} · файлов: {listing.ticketFilesCount ?? 0}
      </div>
      <div className="mt-2 grid gap-1 text-xs text-gray-500 sm:grid-cols-2">
        <span>Продавец: {listing.seller?.email || listing.seller?.login || '-'}</span>
        <span>Покупатель: {listing.buyer?.email || listing.buyer?.login || '-'}</span>
      </div>
    </div>
  )
}

function ValidationActions({ listing, listingAction, onReasonChange, onVerifyListing, reason }) {
  return (
    <div className="space-y-3">
      <textarea
        value={reason}
        onChange={(event) => onReasonChange(listing.id, event.target.value)}
        rows={2}
        maxLength={2000}
        placeholder="Комментарий к решению"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => onVerifyListing(listing, true)}
          disabled={Boolean(listingAction)}
          className="h-10 bg-black text-white px-3 gap-2">
          {listingAction === `verify-${listing.id}-true` ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          Подтвердить
        </Button>
        <Button
          type="button"
          onClick={() => onVerifyListing(listing, false)}
          disabled={Boolean(listingAction)}
          className="h-10 bg-white text-black border border-gray-300 px-3 gap-2">
          {listingAction === `verify-${listing.id}-false` ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
          Отклонить
        </Button>
      </div>
    </div>
  )
}

function ReissueActions({
  listing,
  listingAction,
  onCompleteReissue,
  onFileChange,
  onReasonChange,
  onRejectReissue,
  onUidChange,
  reason,
  uid,
}) {
  return (
    <div className="space-y-3">
      <Input
        value={uid}
        onChange={(event) => onUidChange(listing.id, event.target.value)}
        placeholder="UID нового билета"
      />
      <input
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,image/png,image/jpeg,application/pdf"
        onChange={(event) => onFileChange(listing.id, event.target.files?.[0] || null)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
      <textarea
        value={reason}
        onChange={(event) => onReasonChange(listing.id, event.target.value)}
        rows={2}
        maxLength={2000}
        placeholder="Причина отказа, если перевыпуск невозможен"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => onCompleteReissue(listing)}
          disabled={Boolean(listingAction)}
          className="h-10 bg-black text-white px-3 gap-2">
          {listingAction === `reissue-${listing.id}` ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          Завершить
        </Button>
        <Button
          type="button"
          onClick={() => onRejectReissue(listing)}
          disabled={Boolean(listingAction)}
          className="h-10 bg-white text-black border border-gray-300 px-3 gap-2">
          {listingAction === `reject-reissue-${listing.id}` ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
          Отказать
        </Button>
      </div>
    </div>
  )
}
