<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <button class="close-btn" @click="$emit('close')">✕</button>
      <h2>Nouvel article</h2>

      <form @submit.prevent="handleSubmit">

        <!-- Type d'article -->
        <div class="field">
          <label>Type d'article</label>
          <div class="radio-group">
            <label class="radio-option" :class="{ active: form.type === 'voiture' }">
              <input type="radio" v-model="form.type" value="voiture" />
              🚗 Voiture
            </label>
            <label class="radio-option" :class="{ active: form.type === 'carton' }">
              <input type="radio" v-model="form.type" value="carton" />
              📦 Carton
            </label>
          </div>
        </div>

        <!-- Champs Voiture -->
        <template v-if="form.type === 'voiture'">
          <div class="field">
            <label for="marque">Marque</label>
            <div style="position:relative">
              <input
                id="marque"
                v-model="form.marque"
                type="text"
                placeholder="ex: Toyota"
                required
                autocomplete="off"
                @input="showMarque = true; form.modele = ''"
                @focus="showMarque = true"
                @blur="hideMarque"
              />
              <ul v-if="showMarque && filteredMarques.length" class="suggestions-list">
                <li v-for="m in filteredMarques" :key="m" @mousedown.prevent="pickMarque(m)">{{ m }}</li>
              </ul>
            </div>
          </div>
          <div class="field">
            <label for="modele">Modèle</label>
            <div style="position:relative">
              <input
                id="modele"
                v-model="form.modele"
                type="text"
                placeholder="ex: Corolla"
                required
                autocomplete="off"
                @input="showModele = true"
                @focus="showModele = true"
                @blur="hideModele"
              />
              <ul v-if="showModele && filteredModeles.length" class="suggestions-list">
                <li v-for="m in filteredModeles" :key="m" @mousedown.prevent="pickModele(m)">{{ m }}</li>
              </ul>
            </div>
          </div>
          <div class="field">
            <label for="immatriculation">Immatriculation</label>
            <input id="immatriculation" v-model="form.immatriculation" type="text" placeholder="ex: AB-123-CD" required />
          </div>
        </template>

        <!-- Champs Carton -->
        <template v-if="form.type === 'carton'">
          <div class="field">
            <label>Dimensions (cm)</label>
            <div class="dimensions-row">
              <div class="dim-field">
                <input v-model.number="form.hauteur" type="number" min="1" placeholder="H" required />
                <span class="dim-label">Hauteur</span>
              </div>
              <span class="dim-sep">×</span>
              <div class="dim-field">
                <input v-model.number="form.longueur" type="number" min="1" placeholder="L" required />
                <span class="dim-label">Longueur</span>
              </div>
              <span class="dim-sep">×</span>
              <div class="dim-field">
                <input v-model.number="form.largeur" type="number" min="1" placeholder="l" required />
                <span class="dim-label">Largeur</span>
              </div>
            </div>
          </div>

          <div class="field">
            <label>Contenu du carton</label>
            <div class="tag-input-wrapper">
              <div class="tags">
                <span v-for="(item, i) in form.contenu" :key="i" class="tag">
                  {{ item }}
                  <button type="button" class="tag-remove" @click="removeContenu(i)">✕</button>
                </span>
              </div>
              <div class="tag-add-row" style="position:relative">
                <input
                  v-model="contenuInput"
                  type="text"
                  placeholder="Ajouter un élément..."
                  @keydown.enter.prevent="addContenu"
                  @input="showSuggestions = true"
                  @blur="hideSuggestions"
                  autocomplete="off"
                />
                <ul v-if="showSuggestions && filteredSuggestions.length" class="suggestions-list">
                  <li
                    v-for="s in filteredSuggestions"
                    :key="s"
                    @mousedown.prevent="pickSuggestion(s)"
                  >{{ s }}</li>
                </ul>
                <button type="button" class="btn-add-tag" @click="addContenu">Ajouter</button>
              </div>
            </div>
          </div>

          <div class="field">
            <label for="poids">Poids estimé (kg)</label>
            <input id="poids" v-model.number="form.poids" type="number" min="0" step="0.1" placeholder="ex: 5.5" />
          </div>
        </template>

        <!-- Description commune -->
        <div class="field" v-if="form.type">
          <label for="description">Description (optionnel)</label>
          <textarea id="description" v-model="form.description" rows="3" placeholder="Informations complémentaires..."></textarea>
        </div>

        <!-- ===== Simulateur de prix ===== -->
        <div v-if="form.type" class="price-sim">
          <div class="price-sim-header">
            <span class="price-sim-title">💰 Estimation du prix</span>
            <span :class="['price-sim-badge', priceSimulation.precise ? 'badge-precise' : 'badge-estimate']">{{ priceSimulation.precise ? 'Précis' : 'Estimation' }}</span>
          </div>

          <div class="price-sim-breakdown">
            <div v-for="line in priceSimulation.lines" :key="line.label" class="price-line">
              <span class="price-line-label">{{ line.label }}</span>
              <span class="price-line-amount" :class="{ 'amount-add': line.amount > 0, 'amount-base': line.isBase }">{{ line.amount >= 0 ? '+' : '' }}{{ line.amount }}€</span>
            </div>
          </div>

          <div class="price-sim-total">
            <span>Total estimé</span>
            <span class="price-total-val">{{ priceSimulation.total }}€</span>
          </div>

          <div class="price-sim-bar-wrap">
            <div class="price-sim-bar" :style="{ width: priceSimulation.fillPct + '%' }"></div>
          </div>
          <div class="price-sim-hint">{{ priceSimulation.hint }}</div>
        </div>

        <button type="submit" class="btn-primary" :disabled="!form.type">
          Enregistrer l'article
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { addArticle } from '../articles.js'

