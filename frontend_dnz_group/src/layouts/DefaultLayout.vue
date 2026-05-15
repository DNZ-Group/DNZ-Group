<template>
  <div class="layout">
    <AppHeader />
    <main class="layout-main">
      <slot />
    </main>
    <footer class="layout-footer">
      <div class="footer-inner">
        <span class="footer-logo">DNZ-Group</span>
        <span class="footer-copy">© {{ year }} Tous droits réservés</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import AppHeader from '../components/AppHeader.vue'
const year = new Date().getFullYear()
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.layout-main {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  box-sizing: border-box;
}

/* Tablet */
@media (max-width: 1024px) {
  .layout-main {
    padding: 1.5rem 1.25rem;
  }
}

/* Mobile */
@media (max-width: 640px) {
  .layout-main {
    padding: 1rem 0.75rem;
  }
}

.layout-footer {
  background: #2c3e50;
  color: #ccc;
  padding: 1.25rem 2rem;
  margin-top: auto;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.footer-logo {
  font-weight: bold;
  color: #42b883;
}

@media (max-width: 640px) {
  .footer-inner {
    justify-content: center;
    text-align: center;
  }
}
</style>
