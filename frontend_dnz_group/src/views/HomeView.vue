<template>
  <main class="home-main">
    <h1>Bienvenue chez DNZ-Group</h1>

    <!-- Section utilisateur connecté -->
    <section v-if="currentUser" class="user-section">
      <div class="section-header">
        <h2>Mes articles</h2>
        <button class="btn-new-article" @click="showModal = true">
          + Nouvel article
        </button>
      </div>

      <!-- Liste des articles -->
      <div v-if="articles.length === 0" class="empty-state">
        <p>Vous n'avez pas encore d'articles. Cliquez sur <strong>+ Nouvel article</strong> pour commencer.</p>
      </div>

      <div v-else class="articles-grid">
        <div v-for="article in articles" :key="article.id" class="article-card">
          <div class="article-icon">{{ article.type === 'voiture' ? '🚗' : '📦' }}</div>
          <div class="article-body">
            <div class="article-label">{{ article.label }}</div>

            <!-- Détails voiture -->
            <template v-if="article.type === 'voiture'">
              <div class="article-detail">Immatriculation : {{ article.immatriculation }}</div>
            </template>

            <!-- Détails carton -->
            <template v-if="article.type === 'carton'">
              <div class="article-detail">
                Dimensions : {{ article.hauteur }} × {{ article.longueur }} × {{ article.largeur }} cm
              </div>
              <div v-if="article.poids" class="article-detail">Poids : {{ article.poids }} kg</div>
              <div v-if="article.contenu && article.contenu.length" class="article-contenu">
                <span v-for="(item, i) in article.contenu" :key="i" class="tag">{{ item }}</span>
              </div>
            </template>

            <div v-if="article.description" class="article-desc">{{ article.description }}</div>
            <div class="article-date">Créé le {{ article.createdAt }}</div>
          </div>
          <button class="btn-delete" @click="handleDelete(article.id)" title="Supprimer">🗑️</button>
        </div>
      </div>
    </section>

    <!-- Message si non connecté -->
    <section v-else class="guest-section">
      <p>
        <router-link to="/login">Connectez-vous</router-link> pour gérer vos articles de transport.
      </p>
    </section>

    <!-- Modal nouvel article -->
    <NewArticleModal v-if="showModal" @close="showModal = false" />
  </main>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import NewArticleModal from '../components/NewArticleModal.vue'
import { currentUser } from '../auth.js'
import { articles, refreshArticles, deleteArticle } from '../articles.js'

const showModal = ref(false)

onMounted(() => refreshArticles())

// Recharger les articles si l'utilisateur change (connexion/déconnexion)
watch(currentUser, () => refreshArticles())

async function handleDelete(id) {
  if (confirm('Supprimer cet article ?')) await deleteArticle(id)
}
</script>

<style scoped>
.home-main {
  max-width: 900px;
  margin: 0 auto;
  padding: 0;
  font-family: sans-serif;
  color: #2c3e50;
}

h1 {
  font-size: 2rem;
  margin-bottom: 2rem;
}

@media (max-width: 640px) {
  h1 { font-size: 1.5rem; margin-bottom: 1.25rem; }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}

h2 {
  font-size: 1.4rem;
  color: #2c3e50;
}

.btn-new-article {
  background: #42b883;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-new-article:hover {
  background: #369970;
}

.empty-state {
  background: #f8f9fa;
  border: 2px dashed #ddd;
  border-radius: 10px;
  padding: 2.5rem;
  text-align: center;
  color: #888;
}

.articles-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.article-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 1.2rem 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  position: relative;
}

.article-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.article-body {
  flex: 1;
}

.article-label {
  font-weight: bold;
  font-size: 1rem;
  margin-bottom: 4px;
}

.article-detail {
  font-size: 0.88rem;
  color: #555;
}

.article-contenu {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.tag {
  background: #e8f7f1;
  color: #2c7a5e;
  border-radius: 20px;
  padding: 3px 10px;
  font-size: 0.8rem;
}

.article-desc {
  font-size: 0.85rem;
  color: #777;
  margin-top: 4px;
  font-style: italic;
}

.article-date {
  font-size: 0.78rem;
  color: #aaa;
  margin-top: 6px;
}

.btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  opacity: 0.5;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.btn-delete:hover {
  opacity: 1;
}

.guest-section {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 2rem;
  text-align: center;
  color: #555;
}

.guest-section a {
  color: #42b883;
  font-weight: bold;
  text-decoration: none;
}

/* ── Responsive ── */
@media (max-width: 640px) {
  .article-card {
    padding: 1rem;
    flex-wrap: wrap;
  }
  .article-icon {
    font-size: 1.5rem;
  }
  .btn-new-article {
    width: 100%;
    text-align: center;
  }
}
</style>
