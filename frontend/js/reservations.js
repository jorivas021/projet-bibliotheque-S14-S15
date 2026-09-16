// Regroupe les réservations par livre : { livre_id: [reservation, ...] }
let reservationsParLivre = {};

async function chargerReservations() {
  const reservations = await api.get('/reservations');
  reservationsParLivre = {};
  reservations.forEach((r) => {
    if (!reservationsParLivre[r.livre_id]) reservationsParLivre[r.livre_id] = [];
    reservationsParLivre[r.livre_id].push(r);
  });
}

function ouvrirReservation(livreId, livreTitre) {
  document.getElementById('reservation-livre-id').value = livreId;
  document.getElementById('reservation-livre-nom').textContent = `Réserver : ${livreTitre}`;
  document.getElementById('form-reservation').classList.remove('hidden');
}

document.getElementById('form-reservation').addEventListener('submit', async (e) => {
  e.preventDefault();
  const erreurZone = document.getElementById('reservation-erreur');
  erreurZone.textContent = '';

  const corps = {
    livre_id: document.getElementById('reservation-livre-id').value,
    adherent_id: document.getElementById('reservation-adherent').value,
  };

  try {
    await api.post('/reservations', corps);
    toast('Réservation enregistrée.');
    e.target.reset();
    e.target.classList.add('hidden');
    chargerLivres(livresPageActuelle);
  } catch (err) {
    erreurZone.textContent = err.message;
    toast(err.message, 'erreur');
  }
});
