<template>
  <section class="section">
    <table class="data-table">
      <thead>
        <tr>
          <th>Utilisateur</th>
          <th>Type</th>
          <th>Label</th>
          <th>Détails</th>
          <th>Date</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="a in allArticles" :key="a.id">
          <td>{{ a.userName }}</td>
          <td><span :class="['badge', a.type === 'voiture' ? 'badge-orange' : 'badge-blue']">{{ a.type }}</span></td>
          <td>{{ a.label || '—' }}</td>
          <td>
            <template v-if="a.type === 'voiture'">{{ a.marque }} {{ a.modele }} ({{ a.immatriculation }})</template>
            <template v-else>{{ a.longueur }}×{{ a.largeur }}×{{ a.hauteur }} cm</template>
          </td>
          <td>{{ a.createdAt }}</td>
          <td>
            <button class="btn-danger-sm" @click="confirmDeleteArticle(a)">Supprimer</button>
          </td>
        </tr>
        <tr v-if="allArticles.length === 0">
          <td colspan="6" class="empty">Aucun article enregistré.</td>
        </tr>
      </tbody>
    </table>

    <!-- Modal: confirmation suppression -->
    <div v-if="confirmTarget" class="modal-overlay" @click.self="confirmTarget = null">
      <div class="modal modal-sm">
        <h2>Confirmer la suppression</h2>
        <p>{{ confirmMessage }}</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="confirmTarget = null">Annuler</button>
          <button class="btn-danger" @click="executeDelete">Supprimer</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

defineProps({ allArticles: { type: Array, required: true } })
const emit = defineEmits(['refresh'])

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const confirmTarget = ref(null)
const confirmMessage = ref('')

function confirmDeleteArticle(a) {
  confirmTarget.value = a
  confirmMessage.value = `Supprimer l'article « ${a.label || a.type} » de ${a.userName} ?`
}

async function executeDelete() {
  const token = localStorage.getItem('dnz_token')
  await fetch(`${API}/api/admin/articles/${confirmTarget.value.id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  })
  confirmTarget.value = null
  emit('refresh')
}
</script>
