let livresPageActuelle = 1;

async function chargerLivres(page = 1) {
  livresPageActuelle = page;
  const q = document.getElementById('recherche-livre').value.trim();
  const disponibilite = document.getElementById('filtre-disponibilite').value;
  const auteurId = document.getElementById('filtre-auteur').value;

  const params = new URLSearchParams({ page, limite: 10 });
  if (q) params.set('q', q);
  if (disponibilite) params.set('disponible', disponibilite);
  if (auteurId) params.set('auteur_id', auteurId);

  afficherLignesChargement('livres-tbody', 5);

  const [{ donnees, pagination }] = await Promise.all([
    api.get(`/livres?${params}`),
    chargerReservations(),
  ]);

  const tbody = document.getElementById('livres-tbody');
  tbody.innerHTML = donnees.map((l) => {
    const enAttente = (reservationsParLivre[l.id] || []).length;
    const titreEchappe = l.titre.replace(/'/g, "\\'");
    return `
    <tr>
      <td>${l.titre}</td>
      <td>${l.auteur_nom}</td>
      <td>${l.annee_publication || '-'}</td>
      <td>
        <span class="badge ${l.disponible ? 'disponible' : 'emprunte'}">
          ${l.disponible ? 'Disponible' : 'Emprunté'}
        </span>
      </td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-sm btn-warning" onclick="editerLivre(${l.id}, '${titreEchappe}', ${l.annee_publication || 'null'}, ${l.auteur_id})">
            ✏️ Modifier
          </button>
          <button class="btn btn-sm btn-danger" onclick="supprimerLivre(${l.id})">
            🗑️ Supprimer
          </button>
          ${!l.disponible ? `<button class="btn btn-sm btn-info" onclick="ouvrirReservation(${l.id}, '${titreEchappe}')">📌 Réserver${enAttente ? ` (${enAttente})` : ''}</button>` : ''}
        </div>
      </td>
    </tr>
  `;
  }).join('') || ligneEtatVide(5, 'Aucun livre trouvé.');

  afficherPagination(pagination);
}

function afficherPagination(pagination) {
  const zone = document.getElementById('livres-pagination');
  if (pagination.totalPages <= 1) { zone.innerHTML = ''; return; }

  let html = '';
  for (let i = 1; i <= pagination.totalPages; i++) {
    html += `<button class="${i === pagination.page ? 'active' : ''}" onclick="chargerLivres(${i})">${i}</button>`;
  }
  zone.innerHTML = html;
}

function editerLivre(id, titre, annee, auteurId) {
  document.getElementById('livre-id').value = id;
  document.getElementById('livre-titre').value = titre;
  document.getElementById('livre-annee').value = annee || '';
  document.getElementById('livre-auteur').value = auteurId;
  document.getElementById('form-livre').classList.remove('hidden');
}

async function supprimerLivre(id) {
  if (!confirm('Supprimer ce livre ?')) return;
  try {
    await api.delete(`/livres/${id}`);
    toast('Livre supprimé.');
    chargerLivres(livresPageActuelle);
  } catch (err) {
    toast(err.message, 'erreur');
  }
}

document.getElementById('btn-afficher-form-livre').addEventListener('click', () => basculerForm('form-livre'));

let rechercheTimeout;
document.getElementById('recherche-livre').addEventListener('input', () => {
  clearTimeout(rechercheTimeout);
  rechercheTimeout = setTimeout(() => chargerLivres(1), 300);
});

document.getElementById('filtre-disponibilite').addEventListener('change', () => chargerLivres(1));
document.getElementById('filtre-auteur').addEventListener('change', () => chargerLivres(1));

document.getElementById('form-livre').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('livre-id').value;
  const erreurZone = document.getElementById('livre-erreur');
  erreurZone.textContent = '';

  const corps = {
    titre: document.getElementById('livre-titre').value,
    annee_publication: document.getElementById('livre-annee').value || null,
    auteur_id: document.getElementById('livre-auteur').value,
  };

  const deverrouiller = verrouillerBouton(e.target.querySelector('button[type="submit"]'), 'Enregistrement...');
  try {
    if (id) {
      await api.put(`/livres/${id}`, corps);
      toast('Livre modifié.');
    } else {
      await api.post('/livres', corps);
      toast('Livre ajouté.');
    }
    e.target.reset();
    document.getElementById('livre-id').value = '';
    e.target.classList.add('hidden');
    chargerLivres(livresPageActuelle);
  } catch (err) {
    erreurZone.textContent = err.message;
    toast(err.message, 'erreur');
  } finally {
    deverrouiller();
  }
});