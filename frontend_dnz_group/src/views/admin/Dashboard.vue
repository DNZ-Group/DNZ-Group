<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-logo">DNZ-Group</div>
      <p class="sidebar-role">Panneau administrateur</p>
      <nav class="sidebar-nav">
        <button :class="{ active: tab === 'stats' }" @click="tab = 'stats'">
          <span class="icon">📊</span> Statistiques
        </button>
        <button :class="{ active: tab === 'users' }" @click="tab = 'users'">
          <span class="icon">👥</span> Utilisateurs
        </button>
        <button :class="{ active: tab === 'articles' }" @click="tab = 'articles'">
          <span class="icon">📦</span> Articles
        </button>
        <button :class="{ active: tab === 'email' }" @click="openEmailTab">
          <span class="icon">✉️</span> Messagerie
          <span v-if="inboxUnread > 0" class="unread-badge">{{ inboxUnread }}</span>
        </button>
        <button :class="{ active: tab === 'calendar' }" @click="tab = 'calendar'">
          <span class="icon">📅</span> Calendrier
        </button>
        <button :class="{ active: tab === 'conflicts' }" @click="tab = 'conflicts'">
          <span class="icon">⚠️</span> Conflits
          <span v-if="openConflicts > 0" class="unread-badge">{{ openConflicts }}</span>
        </button>
        <button :class="{ active: tab === 'progress' }" @click="tab = 'progress'">
          <span class="icon">📈</span> Progression
        </button>
        <button :class="{ active: tab === 'suivi' }" @click="tab = 'suivi'">
          <span class="icon">🚢</span> Suivi conteneur
        </button>
      </nav>
      <button class="sidebar-logout" @click="handleLogout">⬅ Déconnexion</button>
    </aside>

    <!-- Mobile topbar (dropdown nav) -->
    <div class="mobile-topbar">
      <div class="mobile-topbar-brand">
        <span class="mobile-logo">DNZ-Group</span>
        <span class="mobile-role">Admin</span>
      </div>
      <div class="mobile-topbar-controls">
        <select class="mobile-nav-select" :value="tab" @change="onMobileTabChange">
          <option value="stats">📊 Statistiques</option>
          <option value="users">👥 Utilisateurs</option>
          <option value="articles">📦 Articles</option>
          <option value="email">✉️ Messagerie{{ inboxUnread > 0 ? ` (${inboxUnread})` : '' }}</option>
          <option value="calendar">📅 Calendrier</option>
          <option value="conflicts">⚠️ Conflits{{ openConflicts > 0 ? ` (${openConflicts})` : '' }}</option>
          <option value="progress">📈 Progression</option>
          <option value="suivi">🚢 Suivi conteneur</option>
          <option value="__logout__" style="color:#f87171">⬅ Déconnexion</option>
        </select>
      </div>
    </div>

    <!-- Main content -->
    <main class="admin-main">
      <!-- Header -->
      <div class="admin-topbar">
        <h1 class="page-title">{{ tabTitle }}</h1>
        <span class="admin-badge">👤 {{ currentUser?.name }}</span>
      </div>

      <AdminStatsTab v-if="tab === 'stats'" :stats="stats" :recent-users="recentUsers" />
      <AdminUsersTab v-if="tab === 'users'" :all-users="allUsers" @refresh="loadUsers" />
      <AdminArticlesTab v-if="tab === 'articles'" :all-articles="allArticles" @refresh="loadArticles" />
      <AdminEmailTab v-if="tab === 'email'" @unread-change="inboxUnread = $event" />
      <AdminCalendarTab v-if="tab === 'calendar'" />
      <AdminConflictsTab v-if="tab === 'conflicts'" @open-count-change="openConflicts = $event" />
      <AdminProgressTab v-if="tab === 'progress'" :all-users="allUsers" :all-articles="allArticles" />
      <AdminContainersTab v-if="tab === 'suivi'" />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { currentUser, logout, getAllUsers } from '../../auth.js'
