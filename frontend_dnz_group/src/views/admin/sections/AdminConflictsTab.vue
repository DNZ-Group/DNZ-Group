<template>
  <section class="section">
    <div class="section-actions" style="justify-content:space-between">
      <div class="conflict-filters">
        <button :class="['filter-btn', conflictFilter === 'all' && 'active']" @click="conflictFilter = 'all'">
          Tous <span class="unread-badge">{{ conflicts.length }}</span>
        </button>
        <button :class="['filter-btn', conflictFilter === 'open' && 'active']" @click="conflictFilter = 'open'">
          Ouverts <span class="unread-badge" style="background:var(--danger)">{{ openCount }}</span>
        </button>
        <button :class="['filter-btn', conflictFilter === 'resolved' && 'active']" @click="conflictFilter = 'resolved'">
          Résolus
        </button>
      </div>
      <button class="btn-primary" @click="openNewConflictModal">+ Nouveau conflit</button>
    </div>

    <div v-if="filteredConflicts.length === 0" class="empty">Aucun conflit {{ conflictFilter === 'open' ? 'ouvert' : conflictFilter === 'resolved' ? 'résolu' : '' }}.</div>

    <div class="conflict-cards">
      <div v-for="c in filteredConflicts" :key="c.id" :class="['conflict-card', `sev-${c.severity}`]">
        <div class="conflict-header">
          <span class="conflict-title">{{ c.title }}</span>
          <div class="conflict-meta">
            <span :class="['badge', `sev-badge-${c.severity}`]">{{ severityLabel(c.severity) }}</span>
            <span :class="['badge', c.resolved ? 'status-resolved' : 'status-open']">{{ c.resolved ? 'Résolu' : 'Ouvert' }}</span>
            <span class="conflict-date">{{ c.date }}</span>
          </div>
        </div>
        <p class="conflict-desc">{{ c.description }}</p>
        <div class="conflict-actions">
          <button v-if="!c.resolved" class="btn-secondary btn-sm" @click="resolveConflict(c.id)">✓ Marquer résolu</button>
          <button class="btn-danger-sm" @click="deleteConflict(c.id)">Supprimer</button>
        </div>
      </div>
    </div>

    <!-- Modal: nouveau conflit -->
    <div v-if="showConflictModal" class="modal-overlay" @click.self="showConflictModal = false">
      <div class="modal">
        <h2>Nouveau conflit de transport</h2>
        <form @submit.prevent="handleAddConflict">
          <div class="field">
            <label>Titre *</label>
            <input v-model="newConflict.title" type="text" required placeholder="Ex: Retard de livraison" />
          </div>
          <div class="field">
            <label>Description *</label>
            <textarea v-model="newConflict.description" rows="4" required placeholder="Décrivez le conflit…"></textarea>
          </div>
          <div class="field">
            <label>Sévérité</label>
            <select v-model="newConflict.severity">
              <option value="low">Faible</option>
              <option value="medium">Moyen</option>
              <option value="high">Élevé</option>
              <option value="critical">Critique</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="showConflictModal = false">Annuler</button>
            <button type="submit" class="btn-primary">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['open-count-change'])
const CONFLICTS_KEY = 'dnz_conflicts'

function loadConflicts() { return JSON.parse(localStorage.getItem(CONFLICTS_KEY) || '[]') }
function saveConflicts(list) { localStorage.setItem(CONFLICTS_KEY, JSON.stringify(list)); emitCount(list) }
function emitCount(list) { emit('open-count-change', list.filter(c => !c.resolved).length) }

const conflicts = ref(loadConflicts())
const conflictFilter = ref('all')
const showConflictModal = ref(false)
const newConflict = ref({ title: '', description: '', severity: 'medium' })

const openCount = computed(() => conflicts.value.filter(c => !c.resolved).length)

const filteredConflicts = computed(() => {
  if (conflictFilter.value === 'open') return conflicts.value.filter(c => !c.resolved)
  if (conflictFilter.value === 'resolved') return conflicts.value.filter(c => c.resolved)
  return conflicts.value
})

function severityLabel(s) {
  return { low: 'Faible', medium: 'Moyen', high: 'Élevé', critical: 'Critique' }[s] || s
}

function openNewConflictModal() {
  newConflict.value = { title: '', description: '', severity: 'medium' }
  showConflictModal.value = true
}

function handleAddConflict() {
  const c = {
    id: Date.now().toString(),
    title: newConflict.value.title.trim(),
    description: newConflict.value.description.trim(),
    severity: newConflict.value.severity,
    date: new Date().toLocaleDateString('fr-FR'),
    resolved: false
  }
  const list = [...conflicts.value, c]
  conflicts.value = list
  saveConflicts(list)
  showConflictModal.value = false
}

function resolveConflict(id) {
  const list = conflicts.value.map(c => c.id === id ? { ...c, resolved: true } : c)
  conflicts.value = list
  saveConflicts(list)
}

function deleteConflict(id) {
  const list = conflicts.value.filter(c => c.id !== id)
  conflicts.value = list
  saveConflicts(list)
}
</script>
