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


const ADMIN_USER = {
  name: 'Administrateur',
  email: 'admin@dnzgroup.com',
  phone: '',
  password: 'Admin@2026',
  role: 'admin'
}

const ADMIN_TEST_USER = {
  name: 'Admin Test',
  email: 'admin.test@dnzgroup.com',
  phone: '+33 6 11 22 33 44',
  password: 'TestAdmin@2026',
  role: 'admin'
}

function getUsers() {
  return JSON.parse(localStorage.getItem('dnz_users') || '[]')
}

function saveUsers(users) {
  localStorage.setItem('dnz_users', JSON.stringify(users))
}

// Pré-enregistre les comptes de test et admin au premier chargement
function seedTestUser() {
  const users = getUsers()
  if (!users.find(u => u.email === TEST_USER.email)) {
    users.push(TEST_USER)
    saveUsers(users)
  }
}

function seedAdminUser() {
  const users = getUsers()
  if (!users.find(u => u.email === ADMIN_USER.email)) {
    users.push(ADMIN_USER)
    saveUsers(users)
  }
}

function seedAdminTestUser() {
  const users = getUsers()
  if (!users.find(u => u.email === ADMIN_TEST_USER.email)) {
    users.push(ADMIN_TEST_USER)
    saveUsers(users)
  }
}

seedTestUser()
seedAdminUser()
seedAdminTestUser()

export const currentUser = ref(
  JSON.parse(localStorage.getItem('dnz_current_user') || 'null')
)

export const isAdmin = computed(() => currentUser.value?.role === 'admin')

export function login(email, password) {
  const users = getUsers()
  const user = users.find(u => u.email === email && u.password === password)
  if (!user) return false
  const { password: _, ...safeUser } = user
  currentUser.value = safeUser
  localStorage.setItem('dnz_current_user', JSON.stringify(safeUser))

  // Pour les admins, récupérer un vrai JWT depuis le backend (pour les routes API admin)
  if (safeUser.role === 'admin') {
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(r => r.json())
      .then(data => { if (data.token) localStorage.setItem('dnz_token', data.token) })
      .catch(() => {})
  }

  return true
}

export function register(userData) {
  const users = getUsers()
  if (users.find(u => u.email === userData.email)) return false
  users.push({ ...userData, role: userData.role || 'user' })
  saveUsers(users)
  const { password: _, ...safeUser } = userData
  currentUser.value = { ...safeUser, role: userData.role || 'user' }
  localStorage.setItem('dnz_current_user', JSON.stringify(currentUser.value))
  return true
}

export function logout() {
  currentUser.value = null
  localStorage.removeItem('dnz_current_user')
  localStorage.removeItem('dnz_token')
}

// Admin: lire tous les utilisateurs
export function getAllUsers() {
  return getUsers().map(({ password, ...u }) => u)
}

// Admin: créer un utilisateur (avec rôle)
export function createUser(userData) {
  const users = getUsers()
  if (users.find(u => u.email === userData.email)) return false
  users.push({ ...userData, role: userData.role || 'user' })
  saveUsers(users)
  return true
}

// Admin: supprimer un utilisateur
export function deleteUser(email) {
  const users = getUsers()
  const user = users.find(u => u.email === email)
  if (!user || user.role === 'admin') return false
  saveUsers(users.filter(u => u.email !== email))
  return true
}
