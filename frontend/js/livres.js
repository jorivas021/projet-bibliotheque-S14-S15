let livresPageActuelle = 1;

async function chargerLivres(page = 1) {
  livresPageActuelle = page;
  const q = document.getElementById('recherche-livre').value.trim();
  const params = new URLSearchParams({ page, limite: 10 });
  if (q) params.set('q', q);

  const { donnees, pagination } = await api.get(`/livres?${params}`);

  const tbody = document.getElementById('livres-tbody');
  tbody.innerHTML = donnees.map((l) => `
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
        <button onclick="editerLivre(${l.id}, '${l.titre.replace(/'/g, "\\'")}', ${l.annee_publication || 'null'}, ${l.auteur_id})">Modifier</button>
        <button class="btn-annuler" onclick="supprimerLivre(${l.id})">Supprimer</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="5">Aucun livre trouvé.</td></tr>';

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
  await api.delete(`/livres/${id}`);
  chargerLivres(livresPageActuelle);
}

document.getElementById('btn-afficher-form-livre').addEventListener('click', () => basculerForm('form-livre'));

let rechercheTimeout;
document.getElementById('recherche-livre').addEventListener('input', () => {
  clearTimeout(rechercheTimeout);
  rechercheTimeout = setTimeout(() => chargerLivres(1), 300);
});

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

  try {
    if (id) {
      await api.put(`/livres/${id}`, corps);
    } else {
      await api.post('/livres', corps);
    }
    e.target.reset();
    document.getElementById('livre-id').value = '';
    e.target.classList.add('hidden');
    chargerLivres(livresPageActuelle);
  } catch (err) {
    erreurZone.textContent = err.message;
  }
});