// ---- Grilles tarifaires ----
const MARQUES_PREMIUM = ['BMW', 'Mercedes', 'Audi', 'Tesla', 'Volvo', 'Jeep']
const MARQUES_SEMI = ['Volkswagen', 'Ford', 'Seat', 'Skoda', 'Hyundai', 'Kia']
const PRICE_VOITURE_BASE = 250
const PRICE_VOITURE_PREMIUM = 150
const PRICE_VOITURE_SEMI = 50
const PRICE_CARTON_PER_LITRE = 0.08
const PRICE_CARTON_MIN = 15
const PRICE_KG_ABOVE_5 = 0.5
const PRICE_EXTRA_ITEM = 2

const emit = defineEmits(['close'])

const MARQUES_MODELES = {
  'Toyota': ['Corolla', 'Yaris', 'RAV4', 'Camry', 'Hilux', 'Land Cruiser', 'Prius', 'Auris'],
  'Peugeot': ['208', '308', '508', '3008', '5008', '2008', 'Partner', 'Boxer'],
  'Renault': ['Clio', 'Mégane', 'Kangoo', 'Captur', 'Twingo', 'Zoe', 'Master', 'Trafic'],
  'Volkswagen': ['Golf', 'Polo', 'Passat', 'Tiguan', 'T-Roc', 'Caddy', 'Transporter', 'Touareg'],
  'BMW': ['Série 1', 'Série 3', 'Série 5', 'X1', 'X3', 'X5', 'M3', 'M5'],
  'Mercedes': ['Classe A', 'Classe C', 'Classe E', 'GLA', 'GLC', 'Sprinter', 'Vito', 'CLA'],
  'Audi': ['A1', 'A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7', 'TT'],
  'Ford': ['Fiesta', 'Focus', 'Kuga', 'Puma', 'Ranger', 'Transit', 'Explorer'],
  'Citroën': ['C3', 'C4', 'C5', 'Berlingo', 'Jumpy', 'Jumper', 'C3 Aircross'],
  'Nissan': ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Navara', 'Leaf'],
  'Hyundai': ['i10', 'i20', 'i30', 'Tucson', 'Santa Fe', 'Kona', 'Ioniq'],
  'Kia': ['Picanto', 'Rio', 'Ceed', 'Sportage', 'Sorento', 'Stonic', 'Niro'],
  'Fiat': ['Panda', '500', 'Tipo', 'Ducato', 'Doblo', 'Punto'],
  'Opel': ['Corsa', 'Astra', 'Insignia', 'Mokka', 'Crossland', 'Vivaro'],
  'Skoda': ['Fabia', 'Octavia', 'Superb', 'Karoq', 'Kodiaq', 'Scala'],
  'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X'],
  'Dacia': ['Sandero', 'Duster', 'Logan', 'Spring', 'Jogger', 'Dokker'],
  'Seat': ['Ibiza', 'Leon', 'Arona', 'Ateca', 'Tarraco'],
  'Volvo': ['V40', 'V60', 'XC40', 'XC60', 'XC90', 'S60'],
  'Jeep': ['Renegade', 'Compass', 'Cherokee', 'Wrangler', 'Grand Cherokee'],
}

const ALL_MARQUES = Object.keys(MARQUES_MODELES)

const showMarque = ref(false)
const showModele = ref(false)

const filteredMarques = computed(() => {
  const q = form.marque.trim().toLowerCase()
  if (!q) return ALL_MARQUES
  return ALL_MARQUES.filter(m => m.toLowerCase().includes(q))
})

const filteredModeles = computed(() => {
  const modeles = MARQUES_MODELES[form.marque] || []
  const q = form.modele.trim().toLowerCase()
  if (!q) return modeles
  return modeles.filter(m => m.toLowerCase().includes(q))
})