import AdminStatsTab from './sections/AdminStatsTab.vue'
import AdminUsersTab from './sections/AdminUsersTab.vue'
import AdminArticlesTab from './sections/AdminArticlesTab.vue'
import AdminEmailTab from './sections/AdminEmailTab.vue'
import AdminCalendarTab from './sections/AdminCalendarTab.vue'
import AdminConflictsTab from './sections/AdminConflictsTab.vue'
import AdminProgressTab from './sections/AdminProgressTab.vue'
import AdminContainersTab from './sections/AdminContainersTab.vue'

const router = useRouter()
const tab = ref('stats')
const inboxUnread = ref(0)
const openConflicts = ref(
  JSON.parse(localStorage.getItem('dnz_conflicts') || '[]').filter(c => !c.resolved).length
)

const tabTitle = computed(() => {
  const titles = {
    stats: 'Statistiques',
    users: 'Gestion des utilisateurs',
    articles: 'Gestion des articles',
    email: 'Messagerie',
    calendar: 'Calendrier des transports',
    conflicts: 'Conflits de transport',
    progress: "Progression de l'entreprise",
    suivi: 'Suivi de conteneur'
  }
  return titles[tab.value] || tab.value
})

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const allUsers = ref([])
const allArticles = ref([])

async function loadUsers() {
  allUsers.value = await getAllUsers()
}

async function loadArticles() {
  const token = localStorage.getItem('dnz_token')
  if (!token) return
  try {
    const res = await fetch(`${API}/api/admin/articles`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (res.ok) allArticles.value = await res.json()
  } catch { /* ignore */ }
}

onMounted(async () => {
  await loadUsers()
  await loadArticles()
})

const stats = computed(() => ({
  totalUsers: allUsers.value.filter(u => u.role !== 'admin').length,
  totalArticles: allArticles.value.length,
  voitures: allArticles.value.filter(a => a.type === 'voiture').length,
  cartons: allArticles.value.filter(a => a.type === 'carton').length
}))

const recentUsers = computed(() => allUsers.value.slice(0, 5))

function openEmailTab() {
  tab.value = 'email'
}

function onMobileTabChange(e) {
  const val = e.target.value
  if (val === '__logout__') handleLogout()
  else tab.value = val
}

function handleLogout() {
  logout()
  router.push('/')
}
</script>

<style>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f0f4f8;
  font-family: 'Segoe UI', sans-serif;
}

/* Mobile topbar */
.mobile-topbar {
  display: none;
}

@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }

  .sidebar {
    display: none;
  }

  .mobile-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #1e293b;
    padding: 0.75rem 1rem;
    position: sticky;
    top: 0;
    z-index: 100;
    gap: 0.75rem;
  }

  .mobile-topbar-brand {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
  }

  .mobile-logo {
    font-size: 1.1rem;
    font-weight: 700;
    color: #38bdf8;
  }

  .mobile-role {
    font-size: 0.7rem;
    color: #94a3b8;
  }

  .mobile-topbar-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    justify-content: flex-end;
  }

  .mobile-nav-select {
    background: #334155;
    color: white;
    border: 1px solid #475569;
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
    cursor: pointer;
    flex: 1;
    max-width: 220px;
    outline: none;
  }

  .mobile-nav-select:focus {
    border-color: #38bdf8;
  }

  .admin-main {
    padding: 1rem;
  }

  .admin-topbar {
    display: none;
  }

  .page-title {
    font-size: 1.25rem;
  }
}

/* Sidebar */
.sidebar {
  width: 240px;
  background: #1e293b;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 2rem 1.25rem;
  gap: 0.5rem;
  position: sticky;
  top: 0;
  height: 100vh;
}

.sidebar-logo {
  font-size: 1.4rem;
  font-weight: 700;
  color: #38bdf8;
  margin-bottom: 0.25rem;
}

