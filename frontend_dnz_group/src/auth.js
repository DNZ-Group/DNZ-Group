import { ref, computed } from 'vue'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const currentUser = ref(
  JSON.parse(localStorage.getItem('dnz_current_user') || 'null')
)

export const isAdmin = computed(() => currentUser.value?.role === 'admin')

export function getToken() {
  return localStorage.getItem('dnz_token')
}

function authHeaders() {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

export async function login(email, password) {
  try {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (!res.ok) return false
    const data = await res.json()
    if (!data.token) return false
    localStorage.setItem('dnz_token', data.token)
    localStorage.setItem('dnz_current_user', JSON.stringify(data.user))
    currentUser.value = data.user
    return true
  } catch {
    return false
  }
}

export async function register(userData) {
  try {
    const res = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    const data = await res.json()
    if (!res.ok) return { success: false, message: data.message }
    localStorage.setItem('dnz_token', data.token)
    localStorage.setItem('dnz_current_user', JSON.stringify(data.user))
    currentUser.value = data.user
    return { success: true }
  } catch {
    return { success: false, message: 'Erreur réseau.' }
  }
}

export function logout() {
  currentUser.value = null
  localStorage.removeItem('dnz_current_user')
  localStorage.removeItem('dnz_token')
}

// Admin — gestion des utilisateurs
export async function getAllUsers() {
  try {
    const res = await fetch(`${API}/api/admin/users`, { headers: authHeaders() })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function createUser(userData) {
  try {
    const res = await fetch(`${API}/api/admin/users`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(userData)
    })
    return res.ok
  } catch {
    return false
  }
}

export async function deleteUser(id) {
  try {
    const res = await fetch(`${API}/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    })
    return res.ok
  } catch {
    return false
  }
}