function pickMarque(m) {
  form.marque = m
  form.modele = ''
  showMarque.value = false
}

function pickModele(m) {
  form.modele = m
  showModele.value = false
}

function hideMarque() {
  setTimeout(() => { showMarque.value = false }, 150)
}

function hideModele() {
  setTimeout(() => { showModele.value = false }, 150)
}

const SUGGESTIONS = [
  'Vêtements', 'Chaussures', 'Livres', 'Jouets', 'Vaisselle',
  'Casseroles', 'Ustensiles de cuisine', 'Électronique', 'Câbles',
  'Outils', 'Produits de soin', 'Médicaments', 'Parfums',
  'Draps', 'Couvertures', 'Oreillers', 'Décorations', 'Cadres',
  'Documents', 'Papeterie', 'Accessoires', 'Sacs', 'Montres',
  'Produits alimentaires', 'Épices', 'Conserves', 'Bouteilles',
  'Matériel de sport', 'Jeux de société', 'DVD / BD', 'Peluches'
]

const showSuggestions = ref(false)

const filteredSuggestions = computed(() => {
  const q = contenuInput.value.trim().toLowerCase()
  if (!q) return SUGGESTIONS.filter(s => !form.contenu.includes(s))
  return SUGGESTIONS.filter(s =>
    s.toLowerCase().includes(q) && !form.contenu.includes(s)
  )
})

function pickSuggestion(s) {
  if (!form.contenu.includes(s)) form.contenu.push(s)
  contenuInput.value = ''
  showSuggestions.value = false
}

function hideSuggestions() {
  setTimeout(() => { showSuggestions.value = false }, 150)
}

const form = reactive({
  type: '',
  marque: '',
  modele: '',
  immatriculation: '',
  hauteur: '',
  longueur: '',
  largeur: '',
  poids: '',
  contenu: [],
  description: ''
})

const contenuInput = ref('')

function addContenu() {
  const val = contenuInput.value.trim()
  if (val && !form.contenu.includes(val)) {
    form.contenu.push(val)
  }
  contenuInput.value = ''
}

function removeContenu(i) {
  form.contenu.splice(i, 1)
}

// ---- Simulateur de prix ----
const priceSimulation = computed(() => {
  if (form.type === 'voiture') {
    const lines = []
    lines.push({ label: 'Base transport voiture', amount: PRICE_VOITURE_BASE, isBase: true })

    let extra = 0
    let hint = 'Remplissez la marque et le modèle pour affiner le prix.'
    if (form.marque) {
      if (MARQUES_PREMIUM.includes(form.marque)) {
        extra = PRICE_VOITURE_PREMIUM
        lines.push({ label: `Véhicule premium (${form.marque})`, amount: extra })
        hint = 'Véhicule premium — manutention renforcée incluse.'
      } else if (MARQUES_SEMI.includes(form.marque)) {
        extra = PRICE_VOITURE_SEMI
        lines.push({ label: `Véhicule semi-premium (${form.marque})`, amount: extra })
        hint = 'Tarif ajusté pour votre marque.'
      } else {
        hint = 'Tarif standard appliqué.'
      }
    }
    const total = PRICE_VOITURE_BASE + extra
    const precise = !!(form.marque && form.modele && form.immatriculation)
    return { lines, total, precise, hint, fillPct: Math.min(100, Math.round((total / 500) * 100)) }
  }

  if (form.type === 'carton') {
    const lines = []
    const h = Number(form.hauteur) || 0
    const l = Number(form.longueur) || 0
    const w = Number(form.largeur) || 0
    const litres = (h * l * w) / 1000
    const volumePrice = litres > 0 ? Math.max(PRICE_CARTON_MIN, Math.round(litres * PRICE_CARTON_PER_LITRE * 100) / 100) : PRICE_CARTON_MIN

    lines.push({ label: litres > 0 ? `Volume ${Math.round(litres)}L (${h}×${l}×${w} cm)` : 'Base minimum carton', amount: volumePrice, isBase: true })

    let poidsExtra = 0
    const poids = Number(form.poids) || 0
    if (poids > 5) {
      poidsExtra = Math.round((poids - 5) * PRICE_KG_ABOVE_5 * 100) / 100
      lines.push({ label: `Surpoids (${poids}kg — au‑delà de 5kg)`, amount: poidsExtra })
    }

    let contenuExtra = 0
    if (form.contenu.length > 3) {
      contenuExtra = (form.contenu.length - 3) * PRICE_EXTRA_ITEM
      lines.push({ label: `Contenu varié (${form.contenu.length} types d'articles)`, amount: contenuExtra })
    }

    const total = Math.round((volumePrice + poidsExtra + contenuExtra) * 100) / 100
    const precise = !!(h && l && w)
    const hint = precise
      ? (poids ? 'Prix basé sur le volume et le poids.' : 'Ajoutez le poids pour affiner.')
      : 'Remplissez les dimensions pour calculer le volume.'
    return { lines, total, precise, hint, fillPct: Math.min(100, Math.round((total / 200) * 100)) }
  }

  return { lines: [], total: 0, precise: false, hint: '', fillPct: 0 }
})

