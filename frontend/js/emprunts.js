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
        <td><button onclick="enregistrerRetour(${e.id})">Marquer comme rendu</button></td>
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
  await api.patch(`/emprunts/${id}/retour`);
  chargerEmprunts();
}

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
    e.target.reset();
    e.target.classList.add('hidden');
    chargerEmprunts();
  } catch (err) {
    erreurZone.textContent = err.message;
  }
});
