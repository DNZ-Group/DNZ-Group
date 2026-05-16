<template>
  <section class="section">
    <div class="stats-grid">
      <div class="stat-card blue">
        <div class="stat-value">{{ stats.totalUsers }}</div>
        <div class="stat-label">Utilisateurs</div>
      </div>
      <div class="stat-card green">
        <div class="stat-value">{{ stats.totalArticles }}</div>
        <div class="stat-label">Articles total</div>
      </div>
      <div class="stat-card orange">
        <div class="stat-value">{{ stats.voitures }}</div>
        <div class="stat-label">Voitures</div>
      </div>
      <div class="stat-card purple">
        <div class="stat-value">{{ stats.cartons }}</div>
        <div class="stat-label">Cartons</div>
      </div>
    </div>

    <div class="recent-section">
      <h2>Derniers utilisateurs inscrits</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>E-mail</th>
            <th>Rôle</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in recentUsers" :key="u.email">
            <td>{{ u.name }}</td>
            <td>{{ u.email }}</td>
            <td><span :class="['badge', u.role === 'admin' ? 'badge-admin' : 'badge-user']">{{ u.role }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
defineProps({
  stats: { type: Object, required: true },
  recentUsers: { type: Array, required: true }
})
</script>
