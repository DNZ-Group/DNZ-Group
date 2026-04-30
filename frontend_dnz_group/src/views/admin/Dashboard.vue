<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-logo">DNZ-Group</div>
      <p class="sidebar-role">Panneau administrateur</p>
      <nav class="sidebar-nav">
        <button :class="{ active: tab === 'stats' }" @click="tab = 'stats'">
          <span class="icon">📊</span> Statistiques
        </button>
        <button :class="{ active: tab === 'users' }" @click="tab = 'users'">
          <span class="icon">👥</span> Utilisateurs
        </button>
        <button :class="{ active: tab === 'articles' }" @click="tab = 'articles'">
          <span class="icon">📦</span> Articles
        </button>
        <button :class="{ active: tab === 'email' }" @click="openEmailTab">
          <span class="icon">✉️</span> Messagerie
          <span v-if="inboxUnread > 0" class="unread-badge">{{ inboxUnread }}</span>
        </button>
        <button :class="{ active: tab === 'calendar' }" @click="tab = 'calendar'">
          <span class="icon">📅</span> Calendrier
        </button>
        <button :class="{ active: tab === 'conflicts' }" @click="tab = 'conflicts'">
          <span class="icon">⚠️</span> Conflits
          <span v-if="openConflicts > 0" class="unread-badge">{{ openConflicts }}</span>
        </button>
        <button :class="{ active: tab === 'progress' }" @click="tab = 'progress'">
          <span class="icon">📈</span> Progression
        </button>
      </nav>
      <button class="sidebar-logout" @click="handleLogout">⬅ Déconnexion</button>
    </aside>

    <!-- Main content -->
    <main class="admin-main">
      <!-- Header -->
      <div class="admin-topbar">
        <h1 class="page-title">{{ tabTitle }}</h1>
        <span class="admin-badge">👤 {{ currentUser?.name }}</span>
      </div>

      <!-- ===== STATS ===== -->
      <section v-if="tab === 'stats'" class="section">
        <div class="stats-grid">
          <div class="stat-card blue">
            <div class="stat-value">{{ stats.totalUsers }}</div>
            <div class="stat-label">Utilisateurs</div>
          </div>
          <div class="stat-card green">
            <div class="stat-value">{{ stats.totalArticles }}</div>
            <div class="stat-label">Articles total</div>
          </div>
          <div class="stat-card orange">
            <div class="stat-value">{{ stats.voitures }}</div>
            <div class="stat-label">Voitures</div>
          </div>
          <div class="stat-card purple">
            <div class="stat-value">{{ stats.cartons }}</div>
            <div class="stat-label">Cartons</div>
          </div>
        </div>

        <div class="recent-section">
          <h2>Derniers utilisateurs inscrits</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>E-mail</th>
                <th>Rôle</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in recentUsers" :key="u.email">
                <td>{{ u.name }}</td>
                <td>{{ u.email }}</td>
                <td><span :class="['badge', u.role === 'admin' ? 'badge-admin' : 'badge-user']">{{ u.role }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ===== USERS ===== -->
      <section v-if="tab === 'users'" class="section">
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
                <button
                  v-if="u.role !== 'admin'"
                  class="btn-danger-sm"
                  @click="confirmDeleteUser(u)"
                >Supprimer</button>
                <span v-else class="text-muted">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- ===== ARTICLES ===== -->
      <section v-if="tab === 'articles'" class="section">
        <table class="data-table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Type</th>
              <th>Label</th>
              <th>Détails</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in allArticles" :key="a.id">
              <td>{{ a.userName }}</td>
              <td><span :class="['badge', a.type === 'voiture' ? 'badge-orange' : 'badge-blue']">{{ a.type }}</span></td>
              <td>{{ a.label || '—' }}</td>
              <td>
                <template v-if="a.type === 'voiture'">{{ a.marque }} {{ a.modele }} ({{ a.immatriculation }})</template>
                <template v-else>{{ a.longueur }}×{{ a.largeur }}×{{ a.hauteur }} cm</template>
              </td>
              <td>{{ a.createdAt }}</td>
              <td>
                <button class="btn-danger-sm" @click="confirmDeleteArticle(a)">Supprimer</button>
              </td>
            </tr>
            <tr v-if="allArticles.length === 0">
              <td colspan="6" class="empty">Aucun article enregistré.</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- ===== MESSAGERIE ===== -->
      <section v-if="tab === 'email'" class="section">
        <!-- Tabs inbox / envoyés / composer -->
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

        <!-- Loader -->
        <div v-if="emailLoading" class="email-loading">Chargement des emails…</div>
        <div v-if="emailError" class="error-banner">{{ emailError }}</div>

        <!-- INBOX -->
        <div v-if="emailView === 'inbox' && !emailLoading">
          <div v-if="inbox.length === 0 && !emailError" class="empty">Aucun email dans la boîte de réception.</div>
          <div class="email-list">
            <div
              v-for="msg in inbox"
              :key="msg.uid"
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
              v-for="msg in sent"
              :key="msg.uid"
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

      <!-- ===== CALENDRIER ===== -->
      <section v-if="tab === 'calendar'" class="section">
        <!-- Sélecteur de mois -->
        <div class="cal-header">
          <button class="btn-icon" @click="prevMonth">&#8249;</button>
          <h2 class="cal-month-label">{{ monthLabel }}</h2>
          <button class="btn-icon" @click="nextMonth">&#8250;</button>
          <button class="btn-primary cal-today-btn" @click="goToday">Aujourd'hui</button>
        </div>

        <!-- Grille calendrier -->
        <div class="cal-grid">
          <div class="cal-day-name" v-for="d in dayNames" :key="d">{{ d }}</div>
          <div
            v-for="cell in calCells"
            :key="cell.key"
            :class="[
              'cal-cell',
              { 'cal-cell--empty': !cell.day },
              { 'cal-cell--today': cell.isToday },
              { 'cal-cell--has-event': cell.events.length > 0 },
              { 'cal-cell--past': cell.isPast }
            ]"
            @click="cell.day && openDayModal(cell)"
          >
            <span v-if="cell.day" class="cal-day-num">{{ cell.day }}</span>
            <div class="cal-events-preview">
              <span
                v-for="ev in cell.events.slice(0, 2)"
                :key="ev.id"
                class="cal-chip"
              >{{ ev.label }}</span>
              <span v-if="cell.events.length > 2" class="cal-chip cal-chip--more">+{{ cell.events.length - 2 }}</span>
            </div>
          </div>
        </div>

        <!-- Liste de tous les transports -->
        <div class="cal-list-section">
          <h2>Tous les transports planifiés</h2>
          <div v-if="sortedEvents.length === 0" class="empty">Aucun transport planifié.</div>
          <table v-else class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Heure</th>
                <th>Libellé</th>
                <th>Description</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ev in sortedEvents" :key="ev.id">
                <td>{{ ev.date }}</td>
                <td>{{ ev.time || '—' }}</td>
                <td>{{ ev.label }}</td>
                <td>{{ ev.description || '—' }}</td>
                <td>
                  <span :class="['badge', ev.isPast ? 'badge-user' : 'badge-orange']">{{ ev.isPast ? 'Passé' : 'À venir' }}</span>
                </td>
                <td>
                  <button class="btn-danger-sm" @click="deleteEvent(ev.id)">Supprimer</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ===== CONFLITS ===== -->
      <section v-if="tab === 'conflicts'" class="section">
        <div class="section-actions">
          <div class="conflict-filters">
            <button
              v-for="f in conflictFilters"
              :key="f.value"
              :class="['filter-btn', { active: conflictFilter === f.value }]"
              @click="conflictFilter = f.value"
            >{{ f.label }}</button>
          </div>
          <button class="btn-primary" @click="showConflictModal = true">+ Nouveau conflit</button>
        </div>

        <div v-if="filteredConflicts.length === 0" class="empty">Aucun conflit enregistré.</div>
        <div v-else class="conflict-list">
          <div
            v-for="c in filteredConflicts"
            :key="c.id"
            :class="['conflict-card', `conflict-card--${c.severity}`]"
          >
            <div class="conflict-card-header">
              <div class="conflict-meta">
                <span class="conflict-date">📅 {{ c.date }}</span>
                <span :class="['conflict-severity', `sev-${c.severity}`]">
                  {{ severityLabel(c.severity) }}
                </span>
                <span :class="['conflict-status', c.resolved ? 'status-resolved' : 'status-open']">
                  {{ c.resolved ? '✅ Résolu' : '🔴 Ouvert' }}
                </span>
              </div>
              <div class="conflict-actions">
                <button
                  v-if="!c.resolved"
                  class="btn-resolve"
                  @click="resolveConflict(c.id)"
                  title="Marquer comme résolu"
                >✓ Résoudre</button>
                <button class="btn-danger-sm" @click="deleteConflict(c.id)">✕</button>
              </div>
            </div>
            <div class="conflict-client">👤 {{ c.clientName }}</div>
            <div class="conflict-title">{{ c.title }}</div>
            <div v-if="c.description" class="conflict-desc">{{ c.description }}</div>
          </div>
        </div>
      </section>

      <!-- ===== PROGRESSION ===== -->
      <section v-if="tab === 'progress'" class="section">

        <!-- KPIs principaux -->
        <div class="prog-kpi-grid">
          <div class="prog-kpi">
            <div class="prog-kpi-icon" style="background:#dbeafe">&#128101;</div>
            <div class="prog-kpi-body">
              <div class="prog-kpi-value">{{ prog.totalUsers }}</div>
              <div class="prog-kpi-label">Clients enregistrés</div>
              <div class="prog-kpi-sub">Croissance de la base client</div>
            </div>
          </div>
          <div class="prog-kpi">
            <div class="prog-kpi-icon" style="background:#dcfce7">&#128230;</div>
            <div class="prog-kpi-body">
              <div class="prog-kpi-value">{{ prog.totalArticles }}</div>
              <div class="prog-kpi-label">Articles transportés</div>
              <div class="prog-kpi-sub">Voitures + Colis</div>
            </div>
          </div>
          <div class="prog-kpi">
            <div class="prog-kpi-icon" style="background:#fef3c7">&#128197;</div>
            <div class="prog-kpi-body">
              <div class="prog-kpi-value">{{ prog.totalTransports }}</div>
              <div class="prog-kpi-label">Transports planifiés</div>
              <div class="prog-kpi-sub">Total agenda</div>
            </div>
          </div>
          <div class="prog-kpi">
            <div class="prog-kpi-icon" style="background:#fee2e2">&#9888;&#65039;</div>
            <div class="prog-kpi-body">
              <div class="prog-kpi-value">{{ prog.conflictResolutionRate }}%</div>
              <div class="prog-kpi-label">Taux de résolution</div>
              <div class="prog-kpi-sub">Conflits résolus / total</div>
            </div>
          </div>
        </div>

        <!-- Répartition articles -->
        <div class="prog-row">
          <div class="prog-card">
            <h3>&#128230; Répartition des articles</h3>
            <div class="prog-donut-wrapper">
              <svg viewBox="0 0 36 36" class="prog-donut">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" stroke-width="3"/>
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="#3b82f6" stroke-width="3"
                  stroke-dasharray="100" stroke-dashoffset="0"
                  :stroke-dasharray="`${prog.voituresPct} ${100 - prog.voituresPct}`"
                  stroke-linecap="round"
                  transform="rotate(-90 18 18)"
                />
              </svg>
              <div class="prog-donut-legend">
                <div class="legend-item"><span class="legend-dot" style="background:#3b82f6"></span> Voitures <strong>{{ prog.voitures }}</strong> ({{ prog.voituresPct }}%)</div>
                <div class="legend-item"><span class="legend-dot" style="background:#e2e8f0"></span> Cartons <strong>{{ prog.cartons }}</strong> ({{ 100 - prog.voituresPct }}%)</div>
              </div>
            </div>
          </div>

          <!-- Conflits par gravité -->
          <div class="prog-card">
            <h3>&#9888;&#65039; Conflits par gravité</h3>
            <div class="prog-bars">
              <div class="prog-bar-row">
                <span class="prog-bar-label">Faible</span>
                <div class="prog-bar-track">
                  <div class="prog-bar-fill" style="background:#22c55e" :style="{ width: prog.conflictBars.low + '%' }"></div>
                </div>
                <span class="prog-bar-count">{{ prog.conflictCounts.low }}</span>
              </div>
              <div class="prog-bar-row">
                <span class="prog-bar-label">Moyenne</span>
                <div class="prog-bar-track">
                  <div class="prog-bar-fill" style="background:#f97316" :style="{ width: prog.conflictBars.medium + '%' }"></div>
                </div>
                <span class="prog-bar-count">{{ prog.conflictCounts.medium }}</span>
              </div>
              <div class="prog-bar-row">
                <span class="prog-bar-label">Élevée</span>
                <div class="prog-bar-track">
                  <div class="prog-bar-fill" style="background:#ef4444" :style="{ width: prog.conflictBars.high + '%' }"></div>
                </div>
                <span class="prog-bar-count">{{ prog.conflictCounts.high }}</span>
              </div>
            </div>
            <div class="prog-conflict-summary">
              <div class="prog-mini-stat">
                <span class="mini-val">{{ prog.totalConflicts }}</span>
                <span class="mini-lbl">Total conflits</span>
              </div>
              <div class="prog-mini-stat">
                <span class="mini-val" style="color:#22c55e">{{ prog.resolvedConflicts }}</span>
                <span class="mini-lbl">Résolus</span>
              </div>
              <div class="prog-mini-stat">
                <span class="mini-val" style="color:#ef4444">{{ prog.openConflicts }}</span>
                <span class="mini-lbl">Ouverts</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Activité transports par mois -->
        <div class="prog-card prog-card--full">
          <h3>&#128197; Transports planifiés par mois (12 derniers mois)</h3>
          <div class="prog-chart">
            <div
              v-for="(m, i) in prog.transportsByMonth"
              :key="i"
              class="prog-chart-col"
            >
              <div class="prog-chart-bar-wrap">
                <div
                  class="prog-chart-bar"
                  :style="{ height: m.heightPct + '%', background: m.isCurrentMonth ? '#3b82f6' : '#93c5fd' }"
                  :title="m.count + ' transport(s)'"
                ></div>
              </div>
              <div class="prog-chart-label">{{ m.label }}</div>
            </div>
          </div>
        </div>

        <!-- Méthodes de croissance -->
        <div class="prog-card prog-card--full">
          <h3>&#127919; Méthodes de croissance utilisées</h3>
          <div class="prog-methods-grid">
            <div class="prog-method">
              <div class="prog-method-icon">&#128101;</div>
              <div class="prog-method-title">Acquisition client</div>
              <div class="prog-method-desc">Suivi du nombre de nouveaux comptes créés sur la plateforme. Indicateur principal de la croissance de la base client.</div>
              <div class="prog-method-metric">
                <span class="metric-val">{{ prog.totalUsers }}</span>
                <span class="metric-unit">clients</span>
              </div>
            </div>
            <div class="prog-method">
              <div class="prog-method-icon">&#128230;</div>
              <div class="prog-method-title">Volume d'activité</div>
              <div class="prog-method-desc">Nombre total d’articles (voitures + colis) enregistrés. Mesure directe du volume de transport traité.</div>
              <div class="prog-method-metric">
                <span class="metric-val">{{ prog.totalArticles }}</span>
                <span class="metric-unit">articles</span>
              </div>
            </div>
            <div class="prog-method">
              <div class="prog-method-icon">&#128197;</div>
              <div class="prog-method-title">Planification</div>
              <div class="prog-method-desc">Transports planifiés dans le calendrier. Révèle la capacité d’organisation et d’anticipation opérationnelle.</div>
              <div class="prog-method-metric">
                <span class="metric-val">{{ prog.totalTransports }}</span>
                <span class="metric-unit">transports</span>
              </div>
            </div>
            <div class="prog-method">
              <div class="prog-method-icon">&#10003;</div>
              <div class="prog-method-title">Qualité de service</div>
              <div class="prog-method-desc">Taux de résolution des conflits. Un taux élevé indique une bonne gestion des incidents et une satisfaction client accrue.</div>
              <div class="prog-method-metric">
                <span class="metric-val" :style="{ color: prog.conflictResolutionRate >= 80 ? '#22c55e' : prog.conflictResolutionRate >= 50 ? '#f97316' : '#ef4444' }">
                  {{ prog.conflictResolutionRate }}%
                </span>
                <span class="metric-unit">résolution</span>
              </div>
            </div>
            <div class="prog-method">
              <div class="prog-method-icon">&#128172;</div>
              <div class="prog-method-title">Communication client</div>
              <div class="prog-method-desc">Messagerie email intégrée et détection IA des conflits via WhatsApp/email. Améliore la réactivité et la relation client.</div>
              <div class="prog-method-metric">
                <span class="metric-val">IA</span>
                <span class="metric-unit">filtrage actif</span>
              </div>
            </div>
            <div class="prog-method">
              <div class="prog-method-icon">&#128202;</div>
              <div class="prog-method-title">Analyse des données</div>
              <div class="prog-method-desc">Tableau de bord centralisé avec KPIs en temps réel. Permet des décisions basées sur les données plutôt que l’intuition.</div>
              <div class="prog-method-metric">
                <span class="metric-val">6</span>
                <span class="metric-unit">indicateurs</span>
              </div>
            </div>
          </div>
        </div>

      </section>
    </main>

    <!-- Modal: nouveau conflit -->
    <div v-if="showConflictModal" class="modal-overlay" @click.self="closeConflictModal">
      <div class="modal">
        <h2>⚠️ Nouveau conflit</h2>
        <div v-if="conflictError" class="error-banner">{{ conflictError }}</div>
        <form @submit.prevent="handleAddConflict">
          <div class="field">
            <label>Nom du client *</label>
            <input v-model="newConflict.clientName" type="text" required placeholder="Jean Dupont" />
          </div>
          <div class="field">
            <label>Date du conflit *</label>
            <input v-model="newConflict.date" type="date" required />
          </div>
          <div class="field">
            <label>Titre / Objet *</label>
            <input v-model="newConflict.title" type="text" required placeholder="Ex: Colis endommagé" />
          </div>
          <div class="field">
            <label>Description</label>
            <textarea v-model="newConflict.description" rows="4" placeholder="Détails du problème…"></textarea>
          </div>
          <div class="field">
            <label>Gravité</label>
            <select v-model="newConflict.severity">
              <option value="low">Faible</option>
              <option value="medium">Moyenne</option>
              <option value="high">Élevée</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeConflictModal">Annuler</button>
            <button type="submit" class="btn-primary">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: jour calendrier -->
    <div v-if="dayModal.open" class="modal-overlay" @click.self="dayModal.open = false">
      <div class="modal">
        <h2>📅 {{ dayModal.dateLabel }}</h2>

        <!-- Événements du jour -->
        <div v-if="dayModal.events.length > 0" class="day-events-list">
          <div v-for="ev in dayModal.events" :key="ev.id" class="day-event-item">
            <div class="day-event-info">
              <span class="day-event-time">{{ ev.time || '—' }}</span>
              <span class="day-event-label">{{ ev.label }}</span>
              <span v-if="ev.description" class="day-event-desc">{{ ev.description }}</span>
            </div>
            <button class="btn-danger-sm" @click="deleteEvent(ev.id); dayModal.events = dayModal.events.filter(e => e.id !== ev.id)">✕</button>
          </div>
        </div>
        <p v-else class="text-muted" style="margin-bottom:1rem">Aucun transport ce jour.</p>

        <!-- Formulaire ajout -->
        <div v-if="calAddError" class="error-banner">{{ calAddError }}</div>
        <form @submit.prevent="handleAddEvent">
          <div class="field">
            <label>Libellé *</label>
            <input v-model="newEvent.label" type="text" required placeholder="Ex: Transport colis Paris" />
          </div>
          <div style="display:flex;gap:0.75rem">
            <div class="field" style="flex:1">
              <label>Heure</label>
              <input v-model="newEvent.time" type="time" />
            </div>
          </div>
          <div class="field">
            <label>Description</label>
            <input v-model="newEvent.description" type="text" placeholder="Détails optionnels" />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="dayModal.open = false">Fermer</button>
            <button type="submit" class="btn-primary">+ Ajouter</button>
          </div>
        </form>
      </div>
    </div>

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

    <!-- Confirmation suppression -->
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { currentUser, logout, getAllUsers, createUser, deleteUser } from '../../auth.js'

