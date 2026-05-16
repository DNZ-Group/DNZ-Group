<template>
  <section class="section">
    <div class="section-actions">
      <button class="btn-primary" @click="showUserModal = true">+ Créer un compte</button>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>Nom</th>
          <th>E-mail</th>
          <th>Téléphone</th>
          <th>Rôle</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in allUsers" :key="u.email">
          <td>{{ u.name }}</td>
          <td>{{ u.email }}</td>
          <td>{{ u.phone || '—' }}</td>
          <td>
            <span :class="['badge', u.role === 'admin' ? 'badge-admin' : 'badge-user']">{{ u.role }}</span>
          </td>
          <td>
            <button v-if="u.role !== 'admin'" class="btn-danger-sm" @click="confirmDeleteUser(u)">Supprimer</button>
            <span v-else class="text-muted">—</span>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal: créer un compte -->
    <div v-if="showUserModal" class="modal-overlay" @click.self="closeUserModal">
      <div class="modal">
        <h2>Créer un compte</h2>
        <div v-if="userModalError" class="error-banner">{{ userModalError }}</div>
        <div v-if="userModalSuccess" class="success-banner">Compte créé avec succès !</div>
        <form @submit.prevent="handleCreateUser">
          <div class="field">
            <label>Nom complet *</label>
            <input v-model="newUser.name" type="text" required placeholder="Jean Dupont" />
          </div>
          <div class="field">
            <label>Adresse e-mail *</label>
            <input v-model="newUser.email" type="email" required placeholder="jean@exemple.com" />
          </div>
          <div class="field">
            <label>Téléphone</label>
            <input v-model="newUser.phone" type="tel" placeholder="+33 6 00 00 00 00" />
          </div>
          <div class="field">
            <label>Mot de passe *</label>
            <input v-model="newUser.password" type="password" required placeholder="••••••••" minlength="6" />
          </div>
          <div class="field">
            <label>Rôle *</label>
            <select v-model="newUser.role">
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeUserModal">Annuler</button>
            <button type="submit" class="btn-primary">Créer</button>
          </div>
        </form>
      </div>
    </div>

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
import { createUser, deleteUser } from '../../../auth.js'

const props = defineProps({ allUsers: { type: Array, required: true } })
const emit = defineEmits(['refresh'])

const showUserModal = ref(false)
const userModalError = ref('')
const userModalSuccess = ref(false)
const newUser = ref({ name: '', email: '', phone: '', password: '', role: 'user' })

function closeUserModal() {
  showUserModal.value = false
  userModalError.value = ''
  userModalSuccess.value = false
  newUser.value = { name: '', email: '', phone: '', password: '', role: 'user' }
}

async function handleCreateUser() {
  userModalError.value = ''
  userModalSuccess.value = false
  const ok = await createUser({ ...newUser.value })
  if (!ok) { userModalError.value = 'Cet e-mail est déjà utilisé.'; return }
  userModalSuccess.value = true
  emit('refresh')
  setTimeout(closeUserModal, 1200)
}

const confirmTarget = ref(null)
const confirmMessage = ref('')

function confirmDeleteUser(u) {
  confirmTarget.value = u
  confirmMessage.value = `Supprimer le compte de « ${u.name} » (${u.email}) ?`
}

async function executeDelete() {
  await deleteUser(confirmTarget.value.id)
  confirmTarget.value = null
  emit('refresh')
}
</script>
