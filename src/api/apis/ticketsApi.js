import { deleteData, getData, postData, putData } from '../request'

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

  async sell(ticketData) {
    return await postData('/tickets/sell', ticketData)
  },

  async update(id, ticketData) {
    return await putData(`/tickets/${id}`, ticketData)
  },

  async remove(id) {
    await deleteData(`/tickets/${id}`)
  },

  async uploadFiles(ticketId, files) {
    const formData = new FormData()

    if (files && files.length > 0) {
      for (const file of files) {
        formData.append('ticketFiles', file)
      }
    }

    return await postData(`/tickets/${ticketId}/files`, formData)
  },

  async getFiles(ticketId) {
    return await getData(`/tickets/${ticketId}/files`)
  },

  async getFileDownloadUrl(ticketId, fileId) {
    return await getData(`/tickets/${ticketId}/files/${fileId}/download-url`)
  },

  async getReissuedFileDownloadUrl(ticketId) {
    return await getData(`/tickets/${ticketId}/reissued-file/download-url`)
  },

  async createHold(id) {
    return await postData(`/tickets/${id}/hold`)
  },

  async cancelHold(id) {
    await deleteData(`/tickets/${id}/hold`)
  },

  async buy(id) {
    return await postData(`/tickets/${id}/buy`)
  },
}
