async function chargerStats() {
  try {
    const s = await api.get('/stats');
    const grid = document.getElementById('stats-grid');

    if (!grid) return;

    grid.innerHTML = `
      <div class="stat-card">
        <div class="valeur">${s.total_livres ?? 0}</div>
        <div class="label">Livres au catalogue</div>
      </div>
      <div class="stat-card">
        <div class="valeur">${s.total_adherents ?? 0}</div>
        <div class="label">Adhérents inscrits</div>
      </div>
      <div class="stat-card">
        <div class="valeur">${s.emprunts_en_cours ?? 0}</div>
        <div class="label">Emprunts en cours</div>
      </div>
      <div class="stat-card">
        <div class="valeur">${s.emprunts_en_retard ?? 0}</div>
        <div class="label">Retards constatés</div>
      </div>
      <div class="stat-card">
        <div class="valeur" style="font-size:1.3rem;">${s.livre_plus_emprunte ? s.livre_plus_emprunte.titre : '-'}</div>
        <div class="label">Top Livre</div>
      </div>
      <div class="stat-card">
        <div class="valeur" style="font-size:1.3rem;">${s.adherent_plus_actif ? s.adherent_plus_actif.nom : '-'}</div>
        <div class="label">Lecteur du mois</div>
      </div>
    `;
  } catch (err) {
    console.error("Erreur stats:", err);
  }
}