const router = useRouter()
const tab = ref('stats')

const tabTitle = computed(() => {
  if (tab.value === 'stats') return 'Statistiques'
  if (tab.value === 'users') return 'Gestion des utilisateurs'
  if (tab.value === 'email') return 'Messagerie'
  if (tab.value === 'calendar') return 'Calendrier des transports'
  if (tab.value === 'conflicts') return 'Conflits de transport'
  if (tab.value === 'progress') return 'Progression de l\'entreprise'
  return 'Gestion des articles'
})

// ---- Data ----
const allUsers = ref([])
const allArticles = ref([])

function loadUsers() {
  allUsers.value = getAllUsers()
}

function loadArticles() {
  const articles = []
  const users = getAllUsers()
  users.forEach(u => {
    const key = `dnz_articles_${u.email}`
    const userArticles = JSON.parse(localStorage.getItem(key) || '[]')
    userArticles.forEach(a => articles.push({ ...a, userName: u.name }))
  })
  allArticles.value = articles
}

onMounted(() => {
  loadUsers()
  loadArticles()
})

// ---- Stats ----
const stats = computed(() => ({
  totalUsers: allUsers.value.filter(u => u.role !== 'admin').length,
  totalArticles: allArticles.value.length,
  voitures: allArticles.value.filter(a => a.type === 'voiture').length,
  cartons: allArticles.value.filter(a => a.type === 'carton').length
}))

