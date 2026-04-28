const STORAGE_KEYS = {
  token: 'token',
  email: 'email',
  userId: 'userId',
  userRole: 'userRole',
}

export function saveAuthData({ token, email = '', userId = null, role = '' }) {
  if (token) {
    localStorage.setItem(STORAGE_KEYS.token, token)
  }

  localStorage.setItem(STORAGE_KEYS.email, email)

  if (userId) {
    localStorage.setItem(STORAGE_KEYS.userId, String(userId))
  } else {
    localStorage.removeItem(STORAGE_KEYS.userId)
  }

  if (role) {
    localStorage.setItem(STORAGE_KEYS.userRole, role)
  } else {
    localStorage.removeItem(STORAGE_KEYS.userRole)
  }
}

export function clearAuthData() {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
}

export function getStoredAuthData() {
  const token = localStorage.getItem(STORAGE_KEYS.token)
  const email = localStorage.getItem(STORAGE_KEYS.email) || ''
  const userId = localStorage.getItem(STORAGE_KEYS.userId)
  const role = localStorage.getItem(STORAGE_KEYS.userRole) || ''

  if (!token) {
    return null
  }

  return {
    token,
    email,
    id: userId ? parseInt(userId, 10) : null,
    role,
  }
}
