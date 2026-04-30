import { ref } from 'vue'
import { currentUser } from './auth.js'

function getStorageKey() {
  return currentUser.value ? `dnz_articles_${currentUser.value.email}` : null
}

function loadArticles() {
  const key = getStorageKey()
  if (!key) return []
  return JSON.parse(localStorage.getItem(key) || '[]')
}

export const articles = ref(loadArticles())

export function refreshArticles() {
  articles.value = loadArticles()
}

export function addArticle(article) {
  const key = getStorageKey()
  if (!key) return
  const list = loadArticles()
  const newArticle = {
    ...article,
    id: Date.now(),
    createdAt: new Date().toLocaleDateString('fr-FR')
  }
  list.push(newArticle)
  localStorage.setItem(key, JSON.stringify(list))
  articles.value = list
}

export function deleteArticle(id) {
  const key = getStorageKey()
  if (!key) return
  const list = loadArticles().filter(a => a.id !== id)
  localStorage.setItem(key, JSON.stringify(list))
  articles.value = list
}
