const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

class ApiService {
  async register(email, password) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || 'Ошибка регистрации')
    }

    return response.json().catch(() => ({}))
  }

  async login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || 'Ошибка входа')
    }

    return response.json()
  }

  async getTickets(token) {
    const response = await fetch(`${API_URL}/tickets`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Ошибка загрузки билетов')
    }

    return response.json()
  }
}

export const api = new ApiService()