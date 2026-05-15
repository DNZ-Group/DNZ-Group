<template>
  <div class="transport-page">
    <div class="hero">
      <h1>Transport de Voiture</h1>
      <p>Service professionnel de transport et livraison de véhicules en toute sécurité.</p>
    </div>

    <section class="features">
      <div class="feature-card">
        <div class="icon">🚗</div>
        <h3>Transport toutes distances</h3>
        <p>Nous assurons le transport de vos véhicules sur courtes et longues distances, dans tout le pays.</p>
      </div>
      <div class="feature-card">
        <div class="icon">🔒</div>
        <h3>Sécurité garantie</h3>
        <p>Chaque véhicule est soigneusement attaché et protégé durant le transport.</p>
      </div>
      <div class="feature-card">
        <div class="icon">📍</div>
        <h3>Suivi en temps réel</h3>
        <p>Suivez l'acheminement de votre véhicule à tout moment via notre plateforme.</p>
      </div>
      <div class="feature-card">
        <div class="icon">💰</div>
        <h3>Tarifs compétitifs</h3>
        <p>Des tarifs transparents et adaptés à vos besoins, sans frais cachés.</p>
      </div>
    </section>

    <section class="cta">
      <h2>Besoin de transporter votre véhicule ?</h2>
      <p>Contactez-nous pour obtenir un devis personnalisé.</p>
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
  background: linear-gradient(135deg, #2c3e50, #42b883);
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
  background: #f0faf5;
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
  background: #42b883;
  color: white;
  padding: 12px 30px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: bold;
  transition: background 0.2s;
}

.btn-cta:hover {
  background: #369970;
}

@media (max-width: 640px) {
  .hero h1 { font-size: 1.8rem; }
  .hero { padding: 50px 1rem; }
  .features { padding: 2rem 1rem; }
  .cta { padding: 2rem 1rem; }
}
</style>
