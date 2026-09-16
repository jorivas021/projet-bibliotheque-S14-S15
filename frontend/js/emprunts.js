async function chargerEmprunts() {
  const emprunts = await api.get('/emprunts');
  const tbody = document.getElementById('emprunts-tbody');

  tbody.innerHTML = emprunts.map((e) => {
    const enRetard = e.date_retour_prevue < new Date().toISOString().slice(0, 10);
    return `
      <tr class="${enRetard ? 'en-retard' : ''}">
        <td>${e.adherent_nom}</td>
        <td>${e.livre_titre}</td>
        <td>${e.date_emprunt}</td>
        <td>${e.date_retour_prevue}</td>
        <td>${enRetard ? '<span class="badge retard">En retard</span>' : '<span class="badge en-cours">En cours</span>'}</td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-sm btn-success" onclick="enregistrerRetour(${e.id})">
              ✓ Marquer comme rendu
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="6">Aucun emprunt en cours.</td></tr>';

  chargerSelectLivresDisponibles();
}

async function chargerSelectLivresDisponibles() {
  const { donnees } = await api.get('/livres?limite=100');
  const select = document.getElementById('emprunt-livre');
  const disponibles = donnees.filter((l) => l.disponible);
  select.innerHTML = disponibles.map((l) => `<option value="${l.id}">${l.titre}</option>`).join('')
    || '<option value="">Aucun livre disponible</option>';
}

async function enregistrerRetour(id) {
  try {
    await api.patch(`/emprunts/${id}/retour`);
    toast('Retour enregistré.');
    chargerEmprunts();
  } catch (err) {
    toast(err.message, 'erreur');
  }
}

async function exporterRetardCSV() {
  const retards = await api.get('/emprunts/retard');
  if (retards.length === 0) {
    toast('Aucun emprunt en retard à exporter.', 'erreur');
    return;
  }

  const entetes = ['Adherent', 'Livre', 'Date emprunt', 'Date retour prevue'];
  const lignes = retards.map((e) => [e.adherent_nom, e.livre_titre, e.date_emprunt, e.date_retour_prevue]);
  const csv = [entetes, ...lignes]
    .map((ligne) => ligne.map((champ) => `"${String(champ).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `emprunts-en-retard-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast('Export CSV téléchargé.');
}

document.getElementById('btn-export-retard').addEventListener('click', exporterRetardCSV);

document.getElementById('btn-afficher-form-emprunt').addEventListener('click', () => basculerForm('form-emprunt'));

document.getElementById('form-emprunt').addEventListener('submit', async (e) => {
  e.preventDefault();
  const erreurZone = document.getElementById('emprunt-erreur');
  erreurZone.textContent = '';

  const corps = {
    adherent_id: document.getElementById('emprunt-adherent').value,
    livre_id: document.getElementById('emprunt-livre').value,
    date_retour_prevue: document.getElementById('emprunt-date-retour').value,
  };

  try {
    await api.post('/emprunts', corps);
    toast('Emprunt enregistré.');
    e.target.reset();
    e.target.classList.add('hidden');
    chargerEmprunts();
  } catch (err) {
    erreurZone.textContent = err.message;
    toast(err.message, 'erreur');
  }
});
