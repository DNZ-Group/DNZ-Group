<template>
  <section class="section">
    <!-- KPI row -->
    <div class="prog-kpi-grid">
      <div class="prog-kpi">
        <div class="prog-kpi-value">{{ prog.totalUsers }}</div>
        <div class="prog-kpi-label">Clients actifs</div>
      </div>
      <div class="prog-kpi">
        <div class="prog-kpi-value">{{ prog.totalArticles }}</div>
        <div class="prog-kpi-label">Articles traités</div>
      </div>
      <div class="prog-kpi">
        <div class="prog-kpi-value">{{ prog.totalEvents }}</div>
        <div class="prog-kpi-label">Transports planifiés</div>
      </div>
      <div class="prog-kpi">
        <div class="prog-kpi-value">{{ prog.totalConflicts }}</div>
        <div class="prog-kpi-label">Conflits totaux</div>
      </div>
      <div class="prog-kpi prog-kpi--alert" v-if="prog.openConflicts > 0">
        <div class="prog-kpi-value">{{ prog.openConflicts }}</div>
        <div class="prog-kpi-label">Conflits ouverts</div>
      </div>
    </div>

    <!-- Articles par type -->
    <div class="prog-card">
      <h2>Articles par type</h2>
      <div class="prog-bars">
        <div class="prog-row">
          <span>Voitures</span>
          <div class="prog-bar-track">
            <div class="prog-bar prog-bar--orange" :style="{ width: prog.voituresPct + '%' }"></div>
          </div>
          <span>{{ prog.voitures }} ({{ prog.voituresPct }}%)</span>
        </div>
        <div class="prog-row">
          <span>Cartons</span>
          <div class="prog-bar-track">
            <div class="prog-bar prog-bar--blue" :style="{ width: prog.cartonsPct + '%' }"></div>
          </div>
          <span>{{ prog.cartons }} ({{ prog.cartonsPct }}%)</span>
        </div>
      </div>
    </div>

    <!-- Résolution des conflits -->
    <div class="prog-card">
      <h2>Résolution des conflits</h2>
      <div class="prog-bars">
        <div class="prog-row">
          <span>Résolus</span>
          <div class="prog-bar-track">
            <div class="prog-bar prog-bar--green" :style="{ width: prog.resolvedPct + '%' }"></div>
          </div>
          <span>{{ prog.resolvedConflicts }} ({{ prog.resolvedPct }}%)</span>
        </div>
        <div class="prog-row">
          <span>Ouverts</span>
          <div class="prog-bar-track">
            <div class="prog-bar prog-bar--red" :style="{ width: prog.openConflictsPct + '%' }"></div>
          </div>
          <span>{{ prog.openConflicts }} ({{ prog.openConflictsPct }}%)</span>
        </div>
      </div>
    </div>

    <!-- Transports (passés / à venir) -->
    <div class="prog-card">
      <h2>Transports planifiés</h2>
      <div class="prog-bars">
        <div class="prog-row">
          <span>À venir</span>
          <div class="prog-bar-track">
            <div class="prog-bar prog-bar--blue" :style="{ width: prog.upcomingPct + '%' }"></div>
          </div>
          <span>{{ prog.upcoming }} ({{ prog.upcomingPct }}%)</span>
        </div>
        <div class="prog-row">
          <span>Passés</span>
          <div class="prog-bar-track">
            <div class="prog-bar prog-bar--grey" :style="{ width: prog.pastPct + '%' }"></div>
          </div>
          <span>{{ prog.past }} ({{ prog.pastPct }}%)</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  allUsers: { type: Array, required: true },
  allArticles: { type: Array, required: true }
})

function pct(a, total) { return total === 0 ? 0 : Math.round(a / total * 100) }

const prog = computed(() => {
  const events = JSON.parse(localStorage.getItem('dnz_transport_events') || '[]')
  const conflicts = JSON.parse(localStorage.getItem('dnz_conflicts') || '[]')
  const todayStr = new Date().toISOString().slice(0, 10)

  const totalUsers = props.allUsers.filter(u => u.role !== 'admin').length
  const totalArticles = props.allArticles.length
  const voitures = props.allArticles.filter(a => a.type === 'voiture').length
  const cartons = props.allArticles.filter(a => a.type === 'carton').length
  const totalConflicts = conflicts.length
  const resolvedConflicts = conflicts.filter(c => c.resolved).length
  const openConflicts = totalConflicts - resolvedConflicts
  const totalEvents = events.length
  const upcoming = events.filter(e => e.date >= todayStr).length
  const past = totalEvents - upcoming

  return {
    totalUsers, totalArticles,
    voitures, cartons,
    voituresPct: pct(voitures, totalArticles), cartonsPct: pct(cartons, totalArticles),
    totalConflicts, resolvedConflicts, openConflicts,
    resolvedPct: pct(resolvedConflicts, totalConflicts), openConflictsPct: pct(openConflicts, totalConflicts),
    totalEvents, upcoming, past,
    upcomingPct: pct(upcoming, totalEvents), pastPct: pct(past, totalEvents)
  }
})
</script>
