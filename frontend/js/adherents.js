async function chargerAdherents() {
  const adherents = await api.get('/adherents');
  const tbody = document.getElementById('adherents-tbody');
  tbody.innerHTML = adherents.map((a) => `
    <tr>
      <td>${a.nom}</td>
      <td>${a.contact}</td>
      <td>
        <button onclick="voirHistorique(${a.id}, '${a.nom}')">Historique</button>
        <button onclick="editerAdherent(${a.id}, '${a.nom}', '${a.contact}')">Modifier</button>
        <button class="btn-annuler" onclick="supprimerAdherent(${a.id})">Supprimer</button>
      </td>
    </tr>
  `).join('');

  remplirSelectAdherents(adherents);
}

function remplirSelectAdherents(adherents) {
  const select = document.getElementById('emprunt-adherent');
  if (!select) return;
  select.innerHTML = adherents.map((a) => `<option value="${a.id}">${a.nom}</option>`).join('');
}

async function voirHistorique(id, nom) {
  const historique = await api.get(`/adherents/${id}/emprunts`);
  const zone = document.getElementById('adherent-historique');

  if (historique.length === 0) {
    zone.innerHTML = `<h3>Historique de ${nom}</h3><p>Aucun emprunt.</p>`;
    return;
  }

  zone.innerHTML = `
    <h3>Historique de ${nom}</h3>
    <table>
      <thead><tr><th>Livre</th><th>Emprunté le</th><th>Retour prévu</th><th>Statut</th></tr></thead>
      <tbody>
        ${historique.map((h) => `
          <tr>
            <td>${h.livre_titre}</td>
            <td>${h.date_emprunt}</td>
            <td>${h.date_retour_prevue}</td>
            <td>${statutBadge(h)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function statutBadge(h) {
  if (!h.en_cours) return '<span class="badge disponible">Rendu</span>';
  if (h.en_retard) return '<span class="badge retard">En retard</span>';
  return '<span class="badge en-cours">En cours</span>';
}

function editerAdherent(id, nom, contact) {
  document.getElementById('adherent-id').value = id;
  document.getElementById('adherent-nom').value = nom;
  document.getElementById('adherent-contact').value = contact;
  document.getElementById('form-adherent').classList.remove('hidden');
}

async function supprimerAdherent(id) {
  if (!confirm('Supprimer cet adhérent ?')) return;
  await api.delete(`/adherents/${id}`);
  chargerAdherents();
}

document.getElementById('btn-afficher-form-adherent').addEventListener('click', () => basculerForm('form-adherent'));

document.getElementById('form-adherent').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('adherent-id').value;
  const corps = {
    nom: document.getElementById('adherent-nom').value,
    contact: document.getElementById('adherent-contact').value,
  };

  if (id) {
    await api.put(`/adherents/${id}`, corps);
  } else {
    await api.post('/adherents', corps);
  }

  e.target.reset();
  document.getElementById('adherent-id').value = '';
  e.target.classList.add('hidden');
  chargerAdherents();
});
