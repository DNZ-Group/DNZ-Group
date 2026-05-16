<template>
  <section class="section">
    <!-- Barre actions + filtre -->
    <div class="section-actions" style="justify-content:space-between">
      <div class="conflict-filters">
        <button :class="['filter-btn', { active: containerView === 'active' }]" @click="containerView = 'active'">
          🚢 En cours
          <span v-if="activeContainers.length > 0" class="unread-badge" style="background:#3b82f6">{{ activeContainers.length }}</span>
        </button>
        <button :class="['filter-btn', { active: containerView === 'history' }]" @click="containerView = 'history'">
          📚 Historique
          <span v-if="doneContainers.length > 0" class="unread-badge" style="background:#22c55e">{{ doneContainers.length }}</span>
        </button>
      </div>
      <button class="btn-primary" @click="showContainerModal = true">+ Nouveau conteneur</button>
    </div>

    <!-- VUE : Conteneurs actifs -->
    <template v-if="containerView === 'active'">
      <div v-if="activeContainers.length === 0" class="empty">Aucun conteneur actif. Créez-en un nouveau.</div>
      <div v-for="c in activeContainers" :key="c.id" class="container-card">
        <!-- En-tête conteneur -->
        <div class="container-header">
          <div class="container-title-row">
            <span class="container-icon">🚢</span>
            <div>
              <div class="container-name">{{ c.name }}</div>
              <div class="container-sub">Bateau : <strong>{{ c.shipName || '—' }}</strong></div>
            </div>
          </div>
          <div class="container-header-actions">
            <span :class="['container-status-badge', `cstatus-${c.status}`]">{{ containerStatusLabel(c.status) }}</span>
            <button class="btn-danger-sm" @click="deleteContainer(c.id)">✕</button>
          </div>
        </div>

        <!-- Timeline -->
        <div class="timeline">

          <!-- Étape 1 : Chargement -->
          <div :class="['tl-step', { 'tl-step--done': c.loading.endDate }]">
            <div class="tl-dot"></div>
            <div class="tl-content">
              <div class="tl-title">📦 Chargement du conteneur</div>
              <div class="tl-row">
                <span class="tl-label">Début :</span>
                <span class="tl-val">{{ c.loading.startDate || '—' }}</span>
                <span class="tl-label">Fin :</span>
                <span class="tl-val">{{ c.loading.endDate || '—' }}</span>
                <span v-if="c.loading.startDate && c.loading.endDate" class="tl-duration">
                  {{ computeDuration(c.loading.startDate, c.loading.endDate) }}
                </span>
              </div>
              <div class="tl-row">
                <span class="tl-label">Nombre de dépôts clients :</span>
                <span class="tl-val">{{ c.deposits.length }}</span>
              </div>
              <!-- Historique des dépôts -->
              <div class="tl-deposits">
                <div v-for="(d, di) in c.deposits" :key="di" class="deposit-row">
                  <span class="deposit-time">{{ d.date }} {{ d.time }}</span>
                  <span class="deposit-client">👤 {{ d.clientName }}</span>
                  <span class="deposit-count">{{ d.count }} coli(s)</span>
                  <button class="btn-icon-xs" @click="removeDeposit(c.id, di)">✕</button>
                </div>
                <button class="btn-add-deposit" @click="openDepositModal(c.id)">
                  + Ajouter un dépôt client
                </button>
              </div>
              <div class="tl-edit-row">
                <input v-if="!c.loading.startDate" type="date" v-model="c.loading._startInput" placeholder="Date début" class="tl-input" />
                <input v-if="!c.loading.startDate" type="time" v-model="c.loading._startTime" class="tl-input tl-input--sm" />
                <button v-if="!c.loading.startDate && c.loading._startInput" class="btn-tl" @click="setLoadingStart(c.id)">Démarrer chargement</button>
                <input v-if="c.loading.startDate && !c.loading.endDate" type="date" v-model="c.loading._endInput" class="tl-input" />
                <input v-if="c.loading.startDate && !c.loading.endDate" type="time" v-model="c.loading._endTime" class="tl-input tl-input--sm" />
                <button v-if="c.loading.startDate && !c.loading.endDate && c.loading._endInput" class="btn-tl btn-tl--green" @click="setLoadingEnd(c.id)">Finaliser chargement</button>
              </div>
            </div>
          </div>

          <!-- Étape 2 : Voyage -->
          <div :class="['tl-step', { 'tl-step--done': c.voyage.arrivalDate }]">
            <div class="tl-dot"></div>
            <div class="tl-content">
              <div class="tl-title">🌊 Voyage en mer</div>
              <div class="tl-row">
                <span class="tl-label">Départ :</span>
                <span class="tl-val">{{ c.voyage.departureDate || '—' }}</span>
                <span class="tl-label">Arrivée :</span>
                <span class="tl-val">{{ c.voyage.arrivalDate || '—' }}</span>
                <span v-if="c.voyage.departureDate && c.voyage.arrivalDate" class="tl-duration">
                  {{ computeDuration(c.voyage.departureDate, c.voyage.arrivalDate) }}
                </span>
              </div>
              <div v-if="!c.voyage.departureDate || !c.voyage.arrivalDate" class="tl-edit-row">
                <input type="text" v-model="c.voyage._shipInput" placeholder="Nom du bateau" class="tl-input" />
                <input type="date" v-model="c.voyage._deptInput" placeholder="Départ" class="tl-input" />
                <input type="date" v-model="c.voyage._arrInput" placeholder="Arrivée" class="tl-input" />
                <button
                  v-if="c.voyage._shipInput && c.voyage._deptInput && c.voyage._arrInput"
                  class="btn-tl btn-tl--blue"
                  @click="setVoyage(c.id)"
                >Enregistrer voyage</button>
              </div>
            </div>
          </div>

          <!-- Étape 3 : Déchargement -->
          <div :class="['tl-step', { 'tl-step--done': c.unloading.allPickedUp }]">
            <div class="tl-dot"></div>
            <div class="tl-content">
              <div class="tl-title">📤 Déchargement & retraits clients</div>
              <div class="tl-row">
                <span class="tl-label">Ouverture retrait :</span>
                <span class="tl-val">{{ c.unloading.openDate || '—' }}</span>
                <span class="tl-label">Dernier retrait :</span>
                <span class="tl-val">{{ c.unloading.lastPickupDate || '—' }}</span>
                <span v-if="c.unloading.openDate && c.unloading.lastPickupDate" class="tl-duration">
                  {{ computeDuration(c.unloading.openDate, c.unloading.lastPickupDate) }}
                </span>
              </div>
              <!-- Suivi des retraits -->
              <div class="tl-deposits">
                <div v-for="(p, pi) in c.unloading.pickups" :key="pi" class="deposit-row">
                  <span class="deposit-time">{{ p.date }}</span>
                  <span class="deposit-client">👤 {{ p.clientName }}</span>
                  <span :class="['pickup-status', p.pickedUp ? 'pickup-done' : 'pickup-pending']">
                    {{ p.pickedUp ? '✅ Retiré' : '⏳ En attente' }}
                  </span>
                  <button v-if="!p.pickedUp" class="btn-tl btn-tl--green btn-tl--xs" @click="markPickedUp(c.id, pi)">Retrait confirmé</button>
                  <button class="btn-icon-xs" @click="removePickup(c.id, pi)">✕</button>
                </div>
                <div class="tl-pickup-summary">
                  <span>✅ {{ c.unloading.pickups.filter(p => p.pickedUp).length }} / {{ c.unloading.pickups.length }} retirés</span>
                </div>
                <button class="btn-add-deposit" @click="openPickupModal(c.id)">+ Ajouter un retrait client</button>
              </div>
              <div v-if="!c.unloading.openDate" class="tl-edit-row">
                <input type="date" v-model="c.unloading._openInput" class="tl-input" />
                <button v-if="c.unloading._openInput" class="btn-tl btn-tl--blue" @click="setUnloadingOpen(c.id)">Ouvrir les retraits</button>
              </div>
              <div v-if="c.unloading.openDate && !c.unloading.allPickedUp" class="tl-edit-row">
                <button
                  v-if="c.unloading.pickups.length > 0 && c.unloading.pickups.every(p => p.pickedUp)"
                  class="btn-tl btn-tl--green"
                  @click="closeUnloading(c.id)"
                >✓ Clôturer le déchargement</button>
              </div>
            </div>
          </div>

        </div><!-- end timeline -->
      </div><!-- end container-card -->
    </template>

    <!-- VUE : Historique -->
    <template v-if="containerView === 'history'">
      <div v-if="doneContainers.length === 0" class="empty">Aucun conteneur terminé dans l'historique.</div>
      <div v-for="c in doneContainers" :key="c.id" class="container-card container-card--archived">
        <div class="container-header" style="background:#334155">
          <div class="container-title-row">
            <span class="container-icon">🚢</span>
            <div>
              <div class="container-name">{{ c.name }}</div>
              <div class="container-sub">Bateau : <strong>{{ c.shipName || '—' }}</strong></div>
            </div>
          </div>
          <div class="container-header-actions">
            <span class="container-status-badge cstatus-done">✅ Terminé</span>
            <button class="btn-danger-sm" @click="deleteContainer(c.id)">✕</button>
          </div>
        </div>
        <div class="history-summary">
          <div class="history-block">
            <div class="history-block-title">📦 Chargement</div>
            <div class="history-row"><span class="tl-label">Début :</span> <span class="tl-val">{{ c.loading.startDate || '—' }}</span></div>
            <div class="history-row"><span class="tl-label">Fin :</span> <span class="tl-val">{{ c.loading.endDate || '—' }}</span></div>
            <div v-if="c.loading.startDate && c.loading.endDate" class="history-row">
              <span class="tl-label">Durée :</span>
              <span class="tl-duration">{{ computeDuration(c.loading.startDate, c.loading.endDate) }}</span>
            </div>
            <div class="history-row"><span class="tl-label">Dépôts clients :</span> <span class="tl-val">{{ c.deposits.length }}</span></div>
            <div v-if="c.deposits.length > 0" class="history-deposits">
              <div v-for="(d, i) in c.deposits" :key="i" class="deposit-row">
                <span class="deposit-time">{{ d.date }} {{ d.time }}</span>
                <span class="deposit-client">👤 {{ d.clientName }}</span>
                <span class="deposit-count">{{ d.count }} coli(s)</span>
              </div>
            </div>
          </div>
          <div class="history-block">
            <div class="history-block-title">🌊 Voyage</div>
            <div class="history-row"><span class="tl-label">Départ :</span> <span class="tl-val">{{ c.voyage.departureDate || '—' }}</span></div>
            <div class="history-row"><span class="tl-label">Arrivée :</span> <span class="tl-val">{{ c.voyage.arrivalDate || '—' }}</span></div>
            <div v-if="c.voyage.departureDate && c.voyage.arrivalDate" class="history-row">
              <span class="tl-label">Durée :</span>
              <span class="tl-duration">{{ computeDuration(c.voyage.departureDate, c.voyage.arrivalDate) }}</span>
            </div>
          </div>
          <div class="history-block">
            <div class="history-block-title">📤 Déchargement</div>
            <div class="history-row"><span class="tl-label">Ouverture :</span> <span class="tl-val">{{ c.unloading.openDate || '—' }}</span></div>
            <div class="history-row"><span class="tl-label">Dernier retrait :</span> <span class="tl-val">{{ c.unloading.lastPickupDate || '—' }}</span></div>
            <div v-if="c.unloading.openDate && c.unloading.lastPickupDate" class="history-row">
              <span class="tl-label">Durée :</span>
              <span class="tl-duration">{{ computeDuration(c.unloading.openDate, c.unloading.lastPickupDate) }}</span>
            </div>
            <div class="history-row">
              <span class="tl-label">Clients :</span>
              <span class="tl-val">✅ {{ c.unloading.pickups.filter(p => p.pickedUp).length }} / {{ c.unloading.pickups.length }} retirés</span>
            </div>
            <div v-if="c.unloading.pickups.length > 0" class="history-deposits">
              <div v-for="(p, i) in c.unloading.pickups" :key="i" class="deposit-row">
                <span class="deposit-time">{{ p.date }}</span>
                <span class="deposit-client">👤 {{ p.clientName }}</span>
                <span :class="['pickup-status', p.pickedUp ? 'pickup-done' : 'pickup-pending']">
                  {{ p.pickedUp ? '✅ Retiré' : '⏳ Non retiré' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal: nouveau conteneur -->
    <div v-if="showContainerModal" class="modal-overlay" @click.self="showContainerModal = false">
      <div class="modal">
        <h2>🚢 Nouveau conteneur</h2>
        <form @submit.prevent="handleAddContainer">
          <div class="field">
            <label>Nom / Référence *</label>
            <input v-model="newContainer.name" type="text" required placeholder="Ex: CNT-2026-01" />
          </div>
          <div class="field">
            <label>Nom du bateau</label>
            <input v-model="newContainer.shipName" type="text" placeholder="Ex: MSC Flore" />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="showContainerModal = false">Annuler</button>
            <button type="submit" class="btn-primary">Créer</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: dépôt client -->
    <div v-if="depositModal.open" class="modal-overlay" @click.self="depositModal.open = false">
      <div class="modal">
        <h2>📦 Dépôt client</h2>
        <form @submit.prevent="handleAddDeposit">
          <div class="field">
            <label>Nom du client *</label>
            <input v-model="depositModal.clientName" type="text" required placeholder="Jean Dupont" />
          </div>
          <div style="display:flex;gap:0.75rem">
            <div class="field" style="flex:1">
              <label>Date *</label>
              <input v-model="depositModal.date" type="date" required />
            </div>
            <div class="field" style="flex:1">
              <label>Heure</label>
              <input v-model="depositModal.time" type="time" />
            </div>
          </div>
          <div class="field">
            <label>Nombre de colis *</label>
            <input v-model="depositModal.count" type="number" min="1" required placeholder="1" />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="depositModal.open = false">Annuler</button>
            <button type="submit" class="btn-primary">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: retrait client -->
    <div v-if="pickupModal.open" class="modal-overlay" @click.self="pickupModal.open = false">
      <div class="modal">
        <h2>📤 Retrait client</h2>
        <form @submit.prevent="handleAddPickup">
          <div class="field">
            <label>Nom du client *</label>
            <input v-model="pickupModal.clientName" type="text" required placeholder="Jean Dupont" />
          </div>
          <div class="field">
            <label>Date prévue *</label>
            <input v-model="pickupModal.date" type="date" required />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="pickupModal.open = false">Annuler</button>
            <button type="submit" class="btn-primary">Ajouter</button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const CONTAINERS_KEY = 'dnz_containers'

function loadContainers() { return JSON.parse(localStorage.getItem(CONTAINERS_KEY) || '[]') }
function saveContainers(list) { localStorage.setItem(CONTAINERS_KEY, JSON.stringify(list)) }

const containers = ref(loadContainers())
const containerView = ref('active')

const activeContainers = computed(() => containers.value.filter(c => c.status !== 'done'))
const doneContainers = computed(() => containers.value.filter(c => c.status === 'done'))

function containerStatusLabel(s) {
  return { pending: 'En préparation', loading: 'Chargement', voyage: 'En mer', unloading: 'Déchargement', done: 'Terminé' }[s] || s
}

function computeDuration(start, end) {
  const ms = new Date(end) - new Date(start)
  if (ms < 0) return ''
  const days = Math.floor(ms / 86400000)
  const hours = Math.floor((ms % 86400000) / 3600000)
  if (days > 0) return `${days}j ${hours}h`
  return `${hours}h`
}

// Créer un conteneur
const showContainerModal = ref(false)
const newContainer = ref({ name: '', shipName: '' })

function handleAddContainer() {
  const c = {
    id: Date.now().toString(),
    name: newContainer.value.name.trim(),
    shipName: newContainer.value.shipName.trim(),
    status: 'pending',
    loading: { startDate: '', endDate: '', _startInput: '', _startTime: '', _endInput: '', _endTime: '' },
    deposits: [],
    voyage: { departureDate: '', arrivalDate: '', _shipInput: newContainer.value.shipName.trim(), _deptInput: '', _arrInput: '' },
    unloading: { openDate: '', lastPickupDate: '', allPickedUp: false, pickups: [], _openInput: '' }
  }
  const list = loadContainers()
  list.push(c)
  saveContainers(list)
  containers.value = list
  newContainer.value = { name: '', shipName: '' }
  showContainerModal.value = false
}

function deleteContainer(id) {
  const list = loadContainers().filter(c => c.id !== id)
  saveContainers(list)
  containers.value = list
}

function updateContainer(id, updater) {
  const list = loadContainers()
  const idx = list.findIndex(c => c.id === id)
  if (idx === -1) return
  updater(list[idx])
  saveContainers(list)
  containers.value = list
}

// Chargement
function setLoadingStart(id) {
  updateContainer(id, c => {
    c.loading.startDate = c.loading._startInput + (c.loading._startTime ? ' ' + c.loading._startTime : '')
    c.status = 'loading'
  })
}
function setLoadingEnd(id) {
  updateContainer(id, c => {
    c.loading.endDate = c.loading._endInput + (c.loading._endTime ? ' ' + c.loading._endTime : '')
  })
}

// Dépôts
const depositModal = ref({ open: false, containerId: '', clientName: '', date: '', time: '', count: 1 })
function openDepositModal(id) {
  depositModal.value = { open: true, containerId: id, clientName: '', date: '', time: '', count: 1 }
}
function handleAddDeposit() {
  updateContainer(depositModal.value.containerId, c => {
    c.deposits.push({
      clientName: depositModal.value.clientName,
      date: depositModal.value.date,
      time: depositModal.value.time,
      count: Number(depositModal.value.count)
    })
  })
  depositModal.value.open = false
}
function removeDeposit(id, idx) {
  updateContainer(id, c => c.deposits.splice(idx, 1))
}

// Voyage
function setVoyage(id) {
  updateContainer(id, c => {
    c.shipName = c.voyage._shipInput || c.shipName
    c.voyage.departureDate = c.voyage._deptInput
    c.voyage.arrivalDate = c.voyage._arrInput
    c.status = 'voyage'
  })
}

// Déchargement
const pickupModal = ref({ open: false, containerId: '', clientName: '', date: '' })
function openPickupModal(id) {
  pickupModal.value = { open: true, containerId: id, clientName: '', date: '' }
}
function handleAddPickup() {
  updateContainer(pickupModal.value.containerId, c => {
    c.unloading.pickups.push({
      clientName: pickupModal.value.clientName,
      date: pickupModal.value.date,
      pickedUp: false
    })
    c.status = 'unloading'
  })
  pickupModal.value.open = false
}
function removePickup(id, idx) {
  updateContainer(id, c => c.unloading.pickups.splice(idx, 1))
}
function markPickedUp(id, idx) {
  updateContainer(id, c => {
    c.unloading.pickups[idx].pickedUp = true
    c.unloading.lastPickupDate = c.unloading.pickups[idx].date
  })
}
function setUnloadingOpen(id) {
  updateContainer(id, c => {
    c.unloading.openDate = c.unloading._openInput
    c.status = 'unloading'
  })
}
function closeUnloading(id) {
  updateContainer(id, c => {
    c.unloading.allPickedUp = true
    c.status = 'done'
  })
}
</script>
