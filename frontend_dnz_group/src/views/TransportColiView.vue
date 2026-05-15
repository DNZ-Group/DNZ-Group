<template>
  <div class="transport-page">
    <div class="hero">
      <h1>Transport de Colis</h1>
      <p>Expédition rapide et fiable de vos colis partout, avec soin et efficacité.</p>
    </div>

    <section class="features">
      <div class="feature-card">
        <div class="icon">📦</div>
        <h3>Tous types de colis</h3>
        <p>Petits paquets, marchandises volumineuses ou fragiles, nous gérons tout type d'envoi.</p>
      </div>
      <div class="feature-card">
        <div class="icon">⚡</div>
        <h3>Livraison express</h3>
        <p>Options de livraison urgente disponibles pour vos colis les plus pressés.</p>
      </div>
      <div class="feature-card">
        <div class="icon">📍</div>
        <h3>Suivi de colis</h3>
        <p>Consultez l'état de votre colis en temps réel depuis la prise en charge jusqu'à la livraison.</p>
      </div>
      <div class="feature-card">
        <div class="icon">🛡️</div>
        <h3>Emballage sécurisé</h3>
        <p>Vos colis sont emballés et protégés selon les standards les plus stricts.</p>
      </div>
    </section>

    <section class="cta">
      <h2>Envoyer un colis avec DNZ-Group ?</h2>
      <p>Contactez-nous pour un devis ou pour planifier votre envoi.</p>
      <router-link to="/" class="btn-cta">Nous contacter</router-link>
    </section>
  </div>
</template>

<style scoped>
.transport-page {
  font-family: sans-serif;
  color: #2c3e50;
}

.hero {
  background: linear-gradient(135deg, #1a252f, #e67e22);
  color: white;
  padding: 80px 2rem;
  text-align: center;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  padding: 3rem 2rem;
  max-width: 1100px;
  margin: 0 auto;
}

.feature-card {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.cta {
  background: #fff8f0;
  text-align: center;
  padding: 3rem 2rem;
  border-top: 1px solid #ddd;
}

.cta h2 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.btn-cta {
  display: inline-block;
  margin-top: 1.5rem;
  background: #e67e22;
  color: white;
  padding: 12px 30px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: bold;
  transition: background 0.2s;
}

.btn-cta:hover {
  background: #ca6f1e;
}

@media (max-width: 640px) {
  .hero h1 { font-size: 1.8rem; }
  .hero { padding: 50px 1rem; }
  .features { padding: 2rem 1rem; }
  .cta { padding: 2rem 1rem; }
}
</style>
