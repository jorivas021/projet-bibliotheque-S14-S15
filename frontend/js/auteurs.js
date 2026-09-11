async function chargerAuteurs() {
  const auteurs = await api.get('/auteurs');
  const tbody = document.getElementById('auteurs-tbody');
  tbody.innerHTML = auteurs.map((a) => `
    <tr>
      <td>${a.nom}</td>
      <td>${a.nationalite || '-'}</td>
      <td>
        <button onclick="editerAuteur(${a.id}, '${a.nom}', '${a.nationalite || ''}')">Modifier</button>
        <button class="btn-annuler" onclick="supprimerAuteur(${a.id})">Supprimer</button>
      </td>
    </tr>
  `).join('');

  remplirSelectAuteurs(auteurs);
}

function remplirSelectAuteurs(auteurs) {
  const select = document.getElementById('livre-auteur');
  if (!select) return;
  select.innerHTML = auteurs.map((a) => `<option value="${a.id}">${a.nom}</option>`).join('');
}

function editerAuteur(id, nom, nationalite) {
  document.getElementById('auteur-id').value = id;
  document.getElementById('auteur-nom').value = nom;
  document.getElementById('auteur-nationalite').value = nationalite;
  document.getElementById('form-auteur').classList.remove('hidden');
}

async function supprimerAuteur(id) {
  if (!confirm('Supprimer cet auteur ?')) return;
  await api.delete(`/auteurs/${id}`);
  chargerAuteurs();
}

document.getElementById('btn-afficher-form-auteur').addEventListener('click', () => basculerForm('form-auteur'));

document.getElementById('form-auteur').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('auteur-id').value;
  const corps = {
    nom: document.getElementById('auteur-nom').value,
    nationalite: document.getElementById('auteur-nationalite').value,
  };

  if (id) {
    await api.put(`/auteurs/${id}`, corps);
  } else {
    await api.post('/auteurs', corps);
  }

  e.target.reset();
  document.getElementById('auteur-id').value = '';
  e.target.classList.add('hidden');
  chargerAuteurs();
});
