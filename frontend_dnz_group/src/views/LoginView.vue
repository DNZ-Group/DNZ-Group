<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">DNZ-Group</div>
      <h2>Connexion</h2>

      <div v-if="error" class="error-banner">E-mail ou mot de passe incorrect.</div>

      <form @submit.prevent="handleLogin">
        <div class="field">
          <label for="email">Adresse e-mail</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="exemple@email.com"
            required
          />
        </div>

        <div class="field">
          <label for="password">Mot de passe</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" class="btn-primary">Se connecter</button>
      </form>

      <p class="switch-auth">
        Si vous n'avez pas de compte, cliquez ici
        <router-link to="/register">créer un compte</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../auth.js'

const router = useRouter()
const error = ref(false)

const form = reactive({
  email: '',
  password: ''
})

function handleLogin() {
  error.value = false
  const ok = login(form.email, form.password)
  if (ok) {
    router.push('/')
  } else {
    error.value = true
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f4f8;
  padding: 2rem;
}

.auth-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.1);
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
}

.auth-logo {
  font-weight: bold;
  font-size: 1.4rem;
  color: #42b883;
  text-align: center;
  margin-bottom: 0.5rem;
}

h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 1.8rem;
  font-size: 1.5rem;
}

.field {
  margin-bottom: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-size: 0.9rem;
  color: #555;
  font-weight: 500;
}

input {
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

input:focus {
  border-color: #42b883;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #369970;
}

.error-banner {
  background: #fdecea;
  color: #c0392b;
  border: 1px solid #e74c3c;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.switch-auth {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #666;
}

.switch-auth a {
  color: #42b883;
  font-weight: bold;
  text-decoration: none;
}

.switch-auth a:hover {
  text-decoration: underline;
}
</style>
