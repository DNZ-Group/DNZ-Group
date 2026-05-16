<template>
  <section class="section">
    <div class="cal-header">
      <button class="btn-icon" @click="prevMonth">&#8249;</button>
      <h2 class="cal-month-label">{{ monthLabel }}</h2>
      <button class="btn-icon" @click="nextMonth">&#8250;</button>
      <button class="btn-primary cal-today-btn" @click="goToday">Aujourd'hui</button>
    </div>

    <div class="cal-grid">
      <div class="cal-day-name" v-for="d in dayNames" :key="d">{{ d }}</div>
      <div
        v-for="cell in calCells" :key="cell.key"
        :class="['cal-cell', { 'cal-cell--empty': !cell.day, 'cal-cell--today': cell.isToday, 'cal-cell--has-event': cell.events.length > 0, 'cal-cell--past': cell.isPast }]"
        @click="cell.day && openDayModal(cell)"
      >
        <span v-if="cell.day" class="cal-day-num">{{ cell.day }}</span>
        <div class="cal-events-preview">
          <span v-for="ev in cell.events.slice(0, 2)" :key="ev.id" class="cal-chip">{{ ev.label }}</span>
          <span v-if="cell.events.length > 2" class="cal-chip cal-chip--more">+{{ cell.events.length - 2 }}</span>
        </div>
      </div>
    </div>

    <div class="cal-list-section">
      <h2>Tous les transports planifiés</h2>
      <div v-if="sortedEvents.length === 0" class="empty">Aucun transport planifié.</div>
      <table v-else class="data-table">
        <thead>
          <tr><th>Date</th><th>Heure</th><th>Libellé</th><th>Description</th><th>Statut</th><th>Action</th></tr>
        </thead>
        <tbody>
          <tr v-for="ev in sortedEvents" :key="ev.id">
            <td>{{ ev.date }}</td>
            <td>{{ ev.time || '—' }}</td>
            <td>{{ ev.label }}</td>
            <td>{{ ev.description || '—' }}</td>
            <td><span :class="['badge', ev.isPast ? 'badge-user' : 'badge-orange']">{{ ev.isPast ? 'Passé' : 'À venir' }}</span></td>
            <td><button class="btn-danger-sm" @click="deleteEvent(ev.id)">Supprimer</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal: jour calendrier -->
    <div v-if="dayModal.open" class="modal-overlay" @click.self="dayModal.open = false">
      <div class="modal">
        <h2>📅 {{ dayModal.dateLabel }}</h2>
        <div v-if="dayModal.events.length > 0" class="day-events-list">
          <div v-for="ev in dayModal.events" :key="ev.id" class="day-event-item">
            <div class="day-event-info">
              <span class="day-event-time">{{ ev.time || '—' }}</span>
              <span class="day-event-label">{{ ev.label }}</span>
              <span v-if="ev.description" class="day-event-desc">{{ ev.description }}</span>
            </div>
            <button class="btn-danger-sm" @click="deleteEvent(ev.id); dayModal.events = dayModal.events.filter(e => e.id !== ev.id)">✕</button>
          </div>
        </div>
        <p v-else class="text-muted" style="margin-bottom:1rem">Aucun transport ce jour.</p>
        <div v-if="calAddError" class="error-banner">{{ calAddError }}</div>
        <form @submit.prevent="handleAddEvent">
          <div class="field">
            <label>Libellé *</label>
            <input v-model="newEvent.label" type="text" required placeholder="Ex: Transport colis Paris" />
          </div>
          <div style="display:flex;gap:0.75rem">
            <div class="field" style="flex:1">
              <label>Heure</label>
              <input v-model="newEvent.time" type="time" />
            </div>
          </div>
          <div class="field">
            <label>Description</label>
            <input v-model="newEvent.description" type="text" placeholder="Détails optionnels" />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="dayModal.open = false">Fermer</button>
            <button type="submit" class="btn-primary">+ Ajouter</button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const CAL_KEY = 'dnz_transport_events'
const today = new Date()
const calYear = ref(today.getFullYear())
const calMonth = ref(today.getMonth())
const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const monthLabel = computed(() =>
  new Date(calYear.value, calMonth.value, 1).toLocaleString('fr-FR', { month: 'long', year: 'numeric' })
)

function loadEvents() { return JSON.parse(localStorage.getItem(CAL_KEY) || '[]') }
function saveEvents(evs) { localStorage.setItem(CAL_KEY, JSON.stringify(evs)) }

const calEvents = ref(loadEvents())

const calCells = computed(() => {
  const year = calYear.value
  const month = calMonth.value
  const firstDay = new Date(year, month, 1).getDay()
  const offset = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayStr = today.toISOString().slice(0, 10)
  const cells = []
  for (let i = 0; i < offset; i++) cells.push({ key: `e${i}`, day: null, events: [], isToday: false, isPast: false })
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ key: dateStr, day: d, dateStr, events: calEvents.value.filter(e => e.date === dateStr), isToday: dateStr === todayStr, isPast: dateStr < todayStr })
  }
  return cells
})

const sortedEvents = computed(() => {
  const todayStr = today.toISOString().slice(0, 10)
  return [...calEvents.value]
    .map(e => ({ ...e, isPast: e.date < todayStr }))
    .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
})

function prevMonth() {
  if (calMonth.value === 0) { calMonth.value = 11; calYear.value-- } else calMonth.value--
}
function nextMonth() {
  if (calMonth.value === 11) { calMonth.value = 0; calYear.value++ } else calMonth.value++
}
function goToday() { calYear.value = today.getFullYear(); calMonth.value = today.getMonth() }

const dayModal = ref({ open: false, dateLabel: '', dateStr: '', events: [] })
const newEvent = ref({ label: '', time: '', description: '' })
const calAddError = ref('')

function openDayModal(cell) {
  dayModal.value = {
    open: true, dateStr: cell.dateStr,
    dateLabel: new Date(cell.dateStr + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    events: [...cell.events]
  }
  newEvent.value = { label: '', time: '', description: '' }
  calAddError.value = ''
}

function handleAddEvent() {
  calAddError.value = ''
  if (!newEvent.value.label.trim()) { calAddError.value = 'Le libellé est requis.'; return }
  const ev = { id: Date.now().toString(), date: dayModal.value.dateStr, label: newEvent.value.label.trim(), time: newEvent.value.time || '', description: newEvent.value.description.trim() }
  const evs = loadEvents(); evs.push(ev); saveEvents(evs)
  calEvents.value = evs
  dayModal.value.events.push(ev)
  newEvent.value = { label: '', time: '', description: '' }
}

function deleteEvent(id) {
  const evs = loadEvents().filter(e => e.id !== id)
  saveEvents(evs)
  calEvents.value = evs
}
</script>
