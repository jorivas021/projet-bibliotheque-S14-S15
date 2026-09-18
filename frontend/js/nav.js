document.querySelectorAll('.nav-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach((b) => {
      b.classList.remove('active');
      b.removeAttribute('aria-current');
    });
    document.querySelectorAll('.section').forEach((s) => s.classList.remove('active'));

    btn.classList.add('active');
    btn.setAttribute('aria-current', 'page');
    const section = document.getElementById(btn.dataset.section);
    section.classList.add('active');

    // Recharge les données à chaque changement de section
    if (btn.dataset.section === 'tableau-bord') chargerStats();
    if (btn.dataset.section === 'livres') chargerLivres();
    if (btn.dataset.section === 'auteurs') chargerAuteurs();
    if (btn.dataset.section === 'adherents') chargerAdherents();
    if (btn.dataset.section === 'emprunts') chargerEmprunts();
  });
});

function basculerForm(idForm) {
  document.getElementById(idForm).classList.toggle('hidden');
}

document.querySelectorAll('form.form button.btn-annuler').forEach((btn) => {
  btn.addEventListener('click', () => {
    const form = btn.closest('form');
    form.reset();
    const idField = form.querySelector('input[type="hidden"]');
    if (idField) idField.value = '';
    const erreurZone = form.querySelector('.erreur');
    if (erreurZone) erreurZone.textContent = '';
    form.classList.add('hidden');
  });
});