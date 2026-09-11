async function chargerStats() {
  const s = await api.get('/stats');
  const grid = document.getElementById('stats-grid');

  grid.innerHTML = `
    <div class="stat-card"><div class="valeur">${s.total_livres}</div><div class="label">Livres</div></div>
    <div class="stat-card"><div class="valeur">${s.total_adherents}</div><div class="label">Adhérents</div></div>
    <div class="stat-card"><div class="valeur">${s.emprunts_en_cours}</div><div class="label">Emprunts en cours</div></div>
    <div class="stat-card"><div class="valeur">${s.emprunts_en_retard}</div><div class="label">Emprunts en retard</div></div>
    <div class="stat-card">
      <div class="valeur">${s.livre_plus_emprunte ? s.livre_plus_emprunte.titre : '-'}</div>
      <div class="label">Livre le plus emprunté</div>
    </div>
    <div class="stat-card">
      <div class="valeur">${s.adherent_plus_actif ? s.adherent_plus_actif.nom : '-'}</div>
      <div class="label">Adhérent le plus actif</div>
    </div>
  `;
}