.sidebar-role {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 1.5rem;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.sidebar-nav button {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: transparent;
  border: none;
  color: #cbd5e1;
  padding: 0.65rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  text-align: left;
  transition: background 0.2s, color 0.2s;
}

.sidebar-nav button:hover,
.sidebar-nav button.active {
  background: #334155;
  color: white;
}

.icon { font-size: 1rem; }

.sidebar-logout {
  background: transparent;
  border: 1px solid #475569;
  color: #94a3b8;
  padding: 0.55rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s, color 0.2s;
  margin-top: auto;
}

.sidebar-logout:hover {
  background: #334155;
  color: white;
}

/* Main */
.admin-main {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.admin-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.admin-badge {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 0.4rem 0.9rem;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #475569;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem 1.25rem;
  box-shadow: 0 1px 6px rgba(0,0,0,0.07);
  border-left: 4px solid transparent;
}

.stat-card.blue  { border-color: #3b82f6; }
.stat-card.green { border-color: #22c55e; }
.stat-card.orange { border-color: #f97316; }
.stat-card.purple { border-color: #a855f7; }

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.recent-section h2 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.75rem;
}

/* Section */
.section { animation: fadeIn 0.2s ease; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.section-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

/* Table */
.data-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(0,0,0,0.07);
}

.data-table th {
  background: #f8fafc;
  color: #64748b;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.data-table td {
  padding: 0.8rem 1rem;
  font-size: 0.9rem;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
}

.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: #f8fafc; }

.empty { text-align: center; color: #94a3b8; padding: 2rem; }

/* Badges */
.badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: capitalize;
}

.badge-admin  { background: #fef3c7; color: #b45309; }
.badge-user   { background: #dbeafe; color: #1d4ed8; }
.badge-orange { background: #ffedd5; color: #c2410c; }
.badge-blue   { background: #dbeafe; color: #1d4ed8; }

/* Buttons */
.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.btn-primary:hover { background: #2563eb; }

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.btn-secondary:hover { background: #e2e8f0; }

.btn-danger {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.btn-danger:hover { background: #dc2626; }

.btn-danger-sm {
  background: transparent;
  border: 1px solid #fca5a5;
  color: #ef4444;
  padding: 3px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background 0.2s, color 0.2s;
}

.btn-danger-sm:hover {
  background: #ef4444;
  color: white;
}

.text-muted { color: #cbd5e1; font-size: 0.85rem; }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal {
  background: white;
  border-radius: 14px;
  padding: 2rem;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.18);
}

.modal-sm { max-width: 360px; }

.modal h2 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1.25rem;
}

.modal p { color: #475569; margin-bottom: 1.5rem; }

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 1rem;
}

.field label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
}

.field input,
.field select {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}

.field input:focus,
.field select:focus {
  border-color: #3b82f6;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.error-banner {
  background: #fee2e2;
  color: #b91c1c;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.success-banner {
  background: #dcfce7;
  color: #15803d;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

/* ===== EMAIL / MESSAGERIE ===== */
.email-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  gap: 0.75rem;
}

.email-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.email-tabs button {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 0.45rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.88rem;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}

.email-tabs button:hover {
  background: #f1f5f9;
}

.email-tabs button.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-icon {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.4rem 0.65rem;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}

.btn-icon:hover { background: #f1f5f9; }

.close-preview {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
}

.unread-badge {
  background: #ef4444;
  color: white;
  border-radius: 20px;
  font-size: 0.7rem;
  padding: 1px 6px;
  font-weight: 700;
}

.email-loading {
  text-align: center;
  color: #64748b;
  padding: 2rem;
  font-size: 0.95rem;
}

.email-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.07);
  overflow: hidden;
  margin-bottom: 1rem;
}

.email-item {
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background 0.15s;
}

.email-item:last-child { border-bottom: none; }

.email-item:hover { background: #f8fafc; }

.email-item.active { background: #eff6ff; }

.email-item.unread .email-subject {
  font-weight: 700;
  color: #1e293b;
}

.email-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.2rem;
}

.email-from {
  font-size: 0.88rem;
  font-weight: 600;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60%;
}

.email-date {
  font-size: 0.78rem;
  color: #94a3b8;
  white-space: nowrap;
}

.email-subject {
  font-size: 0.88rem;
  color: #475569;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.email-preview {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.07);
  padding: 1.25rem;
  position: relative;
}

.email-preview-header {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.88rem;
  color: #475569;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 0.75rem;
  padding-right: 2.5rem;
}

.email-preview-header strong { color: #1e293b; }

.email-preview-body {
  white-space: pre-wrap;
  font-size: 0.9rem;
  color: #334155;
  line-height: 1.6;
  max-height: 340px;
  overflow-y: auto;
}

.email-preview-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}

.compose-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.07);
  padding: 1.5rem;
}

.compose-card .field textarea {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  outline: none;
  width: 100%;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
  transition: border-color 0.2s;
}

.compose-card .field textarea:focus { border-color: #3b82f6; }

.compose-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

/* ===== CALENDRIER ===== */
.cal-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.cal-month-label {
  flex: 1;
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
  text-transform: capitalize;
  margin: 0;
}

.cal-today-btn {
  margin-left: auto;
  padding: 0.35rem 0.9rem;
  font-size: 0.82rem;
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 2rem;
}

.cal-day-name {
  text-align: center;
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  padding: 0.4rem 0;
}

.cal-cell {
  background: white;
  border-radius: 8px;
  min-height: 80px;
  padding: 0.4rem 0.5rem;
  cursor: pointer;
  border: 1px solid #e2e8f0;
  transition: box-shadow 0.15s, border-color 0.15s;
  position: relative;
}

.cal-cell:hover {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px #bfdbfe;
}

.cal-cell--empty {
  background: transparent;
  border: none;
  cursor: default;
  box-shadow: none;
}

.cal-cell--today {
  border-color: #3b82f6;
  background: #eff6ff;
}

.cal-cell--today .cal-day-num {
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cal-cell--past {
  background: #f8fafc;
  opacity: 0.7;
}

.cal-day-num {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  display: inline-flex;
  margin-bottom: 0.2rem;
}

.cal-events-preview {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cal-chip {
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 0.7rem;
  padding: 1px 5px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cal-chip--more {
  background: #f1f5f9;
  color: #64748b;
}

/* Liste transports */
.cal-list-section h2 {
  font-size: 1.05rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.75rem;
}

/* Modal jour */
.day-events-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.day-event-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
}

.day-event-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.day-event-time {
  font-size: 0.78rem;
  color: #94a3b8;
}

.day-event-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
}

.day-event-desc {
  font-size: 0.8rem;
  color: #64748b;
}

/* ===== CONFLITS ===== */
.conflict-filters {
  display: flex;
  gap: 0.4rem;
}

.filter-btn {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 0.35rem 0.9rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.82rem;
  color: #475569;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.filter-btn:hover { background: #f1f5f9; }
.filter-btn.active { background: #1e293b; color: white; border-color: #1e293b; }

.conflict-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.conflict-card {
  background: white;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  box-shadow: 0 1px 6px rgba(0,0,0,0.07);
  border-left: 4px solid #e2e8f0;
}

.conflict-card--low   { border-left-color: #22c55e; }
.conflict-card--medium { border-left-color: #f97316; }
.conflict-card--high  { border-left-color: #ef4444; }

.conflict-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.conflict-meta {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.conflict-date {
  font-size: 0.82rem;
  color: #64748b;
}

.conflict-severity {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
}

.sev-low    { background: #dcfce7; color: #15803d; }
.sev-medium { background: #ffedd5; color: #c2410c; }
.sev-high   { background: #fee2e2; color: #b91c1c; }

.conflict-status {
  font-size: 0.78rem;
  font-weight: 600;
}

.status-open     { color: #ef4444; }
.status-resolved { color: #22c55e; }

.conflict-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-resolve {
  background: transparent;
  border: 1px solid #86efac;
  color: #16a34a;
  padding: 3px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background 0.15s, color 0.15s;
}

.btn-resolve:hover {
  background: #22c55e;
  color: white;
}

.conflict-client {
  font-size: 0.82rem;
  color: #64748b;
  margin-bottom: 0.2rem;
}

.conflict-title {
  font-size: 0.97rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.2rem;
}

.conflict-desc {
  font-size: 0.85rem;
  color: #475569;
  line-height: 1.5;
}

.modal textarea {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  outline: none;
  width: 100%;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
  transition: border-color 0.2s;
}

.modal textarea:focus { border-color: #3b82f6; }

/* ===== PROGRESSION ===== */
.prog-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.prog-kpi {
  background: white;
  border-radius: 12px;
  padding: 1.1rem 1.25rem;
  box-shadow: 0 1px 6px rgba(0,0,0,0.07);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.prog-kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
}

.prog-kpi-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1;
}

.prog-kpi-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  margin-top: 0.2rem;
}

.prog-kpi-sub {
  font-size: 0.75rem;
  color: #94a3b8;
}

.prog-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

@media (max-width: 700px) { .prog-row { grid-template-columns: 1fr; } }

.prog-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 6px rgba(0,0,0,0.07);
}

.prog-card h3 {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1rem;
}

.prog-card--full {
  margin-bottom: 1rem;
}

/* Donut */
.prog-donut-wrapper {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.prog-donut {
  width: 90px;
  height: 90px;
  flex-shrink: 0;
}

.prog-donut-legend {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: #475569;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Bars */
.prog-bars {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.prog-bar-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.prog-bar-label {
  width: 60px;
  font-size: 0.8rem;
  color: #64748b;
  text-align: right;
  flex-shrink: 0;
}

.prog-bar-label--lg {
  width: 90px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.prog-bar-count {
  width: 24px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #334155;
  text-align: right;
  white-space: nowrap;
}

.prog-bar-pct {
  font-weight: 400;
  color: #94a3b8;
  font-size: 0.75rem;
}

.prog-empty {
  font-size: 0.85rem;
  color: #94a3b8;
  padding: 1rem 0;
}

/* Contenu cartons grid */
.prog-contenu-grid {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  margin-top: 0.5rem;
}

.prog-contenu-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.prog-contenu-rank {
  width: 28px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
  text-align: center;
  flex-shrink: 0;
}

.prog-contenu-label {
  width: 130px;
  font-size: 0.83rem;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}

.prog-contenu-bar-wrap {
  flex: 1;
  background: #f1f5f9;
  border-radius: 20px;
  height: 10px;
  overflow: hidden;
}

.prog-contenu-bar {
  height: 100%;
  background: linear-gradient(90deg, #f97316, #fbbf24);
  border-radius: 20px;
  transition: width 0.6s ease;
  min-width: 4px;
}

.prog-contenu-count {
  width: 30px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #334155;
  text-align: right;
  flex-shrink: 0;
}

.prog-bar-track {
  flex: 1;
  background: #f1f5f9;
  border-radius: 20px;
  height: 10px;
  overflow: hidden;
}

.prog-bar-fill {
  height: 100%;
  border-radius: 20px;
  transition: width 0.6s ease;
  min-width: 4px;
}

.prog-conflict-summary {
  display: flex;
  gap: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f1f5f9;
}

.prog-mini-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.mini-val {
  font-size: 1.3rem;
  font-weight: 800;
  color: #1e293b;
}

.mini-lbl {
  font-size: 0.72rem;
  color: #94a3b8;
}

/* Bar chart */
.prog-chart {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 120px;
  padding-bottom: 0.25rem;
}

.prog-chart-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  height: 100%;
}

.prog-chart-bar-wrap {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.prog-chart-bar {
  width: 100%;
  max-width: 32px;
  border-radius: 6px 6px 0 0;
  min-height: 4px;
  transition: height 0.5s ease;
}

.prog-chart-label {
  font-size: 0.7rem;
  color: #94a3b8;
  text-transform: capitalize;
}

/* Methods grid */
.prog-methods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.prog-method {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.prog-method-icon {
  font-size: 1.5rem;
  margin-bottom: 0.2rem;
}

.prog-method-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
}

.prog-method-desc {
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.5;
  flex: 1;
}

.prog-method-metric {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
  margin-top: 0.4rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e2e8f0;
}

.metric-val {
  font-size: 1.3rem;
  font-weight: 800;
  color: #1e293b;
}

.metric-unit {
  font-size: 0.75rem;
  color: #94a3b8;
}

/* ===== SUIVI CONTENEUR ===== */
.container-card {
  background: white;
  border-radius: 14px;
  box-shadow: 0 1px 8px rgba(0,0,0,0.08);
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.container-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #1e293b;
  color: white;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.container-title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.container-icon { font-size: 1.5rem; }

.container-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: white;
}

.container-sub {
  font-size: 0.8rem;
  color: #94a3b8;
}

.container-header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.container-status-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
}

.cstatus-pending   { background: #334155; color: #94a3b8; }
.cstatus-loading   { background: #fef3c7; color: #b45309; }
.cstatus-voyage    { background: #dbeafe; color: #1d4ed8; }
.cstatus-unloading { background: #ffedd5; color: #c2410c; }
.cstatus-done      { background: #dcfce7; color: #15803d; }

/* Timeline */
.timeline {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.tl-step {
  display: flex;
  gap: 1rem;
  padding-bottom: 1.5rem;
  position: relative;
}

.tl-step::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 22px;
  bottom: 0;
  width: 2px;
  background: #e2e8f0;
}

.tl-step:last-child::before { display: none; }

.tl-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #e2e8f0;
  border: 3px solid white;
  box-shadow: 0 0 0 2px #e2e8f0;
  flex-shrink: 0;
  margin-top: 1px;
  z-index: 1;
}

.tl-step--done .tl-dot {
  background: #22c55e;
  box-shadow: 0 0 0 2px #bbf7d0;
}

.tl-content { flex: 1; }

.tl-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.tl-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.4rem;
  font-size: 0.85rem;
}

.tl-label { color: #94a3b8; }

.tl-val {
  color: #334155;
  font-weight: 600;
  background: #f8fafc;
  padding: 1px 6px;
  border-radius: 4px;
}

.tl-duration {
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
}

.tl-edit-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
  align-items: center;
}

.tl-input {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.3rem 0.6rem;
  font-size: 0.82rem;
  outline: none;
  transition: border-color 0.2s;
}

.tl-input:focus { border-color: #3b82f6; }
.tl-input--sm { width: 90px; }

.btn-tl {
  background: #334155;
  color: white;
  border: none;
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background 0.2s;
}

.btn-tl:hover { background: #1e293b; }
.btn-tl--green { background: #22c55e; }
.btn-tl--green:hover { background: #16a34a; }
.btn-tl--blue { background: #3b82f6; }
.btn-tl--blue:hover { background: #2563eb; }
.btn-tl--xs { padding: 0.2rem 0.5rem; font-size: 0.75rem; }

.tl-deposits {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.deposit-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.3rem 0.7rem;
  font-size: 0.82rem;
  flex-wrap: wrap;
}

.deposit-time { color: #94a3b8; }
.deposit-client { color: #334155; font-weight: 600; }
.deposit-count { color: #475569; }

.btn-add-deposit {
  background: transparent;
  border: 1px dashed #cbd5e1;
  color: #64748b;
  padding: 0.3rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background 0.2s;
  align-self: flex-start;
  margin-top: 0.2rem;
}

.btn-add-deposit:hover { background: #f1f5f9; }

.btn-icon-xs {
  background: transparent;
  border: 1px solid #fca5a5;
  color: #ef4444;
  border-radius: 4px;
  padding: 1px 5px;
  cursor: pointer;
  font-size: 0.72rem;
  margin-left: auto;
}

.pickup-status { font-size: 0.8rem; font-weight: 600; }
.pickup-done { color: #22c55e; }
.pickup-pending { color: #f97316; }

.tl-pickup-summary {
  font-size: 0.8rem;
  color: #64748b;
  padding: 0.25rem 0;
}

/* Historique conteneurs */
.container-card--archived { opacity: 0.92; }

.history-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  padding: 1.25rem 1.5rem;
}

.history-block {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.history-block-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.35rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid #e2e8f0;
}

.history-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  flex-wrap: wrap;
}

.history-deposits {
  margin-top: 0.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>
