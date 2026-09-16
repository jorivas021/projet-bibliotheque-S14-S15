// Initialisation du thème au chargement
(function initTheme() {
  const themeSauvegarde = localStorage.getItem('theme');
  const preferenceSysteme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const themeFinal = themeSauvegarde || preferenceSysteme;
  
  document.documentElement.setAttribute('data-theme', themeFinal);
})();

document.addEventListener('DOMContentLoaded', () => {
  const themeToggleBtn = document.getElementById('theme-toggle');

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const themeActuel = document.documentElement.getAttribute('data-theme');
      const nouveauTheme = themeActuel === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', nouveauTheme);
      localStorage.setItem('theme', nouveauTheme);

      if (typeof toast === 'function') {
        toast(`Mode ${nouveauTheme === 'dark' ? 'Sombre' : 'Clair'} activé`);
      }
    });
  }

  // BONUS 1 : Raccourci Clavier Ctrl+K ou Cmd+K pour focus rapide sur la recherche
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      const rechercheInput = document.getElementById('recherche-livre');
      if (rechercheInput) {
        e.preventDefault();
        // Basculer vers l'onglet livre si non actif
        document.querySelector('.nav-btn[data-section="livres"]')?.click();
        setTimeout(() => rechercheInput.focus(), 100);
      }
    }
  });
});