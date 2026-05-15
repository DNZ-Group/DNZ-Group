<template>
  <header class="main-header">
    <div class="header-inner">
      <router-link to="/" class="logo">DNZ-Group</router-link>

      <!-- Hamburger (mobile) -->
      <button
        class="hamburger"
        :class="{ open: mobileOpen }"
        @click.stop="mobileOpen = !mobileOpen"
        aria-label="Menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <!-- Navigation -->
      <nav :class="{ 'nav-open': mobileOpen }" @click="mobileOpen = false">
        <ul>
          <!-- Services dropdown -->
          <li
            class="dropdown"
            @click.stop="servicesOpen = !servicesOpen"
          >
            <span class="dropdown-label">Nos services <span class="arrow">▾</span></span>
            <ul v-show="servicesOpen" class="dropdown-menu" @click.stop>
              <li>
                <router-link to="/services/transport-voiture" @click="closeAll">
                  🚗 Transport Voitures
                </router-link>
              </li>
              <li>
                <router-link to="/services/transport-coli" @click="closeAll">
                  📦 Transport Colis
                </router-link>
              </li>
            </ul>
          </li>

          <li class="nav-contact">Nous contacter</li>

          <!-- Connecté -->
          <li v-if="currentUser" class="user-info">
            <router-link v-if="isAdmin" to="/admin" class="admin-link" @click="mobileOpen = false">
              ⚙️ Dashboard
            </router-link>
            <span class="user-name">👤 {{ currentUser.name }}</span>
            <button class="btn-logout" @click="handleLogout">Déconnexion</button>
          </li>

          <!-- Non connecté -->
          <li v-else class="btn-register">
            <router-link to="/login" class="user-icon-link" @click="mobileOpen = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </router-link>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { currentUser, isAdmin, logout } from '../auth.js'

const router = useRouter()
const servicesOpen = ref(false)
const mobileOpen = ref(false)

function closeAll() {
  servicesOpen.value = false
  mobileOpen.value = false
}

function handleOutsideClick() {
  servicesOpen.value = false
  mobileOpen.value = false
}

function handleLogout() {
  logout()
  mobileOpen.value = false
  router.push('/')
}

onMounted(() => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))
</script>

<style scoped>
.main-header {
  background: #f8f9fa;
  border-bottom: 1px solid #ddd;
  position: sticky;
  top: 0;
  z-index: 200;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.85rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.logo {
  font-weight: bold;
  font-size: 1.5rem;
  color: #2c3e50;
  text-decoration: none;
  white-space: nowrap;
}

/* ── Navigation ── */
nav ul {
  display: flex;
  list-style: none;
  gap: 20px;
  margin: 0;
  padding: 0;
  align-items: center;
}

/* ── Hamburger ── */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  z-index: 300;
}

.hamburger span {
  display: block;
  width: 24px;
  height: 2px;
  background: #2c3e50;
  border-radius: 2px;
  transition: transform 0.25s, opacity 0.25s;
}

.hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.hamburger.open span:nth-child(2) { opacity: 0; }
.hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* ── User area ── */
.btn-register {
  background-color: #42b883;
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.user-icon-link {
  color: white;
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.admin-link {
  background: #2c3e50;
  color: white;
  padding: 4px 12px;
  border-radius: 5px;
  font-size: 0.85rem;
  text-decoration: none;
  transition: background 0.2s;
}

.admin-link:hover { background: #1a252f; }

.user-name {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.95rem;
}

.btn-logout {
  background: transparent;
  border: 1px solid #e74c3c;
  color: #e74c3c;
  padding: 4px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s, color 0.2s;
}

.btn-logout:hover {
  background: #e74c3c;
  color: white;
}

/* ── Dropdown ── */
.dropdown {
  position: relative;
  cursor: pointer;
  user-select: none;
}

.dropdown-label {
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.arrow { font-size: 0.75rem; }

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  min-width: 200px;
  padding: 6px 0;
  z-index: 100;
  flex-direction: column;
  gap: 0;
}

.dropdown-menu li { padding: 0; }

.dropdown-menu a {
  display: block;
  padding: 10px 16px;
  color: #2c3e50;
  text-decoration: none;
  transition: background 0.15s;
  white-space: nowrap;
}

.dropdown-menu a:hover {
  background: #f0faf5;
  color: #42b883;
}

/* ══════════════════════════════
   RESPONSIVE — Mobile ≤ 768px
══════════════════════════════ */
@media (max-width: 768px) {
  .hamburger {
    display: flex;
  }

  nav {
    display: none;
    position: fixed;
    inset: 0;
    top: 58px;
    background: #f8f9fa;
    z-index: 150;
    overflow-y: auto;
  }

  nav.nav-open {
    display: block;
  }

  nav ul {
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem 1.5rem;
    gap: 0;
  }

  nav ul li {
    width: 100%;
    border-bottom: 1px solid #eee;
    padding: 0.85rem 0;
  }

  nav ul li:last-child {
    border-bottom: none;
  }

  .dropdown-menu {
    position: static;
    box-shadow: none;
    border: none;
    background: #f0faf5;
    border-radius: 6px;
    margin-top: 0.5rem;
    padding: 4px 0;
  }

  .dropdown-menu a {
    padding: 8px 12px;
  }

  .user-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .nav-contact {
    color: #2c3e50;
  }
}
</style>


<style scoped>
.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #ddd;
}
.logo {
  font-weight: bold;
  font-size: 1.5rem;
  color: #2c3e50;
}
nav ul {
  display: flex;
  list-style: none;
  gap: 20px;
  margin: 0;
  padding: 0;
  align-items: center;
}
.btn-register {
  background-color: #42b883;
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.user-icon-link {
  color: white;
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.admin-link {
  background: #2c3e50;
  color: white;
  padding: 4px 12px;
  border-radius: 5px;
  font-size: 0.85rem;
  text-decoration: none;
  transition: background 0.2s;
}

.admin-link:hover {
  background: #1a252f;
}

.user-name {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.95rem;
}

.btn-logout {
  background: transparent;
  border: 1px solid #e74c3c;
  color: #e74c3c;
  padding: 4px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s, color 0.2s;
}

.btn-logout:hover {
  background: #e74c3c;
  color: white;
}

/* Dropdown */
.dropdown {
  position: relative;
  cursor: pointer;
  user-select: none;
}

.dropdown-label {
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.arrow {
  font-size: 0.75rem;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  min-width: 200px;
  padding: 6px 0;
  z-index: 100;
  flex-direction: column;
  gap: 0;
}

.dropdown-menu li {
  padding: 0;
}

.dropdown-menu a {
  display: block;
  padding: 10px 16px;
  color: #2c3e50;
  text-decoration: none;
  transition: background 0.15s;
  white-space: nowrap;
}

.dropdown-menu a:hover {
  background: #f0faf5;
  color: #42b883;
}
</style>