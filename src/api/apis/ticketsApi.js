import { deleteData, getData, postData, putData } from '../request'

const appendTicketFiles = (formData, files) => {
  if (!files || files.length === 0) {
    return
  }

  for (const file of files) {
    formData.append('ticketFiles', file)
  }
}

const createEntropyToken = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const randomBytes = new Uint8Array(16)
    crypto.getRandomValues(randomBytes)
    return Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  }

  return `${Date.now()}`
}

const createIdempotencyKey = (listingId) => (
  `buy-${listingId}-${Date.now()}-${createEntropyToken()}`
)

export const ticketsApi = {
  async getAll(params) {
    return await getData('/tickets', params ? { params } : undefined)
  },

  async getById(id) {
    return await getData(`/tickets/${id}`)
  },

  async getStatusHistory(id) {
    return await getData(`/tickets/${id}/status-history`)
  },

  async sell(ticketData, files) {
    const formData = new FormData()
    const ticketBlob = new Blob(
      [JSON.stringify(ticketData)],
      { type: 'application/json' }
    )

    formData.append('ticket', ticketBlob)
    appendTicketFiles(formData, files)

    return await postData('/tickets/sell', formData)
  },

  async update(id, ticketData) {
    return await putData(`/tickets/${id}`, ticketData)
  },

  async remove(id) {
    await deleteData(`/tickets/${id}`)
  },

  async getFiles(ticketId) {
    return await getData(`/tickets/${ticketId}/files`)
  },

  async getFilePreviews(ticketId) {
    return await getData(`/tickets/${ticketId}/files/previews`)
  },

  async getFileDownloadUrl(ticketId, fileId) {
    return await getData(`/tickets/${ticketId}/files/${fileId}/download-url`)
  },

  async getReissuedFileDownloadUrl(ticketId) {
    return await getData(`/tickets/${ticketId}/reissued-file/download-url`)
  },

  async buy(id) {
    return await postData(`/tickets/${id}/buy`, null, {
      headers: {
        'Idempotency-Key': createIdempotencyKey(id),
      },
    })
  },
}
