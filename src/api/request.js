import apiClient from './apiClient'

export async function getData(url, config) {
  const response = await apiClient.get(url, config)
  return response.data
}

export async function postData(url, payload, config) {
  const response = await apiClient.post(url, payload, config)
  return response.data
}

export async function patchData(url, payload, config) {
  const response = await apiClient.patch(url, payload, config)
  return response.data
}

export async function putData(url, payload, config) {
  const response = await apiClient.put(url, payload, config)
  return response.data
}

export async function deleteData(url, config) {
  const response = await apiClient.delete(url, config)
  return response.data
}