const recentUsers = computed(() => allUsers.value.slice(-5).reverse())

// ---- Create user ----
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

function handleCreateUser() {
  userModalError.value = ''
  userModalSuccess.value = false
  const ok = createUser({ ...newUser.value })
  if (!ok) {
    userModalError.value = 'Cet e-mail est déjà utilisé.'
    return
  }
  userModalSuccess.value = true
  loadUsers()
  setTimeout(closeUserModal, 1200)
}

// ---- Delete ----
const confirmTarget = ref(null)
const confirmMessage = ref('')
const confirmType = ref('')

function confirmDeleteUser(u) {
  confirmTarget.value = u
  confirmType.value = 'user'
  confirmMessage.value = `Supprimer le compte de « ${u.name } » (${u.email}) ?`
}

function confirmDeleteArticle(a) {
  confirmTarget.value = a
  confirmType.value = 'article'
  confirmMessage.value = `Supprimer l'article « ${a.label || a.type} » de ${a.userName} ?`
}

function executeDelete() {
  if (confirmType.value === 'user') {
    deleteUser(confirmTarget.value.email)
    loadUsers()
    loadArticles()
  } else {
    const email = allUsers.value.find(u => u.name === confirmTarget.value.userName)?.email
    if (email) {
      const key = `dnz_articles_${email}`
      const articles = JSON.parse(localStorage.getItem(key) || '[]')
      localStorage.setItem(key, JSON.stringify(articles.filter(a => a.id !== confirmTarget.value.id)))
      loadArticles()
    }
  }
  confirmTarget.value = null
}