function handleSubmit() {
  const article = { type: form.type, description: form.description }

  if (form.type === 'voiture') {
    article.marque = form.marque
    article.modele = form.modele
    article.immatriculation = form.immatriculation
    article.label = `🚗 ${form.marque} ${form.modele} (${form.immatriculation})`
  } else {
    article.hauteur = form.hauteur
    article.longueur = form.longueur
    article.largeur = form.largeur
    article.poids = form.poids
    article.contenu = [...form.contenu]
    article.label = `📦 Carton ${form.hauteur}×${form.longueur}×${form.largeur} cm`
  }

  addArticle(article)
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 14px;
  padding: 2rem;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 14px;
  right: 16px;
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: #888;
}

h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
  font-size: 1.4rem;
}

.field {
  margin-bottom: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #555;
}

input[type="text"],
input[type="number"],
textarea {
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
}

input:focus, textarea:focus {
  border-color: #42b883;
}

/* Radio buttons */
.radio-group {
  display: flex;
  gap: 12px;
}

.radio-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: border-color 0.2s, background 0.2s;
}

.radio-option input {
  display: none;
}

.radio-option.active {
  border-color: #42b883;
  background: #f0faf5;
  color: #2c3e50;
}

/* Dimensions */
.dimensions-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.dim-field {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.dim-field input {
  width: 100%;
  text-align: center;
}

.dim-label {
  font-size: 0.75rem;
  color: #888;
}

.dim-sep {
  font-size: 1.4rem;
  color: #aaa;
  padding-bottom: 18px;
}

/* Tag input */
.tag-input-wrapper {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 8px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.tag {
  background: #e8f7f1;
  color: #2c7a5e;
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tag-remove {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.7rem;
  color: #888;
  padding: 0;
  line-height: 1;
}

.tag-add-row {
  display: flex;
  gap: 8px;
}

.tag-add-row input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  outline: none;
}

.tag-add-row input:focus {
  border-color: #42b883;
}

.btn-add-tag {
  background: #42b883;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 14px;
  cursor: pointer;
  font-size: 0.85rem;
  white-space: nowrap;
}

.suggestions-list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 60px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  max-height: 180px;
  overflow-y: auto;
  z-index: 300;
  list-style: none;
  margin: 0;
  padding: 4px 0;
}

.suggestions-list li {
  padding: 8px 14px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #2c3e50;
  transition: background 0.15s;
}

.suggestions-list li:hover {
  background: #f0faf5;
  color: #42b883;
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
  transition: background 0.2s, opacity 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #369970;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ===== Simulateur de prix ===== */
.price-sim {
  background: linear-gradient(135deg, #f0fdf4, #eff6ff);
  border: 1.5px solid #bbf7d0;
  border-radius: 12px;
  padding: 1rem 1.1rem 0.8rem;
  margin-bottom: 1.2rem;
}

.price-sim-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.price-sim-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: #1e293b;
}

.price-sim-badge {
  font-size: 0.72rem;
  font-weight: 600;
  border-radius: 20px;
  padding: 2px 9px;
  letter-spacing: 0.02em;
}

.badge-precise {
  background: #dcfce7;
  color: #166534;
}

.badge-estimate {
  background: #fef3c7;
  color: #92400e;
}

.price-sim-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-bottom: 0.75rem;
}

.price-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.83rem;
  color: #475569;
}

.price-line-label {
  flex: 1;
}

.price-line-amount {
  font-weight: 600;
  font-size: 0.85rem;
  color: #64748b;
  white-space: nowrap;
}

.amount-base {
  color: #334155;
}

.amount-add {
  color: #2563eb;
}

.price-sim-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px dashed #a7f3d0;
  padding-top: 0.6rem;
  margin-bottom: 0.6rem;
  font-size: 0.88rem;
  font-weight: 600;
  color: #1e293b;
}

.price-total-val {
  font-size: 1.25rem;
  font-weight: 800;
  color: #16a34a;
}

.price-sim-bar-wrap {
  background: #d1fae5;
  border-radius: 20px;
  height: 6px;
  overflow: hidden;
  margin-bottom: 0.45rem;
}

.price-sim-bar {
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #16a34a);
  border-radius: 20px;
  transition: width 0.5s ease;
  min-width: 4px;
}

.price-sim-hint {
  font-size: 0.76rem;
  color: #64748b;
  font-style: italic;
}
</style>
