import { ref } from 'vue'
import { getToken } from './auth.js'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function authHeaders() {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

export const articles = ref([])

export async function refreshArticles() {
  const token = getToken()
  if (!token) { articles.value = []; return }
  try {
    const res = await fetch(`${API}/api/articles`, { headers: authHeaders() })
    if (res.ok) articles.value = await res.json()
  } catch {
    articles.value = []
  }
}

export async function addArticle(article) {
  try {
    const res = await fetch(`${API}/api/articles`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(article)
    })
    if (res.ok) await refreshArticles()
  } catch { /* ignore */ }
}

export async function deleteArticle(id) {
  try {
    const res = await fetch(`${API}/api/articles/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    })
    if (res.ok) articles.value = articles.value.filter(a => a.id !== id)
  } catch { /* ignore */ }
}

