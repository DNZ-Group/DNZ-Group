import { ref } from 'vue'

const TEST_USER = {
  name: 'Utilisateur Test',
  email: 'test@dnzgroup.com',
  phone: '+33 6 00 00 00 00',
  password: 'test1234'
}

function getUsers() {
  return JSON.parse(localStorage.getItem('dnz_users') || '[]')
}

function saveUsers(users) {
  localStorage.setItem('dnz_users', JSON.stringify(users))
}

// Pré-enregistre le compte de test au premier chargement
function seedTestUser() {
  const users = getUsers()
  const exists = users.find(u => u.email === TEST_USER.email)
  if (!exists) {
    users.push(TEST_USER)
    saveUsers(users)
  }
}

seedTestUser()

export const currentUser = ref(
  JSON.parse(localStorage.getItem('dnz_current_user') || 'null')
)

export function login(email, password) {
  const users = getUsers()
  const user = users.find(u => u.email === email && u.password === password)
  if (!user) return false
  const { password: _, ...safeUser } = user
  currentUser.value = safeUser
  localStorage.setItem('dnz_current_user', JSON.stringify(safeUser))
  return true
}

export function register(userData) {
  const users = getUsers()
  if (users.find(u => u.email === userData.email)) return false
  users.push(userData)
  saveUsers(users)
  const { password: _, ...safeUser } = userData
  currentUser.value = safeUser
  localStorage.setItem('dnz_current_user', JSON.stringify(safeUser))
  return true
}

export function logout() {
  currentUser.value = null
  localStorage.removeItem('dnz_current_user')
}
