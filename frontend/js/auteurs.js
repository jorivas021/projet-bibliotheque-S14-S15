async function chargerAuteurs() {
  const auteurs = await api.get('/auteurs');
  const tbody = document.getElementById('auteurs-tbody');
  tbody.innerHTML = auteurs.map((a) => `
    <tr>
      <td>${a.nom}</td>
      <td>${a.nationalite || '-'}</td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-sm btn-warning" onclick="editerAuteur(${a.id}, '${a.nom}', '${a.nationalite || ''}')">
            ✏️ Modifier
          </button>
          <button class="btn btn-sm btn-danger" onclick="supprimerAuteur(${a.id})">
            🗑️ Supprimer
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  remplirSelectAuteurs(auteurs);
}

function remplirSelectAuteurs(auteurs) {
  const select = document.getElementById('livre-auteur');
  if (select) select.innerHTML = auteurs.map((a) => `<option value="${a.id}">${a.nom}</option>`).join('');

  const filtre = document.getElementById('filtre-auteur');
  if (filtre) {
    const valeurActuelle = filtre.value;
    filtre.innerHTML = '<option value="">Tous les auteurs</option>'
      + auteurs.map((a) => `<option value="${a.id}">${a.nom}</option>`).join('');
    filtre.value = valeurActuelle;
  }
}

function editerAuteur(id, nom, nationalite) {
  document.getElementById('auteur-id').value = id;
  document.getElementById('auteur-nom').value = nom;
  document.getElementById('auteur-nationalite').value = nationalite;
  document.getElementById('form-auteur').classList.remove('hidden');
}

async function supprimerAuteur(id) {
  if (!confirm('Supprimer cet auteur ?')) return;
  try {
    await api.delete(`/auteurs/${id}`);
    toast('Auteur supprimé.');
    chargerAuteurs();
  } catch (err) {
    toast(err.message, 'erreur');
  }
}

document.getElementById('btn-afficher-form-auteur').addEventListener('click', () => basculerForm('form-auteur'));

document.getElementById('form-auteur').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('auteur-id').value;
  const corps = {
    nom: document.getElementById('auteur-nom').value,
    nationalite: document.getElementById('auteur-nationalite').value,
  };

  try {
    if (id) {
      await api.put(`/auteurs/${id}`, corps);
      toast('Auteur modifié.');
    } else {
      await api.post('/auteurs', corps);
      toast('Auteur ajouté.');
    }
    e.target.reset();
    document.getElementById('auteur-id').value = '';
    e.target.classList.add('hidden');
    chargerAuteurs();
  } catch (err) {
    toast(err.message, 'erreur');
  }
});
