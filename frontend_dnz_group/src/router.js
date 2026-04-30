import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import TransportVoitureView from './views/TransportVoitureView.vue'
import TransportColiView from './views/TransportColiView.vue'
import LoginView from './views/LoginView.vue'
import RegisterView from './views/RegisterView.vue'
import AdminDashboard from './views/admin/Dashboard.vue'
import { currentUser } from './auth.js'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/services/transport-voiture', component: TransportVoitureView },
    { path: '/services/transport-coli', component: TransportColiView },
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },
    {
      path: '/admin',
      component: AdminDashboard,
      meta: { requiresAdmin: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAdmin) {
    if (!currentUser.value || currentUser.value.role !== 'admin') {
      return next('/login')
    }
  }
  next()
})

export default router