// Petits utilitaires d'interface partagés par les autres scripts.

// Affiche des lignes "squelette" (effet de chargement) le temps qu'un
// tableau se remplisse, pour éviter l'impression de page figée.
function afficherLignesChargement(idTbody, nbColonnes, nbLignes = 3) {
  const tbody = document.getElementById(idTbody);
  if (!tbody) return;
  const ligne = `<tr class="skeleton-row">${'<td><span class="skeleton"></span></td>'.repeat(nbColonnes)}</tr>`;
  tbody.innerHTML = ligne.repeat(nbLignes);
}

// Affiche un état vide cohérent dans un tableau (colspan + style dédié).
function ligneEtatVide(nbColonnes, message) {
  return `<tr><td colspan="${nbColonnes}" class="table-empty">${message}</td></tr>`;
}

// Désactive un bouton et change son texte le temps d'une requête,
// pour éviter les double-clics / doubles soumissions. Retourne une
// fonction à appeler pour restaurer son état initial.
function verrouillerBouton(bouton, texteTemporaire) {
  if (!bouton) return () => {};
  const texteOriginal = bouton.textContent;
  bouton.disabled = true;
  bouton.textContent = texteTemporaire;
  return () => {
    bouton.disabled = false;
    bouton.textContent = texteOriginal;
  };
}