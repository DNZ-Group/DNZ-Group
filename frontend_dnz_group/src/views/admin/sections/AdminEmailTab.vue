<template>
  <section class="section">
    <div class="email-toolbar">
      <div class="email-tabs">
        <button :class="{ active: emailView === 'inbox' }" @click="emailView = 'inbox'; loadInbox()">
          📥 Boîte de réception
          <span v-if="inboxUnread > 0" class="unread-badge">{{ inboxUnread }}</span>
        </button>
        <button :class="{ active: emailView === 'sent' }" @click="emailView = 'sent'; loadSent()">
          📤 Envoyés
        </button>
        <button :class="{ active: emailView === 'compose' }" @click="emailView = 'compose'">
          ✏️ Nouveau message
        </button>
      </div>
      <button v-if="emailView !== 'compose'" class="btn-icon" @click="emailView === 'inbox' ? loadInbox() : loadSent()" title="Rafraîchir">🔄</button>
    </div>

    <div v-if="emailLoading" class="email-loading">Chargement des emails…</div>
    <div v-if="emailError" class="error-banner">{{ emailError }}</div>

    <!-- INBOX -->
    <div v-if="emailView === 'inbox' && !emailLoading">
      <div v-if="inbox.length === 0 && !emailError" class="empty">Aucun email dans la boîte de réception.</div>
      <div class="email-list">
        <div
          v-for="msg in inbox" :key="msg.uid"
          :class="['email-item', { unread: !msg.seen, active: selectedEmail?.uid === msg.uid }]"
          @click="selectedEmail = msg"
        >
          <div class="email-item-header">
            <span class="email-from">{{ msg.from }}</span>
            <span class="email-date">{{ formatDate(msg.date) }}</span>
          </div>
          <div class="email-subject">{{ msg.subject }}</div>
        </div>
      </div>
      <div v-if="selectedEmail" class="email-preview">
        <div class="email-preview-header">
          <div><strong>De :</strong> {{ selectedEmail.from }}</div>
          <div><strong>Objet :</strong> {{ selectedEmail.subject }}</div>
          <div><strong>Date :</strong> {{ formatDate(selectedEmail.date) }}</div>
          <button class="btn-icon close-preview" @click="selectedEmail = null">✕</button>
        </div>
        <div class="email-preview-body">{{ selectedEmail.body || '(pas de contenu)' }}</div>
        <div class="email-preview-actions">
          <button class="btn-primary" @click="replyTo(selectedEmail)">↩ Répondre</button>
        </div>
      </div>
    </div>

    <!-- SENT -->
    <div v-if="emailView === 'sent' && !emailLoading">
      <div v-if="sent.length === 0 && !emailError" class="empty">Aucun email envoyé.</div>
      <div class="email-list">
        <div
          v-for="msg in sent" :key="msg.uid"
          :class="['email-item', { active: selectedEmail?.uid === msg.uid }]"
          @click="selectedEmail = msg"
        >
          <div class="email-item-header">
            <span class="email-from">À : {{ msg.to }}</span>
            <span class="email-date">{{ formatDate(msg.date) }}</span>
          </div>
          <div class="email-subject">{{ msg.subject }}</div>
        </div>
      </div>
      <div v-if="selectedEmail" class="email-preview">
        <div class="email-preview-header">
          <div><strong>À :</strong> {{ selectedEmail.to }}</div>
          <div><strong>Objet :</strong> {{ selectedEmail.subject }}</div>
          <div><strong>Date :</strong> {{ formatDate(selectedEmail.date) }}</div>
          <button class="btn-icon close-preview" @click="selectedEmail = null">✕</button>
        </div>
        <div class="email-preview-body">{{ selectedEmail.body || '(pas de contenu)' }}</div>
      </div>
    </div>

    <!-- COMPOSER -->
    <div v-if="emailView === 'compose'" class="compose-card">
      <div v-if="sendSuccess" class="success-banner">Email envoyé avec succès !</div>
      <div v-if="sendError" class="error-banner">{{ sendError }}</div>
      <form @submit.prevent="handleSendEmail">
        <div class="field">
          <label>Destinataire *</label>
          <input v-model="compose.to" type="email" required placeholder="destinataire@exemple.com" />
        </div>
        <div class="field">
          <label>Objet *</label>
          <input v-model="compose.subject" type="text" required placeholder="Objet du message" />
        </div>
        <div class="field">
          <label>Message *</label>
          <textarea v-model="compose.body" rows="10" required placeholder="Votre message…"></textarea>
        </div>
        <div class="compose-actions">
          <button type="button" class="btn-secondary" @click="resetCompose">Effacer</button>
          <button type="submit" class="btn-primary" :disabled="sendLoading">
            {{ sendLoading ? 'Envoi…' : '✉️ Envoyer' }}
          </button>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const emit = defineEmits(['unread-change'])

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const emailView = ref('inbox')
const inbox = ref([])
const sent = ref([])
const emailLoading = ref(false)
const emailError = ref('')
const selectedEmail = ref(null)
const sendLoading = ref(false)
const sendSuccess = ref(false)
const sendError = ref('')
const compose = ref({ to: '', subject: '', body: '' })

const inboxUnread = computed(() => inbox.value.filter(m => !m.seen).length)

function getToken() { return localStorage.getItem('dnz_token') || '' }

async function loadInbox() {
  emailLoading.value = true
  emailError.value = ''
  selectedEmail.value = null
  try {
    const res = await fetch(`${API}/api/admin/email/inbox?limit=30`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    inbox.value = data
    emit('unread-change', inboxUnread.value)
  } catch (e) {
    emailError.value = e.message
  } finally {
    emailLoading.value = false
  }
}

async function loadSent() {
  emailLoading.value = true
  emailError.value = ''
  selectedEmail.value = null
  try {
    const res = await fetch(`${API}/api/admin/email/sent?limit=20`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    sent.value = data
  } catch (e) {
    emailError.value = e.message
  } finally {
    emailLoading.value = false
  }
}

async function handleSendEmail() {
  sendLoading.value = true
  sendSuccess.value = false
  sendError.value = ''
  try {
    const res = await fetch(`${API}/api/admin/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(compose.value)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    sendSuccess.value = true
    resetCompose()
  } catch (e) {
    sendError.value = e.message
  } finally {
    sendLoading.value = false
  }
}

function resetCompose() {
  compose.value = { to: '', subject: '', body: '' }
  sendSuccess.value = false
  sendError.value = ''
}

function replyTo(msg) {
  compose.value = {
    to: msg.from.match(/<(.+)>/)?.[1] || msg.from,
    subject: msg.subject.startsWith('Re:') ? msg.subject : `Re: ${msg.subject}`,
    body: `\n\n--- Message original ---\nDe : ${msg.from}\nDate : ${formatDate(msg.date)}\n\n${msg.body}`
  }
  emailView.value = 'compose'
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(() => loadInbox())
</script>