// ---- Email ----
const API = 'http://localhost:3000'
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

function getToken() {
  return localStorage.getItem('dnz_token') || ''
}

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

function openEmailTab() {
  tab.value = 'email'
  if (inbox.value.length === 0) loadInbox()
}

async function handleSendEmail() {
  sendLoading.value = true
  sendSuccess.value = false
  sendError.value = ''
  try {
    const res = await fetch(`${API}/api/admin/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`
      },
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

// ---- Calendrier ----
const CAL_KEY = 'dnz_transport_events'

const today = new Date()
const calYear = ref(today.getFullYear())
const calMonth = ref(today.getMonth()) // 0-indexed

const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const monthLabel = computed(() => {
  return new Date(calYear.value, calMonth.value, 1)
    .toLocaleString('fr-FR', { month: 'long', year: 'numeric' })
})

function loadEvents() {
  return JSON.parse(localStorage.getItem(CAL_KEY) || '[]')
}

function saveEvents(evs) {
  localStorage.setItem(CAL_KEY, JSON.stringify(evs))
}

const calEvents = ref(loadEvents())

const calCells = computed(() => {
  const year = calYear.value
  const month = calMonth.value
  const firstDay = new Date(year, month, 1).getDay() // 0=Sun
  // Convert Sunday-first to Monday-first
  const offset = (firstDay === 0 ? 6 : firstDay - 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayStr = today.toISOString().slice(0, 10)

  const cells = []
  for (let i = 0; i < offset; i++) cells.push({ key: `e${i}`, day: null, events: [], isToday: false, isPast: false })
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dayEvents = calEvents.value.filter(e => e.date === dateStr)
    cells.push({
      key: dateStr,
      day: d,
      dateStr,
      events: dayEvents,
      isToday: dateStr === todayStr,
      isPast: dateStr < todayStr
    })
  }
  return cells
})

const sortedEvents = computed(() => {
  const todayStr = today.toISOString().slice(0, 10)
  return [...calEvents.value]
    .map(e => ({ ...e, isPast: e.date < todayStr }))
    .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
})

function prevMonth() {
  if (calMonth.value === 0) { calMonth.value = 11; calYear.value-- }
  else calMonth.value--
}

function nextMonth() {
  if (calMonth.value === 11) { calMonth.value = 0; calYear.value++ }
  else calMonth.value++
}

function goToday() {
  calYear.value = today.getFullYear()
  calMonth.value = today.getMonth()
}

// Modal jour
const dayModal = ref({ open: false, dateLabel: '', dateStr: '', events: [] })
const newEvent = ref({ label: '', time: '', description: '' })
const calAddError = ref('')

function openDayModal(cell) {
  dayModal.value = {
    open: true,
    dateStr: cell.dateStr,
    dateLabel: new Date(cell.dateStr + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    events: [...cell.events]
  }
  newEvent.value = { label: '', time: '', description: '' }
  calAddError.value = ''
}

function handleAddEvent() {
  calAddError.value = ''
  if (!newEvent.value.label.trim()) { calAddError.value = 'Le libellé est requis.'; return }
  const ev = {
    id: Date.now().toString(),
    date: dayModal.value.dateStr,
    label: newEvent.value.label.trim(),
    time: newEvent.value.time || '',
    description: newEvent.value.description.trim()
  }
  const evs = loadEvents()
  evs.push(ev)
  saveEvents(evs)
  calEvents.value = evs
  dayModal.value.events.push(ev)
  newEvent.value = { label: '', time: '', description: '' }
}

function deleteEvent(id) {
  const evs = loadEvents().filter(e => e.id !== id)
  saveEvents(evs)
  calEvents.value = evs
}

// ---- Conflits ----
const CONFLICTS_KEY = 'dnz_conflicts'

function loadConflicts() {
  return JSON.parse(localStorage.getItem(CONFLICTS_KEY) || '[]')
}
function saveConflicts(list) {
  localStorage.setItem(CONFLICTS_KEY, JSON.stringify(list))
}

const conflicts = ref(loadConflicts())
const conflictFilter = ref('all')
const conflictFilters = [
  { label: 'Tous', value: 'all' },
  { label: 'Ouverts', value: 'open' },
  { label: 'Résolus', value: 'resolved' }
]

const filteredConflicts = computed(() => {
  const list = [...conflicts.value].sort((a, b) => b.date.localeCompare(a.date))
  if (conflictFilter.value === 'open') return list.filter(c => !c.resolved)
  if (conflictFilter.value === 'resolved') return list.filter(c => c.resolved)
  return list
})

const openConflicts = computed(() => conflicts.value.filter(c => !c.resolved).length)

function severityLabel(s) {
  return s === 'high' ? 'Élevée' : s === 'medium' ? 'Moyenne' : 'Faible'
}

// Modal
const showConflictModal = ref(false)
const conflictError = ref('')
const newConflict = ref({ clientName: '', date: '', title: '', description: '', severity: 'medium' })

function closeConflictModal() {
  showConflictModal.value = false
  conflictError.value = ''
  newConflict.value = { clientName: '', date: '', title: '', description: '', severity: 'medium' }
}

function handleAddConflict() {
  conflictError.value = ''
  const c = {
    id: Date.now().toString(),
    clientName: newConflict.value.clientName.trim(),
    date: newConflict.value.date,
    title: newConflict.value.title.trim(),
    description: newConflict.value.description.trim(),
    severity: newConflict.value.severity,
    resolved: false,
    createdAt: new Date().toISOString()
  }
  const list = loadConflicts()
  list.push(c)
  saveConflicts(list)
  conflicts.value = list
  closeConflictModal()
}

function resolveConflict(id) {
  const list = loadConflicts().map(c => c.id === id ? { ...c, resolved: true, resolvedAt: new Date().toISOString() } : c)
  saveConflicts(list)
  conflicts.value = list
}

function deleteConflict(id) {
  const list = loadConflicts().filter(c => c.id !== id)
  saveConflicts(list)
  conflicts.value = list
}

// ---- Progression ----
const prog = computed(() => {
  const users = getAllUsers().filter(u => u.role !== 'admin')
  const totalUsers = users.length

  // Articles
  const allArts = []
  users.forEach(u => {
    const key = `dnz_articles_${u.email}`
    const arts = JSON.parse(localStorage.getItem(key) || '[]')
    allArts.push(...arts)
  })
  const totalArticles = allArts.length
  const voitures = allArts.filter(a => a.type === 'voiture').length
  const cartons = allArts.filter(a => a.type === 'carton').length
  const voituresPct = totalArticles > 0 ? Math.round((voitures / totalArticles) * 100) : 0

  // Transports
  const events = loadEvents()
  const totalTransports = events.length

  // Transports par mois (12 derniers mois)
  const now = new Date()
  const transportsByMonth = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const prefix = `${y}-${m}`
    const count = events.filter(e => e.date && e.date.startsWith(prefix)).length
    transportsByMonth.push({
      label: d.toLocaleString('fr-FR', { month: 'short' }),
      count,
      isCurrentMonth: i === 0
    })
  }
  const maxCount = Math.max(...transportsByMonth.map(m => m.count), 1)
  transportsByMonth.forEach(m => { m.heightPct = Math.round((m.count / maxCount) * 100) })

  // Conflits
  const conflictList = loadConflicts()
  const totalConflicts = conflictList.length
  const resolvedConflicts = conflictList.filter(c => c.resolved).length
  const openConflictsCount = totalConflicts - resolvedConflicts
  const conflictResolutionRate = totalConflicts > 0 ? Math.round((resolvedConflicts / totalConflicts) * 100) : 100

  const low = conflictList.filter(c => c.severity === 'low').length
  const medium = conflictList.filter(c => c.severity === 'medium').length
  const high = conflictList.filter(c => c.severity === 'high').length
  const maxSev = Math.max(low, medium, high, 1)

  return {
    totalUsers, totalArticles, voitures, cartons, voituresPct,
    totalTransports, transportsByMonth,
    totalConflicts, resolvedConflicts, openConflicts: openConflictsCount,
    conflictResolutionRate,
    conflictCounts: { low, medium, high },
    conflictBars: {
      low: Math.round((low / maxSev) * 100),
      medium: Math.round((medium / maxSev) * 100),
      high: Math.round((high / maxSev) * 100)
    }
  }
})

// ---- Logout ----
function handleLogout() {
  logout()
  router.push('/')
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f0f4f8;
  font-family: 'Segoe UI', sans-serif;
}

/* Sidebar */
.sidebar {
  width: 240px;
  background: #1e293b;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 2rem 1.25rem;
  gap: 0.5rem;
  position: sticky;
  top: 0;
  height: 100vh;
}

.sidebar-logo {
  font-size: 1.4rem;
  font-weight: 700;
  color: #38bdf8;
  margin-bottom: 0.25rem;
}

.sidebar-role {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 1.5rem;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.sidebar-nav button {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: transparent;
  border: none;
  color: #cbd5e1;
  padding: 0.65rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  text-align: left;
  transition: background 0.2s, color 0.2s;
}

.sidebar-nav button:hover,
.sidebar-nav button.active {
  background: #334155;
  color: white;
}

.icon { font-size: 1rem; }

.sidebar-logout {
  background: transparent;
  border: 1px solid #475569;
  color: #94a3b8;
  padding: 0.55rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s, color 0.2s;
  margin-top: auto;
}

.sidebar-logout:hover {
  background: #334155;
  color: white;
}

/* Main */
.admin-main {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.admin-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.admin-badge {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 0.4rem 0.9rem;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #475569;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem 1.25rem;
  box-shadow: 0 1px 6px rgba(0,0,0,0.07);
  border-left: 4px solid transparent;
}

.stat-card.blue  { border-color: #3b82f6; }
.stat-card.green { border-color: #22c55e; }
.stat-card.orange { border-color: #f97316; }
.stat-card.purple { border-color: #a855f7; }

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.recent-section h2 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.75rem;
}

/* Section */
.section { animation: fadeIn 0.2s ease; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.section-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

/* Table */
.data-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(0,0,0,0.07);
}

.data-table th {
  background: #f8fafc;
  color: #64748b;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.data-table td {
  padding: 0.8rem 1rem;
  font-size: 0.9rem;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
}

.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: #f8fafc; }

.empty { text-align: center; color: #94a3b8; padding: 2rem; }

/* Badges */
.badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: capitalize;
}

.badge-admin  { background: #fef3c7; color: #b45309; }
.badge-user   { background: #dbeafe; color: #1d4ed8; }
.badge-orange { background: #ffedd5; color: #c2410c; }
.badge-blue   { background: #dbeafe; color: #1d4ed8; }

/* Buttons */
.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.btn-primary:hover { background: #2563eb; }

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.btn-secondary:hover { background: #e2e8f0; }

.btn-danger {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.btn-danger:hover { background: #dc2626; }

.btn-danger-sm {
  background: transparent;
  border: 1px solid #fca5a5;
  color: #ef4444;
  padding: 3px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background 0.2s, color 0.2s;
}

.btn-danger-sm:hover {
  background: #ef4444;
  color: white;
}

.text-muted { color: #cbd5e1; font-size: 0.85rem; }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal {
  background: white;
  border-radius: 14px;
  padding: 2rem;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.18);
}

.modal-sm { max-width: 360px; }

.modal h2 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1.25rem;
}

.modal p { color: #475569; margin-bottom: 1.5rem; }

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 1rem;
}

.field label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
}

.field input,
.field select {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}

.field input:focus,
.field select:focus {
  border-color: #3b82f6;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.error-banner {
  background: #fee2e2;
  color: #b91c1c;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.success-banner {
  background: #dcfce7;
  color: #15803d;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

/* ===== EMAIL / MESSAGERIE ===== */
.email-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  gap: 0.75rem;
}

.email-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.email-tabs button {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 0.45rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.88rem;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}

.email-tabs button:hover {
  background: #f1f5f9;
}

.email-tabs button.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-icon {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.4rem 0.65rem;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}

.btn-icon:hover { background: #f1f5f9; }

.close-preview {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
}

.unread-badge {
  background: #ef4444;
  color: white;
  border-radius: 20px;
  font-size: 0.7rem;
  padding: 1px 6px;
  font-weight: 700;
}

.email-loading {
  text-align: center;
  color: #64748b;
  padding: 2rem;
  font-size: 0.95rem;
}

.email-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.07);
  overflow: hidden;
  margin-bottom: 1rem;
}

.email-item {
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background 0.15s;
}

.email-item:last-child { border-bottom: none; }

.email-item:hover { background: #f8fafc; }

.email-item.active { background: #eff6ff; }

.email-item.unread .email-subject {
  font-weight: 700;
  color: #1e293b;
}

.email-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.2rem;
}

.email-from {
  font-size: 0.88rem;
  font-weight: 600;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60%;
}

.email-date {
  font-size: 0.78rem;
  color: #94a3b8;
  white-space: nowrap;
}

.email-subject {
  font-size: 0.88rem;
  color: #475569;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.email-preview {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.07);
  padding: 1.25rem;
  position: relative;
}

.email-preview-header {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.88rem;
  color: #475569;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 0.75rem;
  padding-right: 2.5rem;
}

.email-preview-header strong { color: #1e293b; }

.email-preview-body {
  white-space: pre-wrap;
  font-size: 0.9rem;
  color: #334155;
  line-height: 1.6;
  max-height: 340px;
  overflow-y: auto;
}

.email-preview-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}

.compose-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.07);
  padding: 1.5rem;
}

.compose-card .field textarea {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  outline: none;
  width: 100%;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
  transition: border-color 0.2s;
}

.compose-card .field textarea:focus { border-color: #3b82f6; }

.compose-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

/* ===== CALENDRIER ===== */
.cal-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.cal-month-label {
  flex: 1;
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
  text-transform: capitalize;
  margin: 0;
}

.cal-today-btn {
  margin-left: auto;
  padding: 0.35rem 0.9rem;
  font-size: 0.82rem;
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 2rem;
}

.cal-day-name {
  text-align: center;
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  padding: 0.4rem 0;
}

.cal-cell {
  background: white;
  border-radius: 8px;
  min-height: 80px;
  padding: 0.4rem 0.5rem;
  cursor: pointer;
  border: 1px solid #e2e8f0;
  transition: box-shadow 0.15s, border-color 0.15s;
  position: relative;
}

.cal-cell:hover {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px #bfdbfe;
}

.cal-cell--empty {
  background: transparent;
  border: none;
  cursor: default;
  box-shadow: none;
}

.cal-cell--today {
  border-color: #3b82f6;
  background: #eff6ff;
}

.cal-cell--today .cal-day-num {
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cal-cell--past {
  background: #f8fafc;
  opacity: 0.7;
}

.cal-day-num {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  display: inline-flex;
  margin-bottom: 0.2rem;
}

.cal-events-preview {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cal-chip {
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 0.7rem;
  padding: 1px 5px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cal-chip--more {
  background: #f1f5f9;
  color: #64748b;
}

/* Liste transports */
.cal-list-section h2 {
  font-size: 1.05rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.75rem;
}

/* Modal jour */
.day-events-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.day-event-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
}

.day-event-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.day-event-time {
  font-size: 0.78rem;
  color: #94a3b8;
}

.day-event-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
}

.day-event-desc {
  font-size: 0.8rem;
  color: #64748b;
}

/* ===== CONFLITS ===== */
.conflict-filters {
  display: flex;
  gap: 0.4rem;
}

.filter-btn {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 0.35rem 0.9rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.82rem;
  color: #475569;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.filter-btn:hover { background: #f1f5f9; }
.filter-btn.active { background: #1e293b; color: white; border-color: #1e293b; }

.conflict-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.conflict-card {
  background: white;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  box-shadow: 0 1px 6px rgba(0,0,0,0.07);
  border-left: 4px solid #e2e8f0;
}

.conflict-card--low   { border-left-color: #22c55e; }
.conflict-card--medium { border-left-color: #f97316; }
.conflict-card--high  { border-left-color: #ef4444; }

.conflict-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.conflict-meta {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.conflict-date {
  font-size: 0.82rem;
  color: #64748b;
}

.conflict-severity {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
}

.sev-low    { background: #dcfce7; color: #15803d; }
.sev-medium { background: #ffedd5; color: #c2410c; }
.sev-high   { background: #fee2e2; color: #b91c1c; }

.conflict-status {
  font-size: 0.78rem;
  font-weight: 600;
}

.status-open     { color: #ef4444; }
.status-resolved { color: #22c55e; }

.conflict-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-resolve {
  background: transparent;
  border: 1px solid #86efac;
  color: #16a34a;
  padding: 3px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background 0.15s, color 0.15s;
}

.btn-resolve:hover {
  background: #22c55e;
  color: white;
}

.conflict-client {
  font-size: 0.82rem;
  color: #64748b;
  margin-bottom: 0.2rem;
}

.conflict-title {
  font-size: 0.97rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.2rem;
}

.conflict-desc {
  font-size: 0.85rem;
  color: #475569;
  line-height: 1.5;
}

.modal textarea {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  outline: none;
  width: 100%;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
  transition: border-color 0.2s;
}

.modal textarea:focus { border-color: #3b82f6; }

/* ===== PROGRESSION ===== */
.prog-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.prog-kpi {
  background: white;
  border-radius: 12px;
  padding: 1.1rem 1.25rem;
  box-shadow: 0 1px 6px rgba(0,0,0,0.07);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.prog-kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
}

.prog-kpi-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1;
}

.prog-kpi-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  margin-top: 0.2rem;
}

.prog-kpi-sub {
  font-size: 0.75rem;
  color: #94a3b8;
}

.prog-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

@media (max-width: 700px) { .prog-row { grid-template-columns: 1fr; } }

.prog-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 6px rgba(0,0,0,0.07);
}

.prog-card h3 {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1rem;
}

.prog-card--full {
  margin-bottom: 1rem;
}

/* Donut */
.prog-donut-wrapper {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.prog-donut {
  width: 90px;
  height: 90px;
  flex-shrink: 0;
}

.prog-donut-legend {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: #475569;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Bars */
.prog-bars {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.prog-bar-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.prog-bar-label {
  width: 60px;
  font-size: 0.8rem;
  color: #64748b;
  text-align: right;
  flex-shrink: 0;
}

.prog-bar-track {
  flex: 1;
  background: #f1f5f9;
  border-radius: 20px;
  height: 10px;
  overflow: hidden;
}

.prog-bar-fill {
  height: 100%;
  border-radius: 20px;
  transition: width 0.6s ease;
  min-width: 4px;
}

.prog-bar-count {
  width: 24px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #334155;
  text-align: right;
}

.prog-conflict-summary {
  display: flex;
  gap: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f1f5f9;
}

.prog-mini-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.mini-val {
  font-size: 1.3rem;
  font-weight: 800;
  color: #1e293b;
}

.mini-lbl {
  font-size: 0.72rem;
  color: #94a3b8;
}

/* Bar chart */
.prog-chart {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 120px;
  padding-bottom: 0.25rem;
}

.prog-chart-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  height: 100%;
}

.prog-chart-bar-wrap {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.prog-chart-bar {
  width: 100%;
  max-width: 32px;
  border-radius: 6px 6px 0 0;
  min-height: 4px;
  transition: height 0.5s ease;
}

.prog-chart-label {
  font-size: 0.7rem;
  color: #94a3b8;
  text-transform: capitalize;
}

/* Methods grid */
.prog-methods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.prog-method {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.prog-method-icon {
  font-size: 1.5rem;
  margin-bottom: 0.2rem;
}

.prog-method-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
}

.prog-method-desc {
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.5;
  flex: 1;
}

.prog-method-metric {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
  margin-top: 0.4rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e2e8f0;
}

.metric-val {
  font-size: 1.3rem;
  font-weight: 800;
  color: #1e293b;
}

.metric-unit {
  font-size: 0.75rem;
  color: #94a3b8;
}
</style>
