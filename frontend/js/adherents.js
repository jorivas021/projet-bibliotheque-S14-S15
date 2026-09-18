async function chargerAdherents() {
  afficherLignesChargement('adherents-tbody', 3);
  const adherents = await api.get('/adherents');
  const tbody = document.getElementById('adherents-tbody');
  tbody.innerHTML = adherents.map((a) => `
    <tr>
      <td>${a.nom}</td>
      <td>${a.contact}</td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-sm btn-info" onclick="voirHistorique(${a.id}, '${a.nom}')">
            📜 Historique
          </button>
          <button class="btn btn-sm btn-warning" onclick="editerAdherent(${a.id}, '${a.nom}', '${a.contact}')">
            ✏️ Modifier
          </button>
          <button class="btn btn-sm btn-danger" onclick="supprimerAdherent(${a.id})">
            🗑️ Supprimer
          </button>
        </div>
      </td>
    </tr>
  `).join('') || ligneEtatVide(3, 'Aucun adhérent enregistré.');

  remplirSelectAdherents(adherents);
}

function remplirSelectAdherents(adherents) {
  const optionsHTML = adherents.map((a) => `<option value="${a.id}">${a.nom}</option>`).join('');
  const selectEmprunt = document.getElementById('emprunt-adherent');
  if (selectEmprunt) selectEmprunt.innerHTML = optionsHTML;
  const selectReservation = document.getElementById('reservation-adherent');
  if (selectReservation) selectReservation.innerHTML = optionsHTML;
}

async function voirHistorique(id, nom) {
  const zone = document.getElementById('adherent-historique');
  zone.innerHTML = `<h3>Historique de ${nom}</h3><p class="table-empty">Chargement...</p>`;
  const historique = await api.get(`/adherents/${id}/emprunts`);

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
  try {
    await api.delete(`/adherents/${id}`);
    toast('Adhérent supprimé.');
    chargerAdherents();
  } catch (err) {
    toast(err.message, 'erreur');
  }
}

document.getElementById('btn-afficher-form-adherent').addEventListener('click', () => basculerForm('form-adherent'));

document.getElementById('form-adherent').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('adherent-id').value;
  const corps = {
    nom: document.getElementById('adherent-nom').value,
    contact: document.getElementById('adherent-contact').value,
  };

  const deverrouiller = verrouillerBouton(e.target.querySelector('button[type="submit"]'), 'Enregistrement...');
  try {
    if (id) {
      await api.put(`/adherents/${id}`, corps);
      toast('Adhérent modifié.');
    } else {
      await api.post('/adherents', corps);
      toast('Adhérent ajouté.');
    }
    e.target.reset();
    document.getElementById('adherent-id').value = '';
    e.target.classList.add('hidden');
    chargerAdherents();
  } catch (err) {
    toast(err.message, 'erreur');
  } finally {
    deverrouiller();
  }
});