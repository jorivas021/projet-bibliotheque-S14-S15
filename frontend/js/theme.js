// Couleurs de la barre du navigateur mobile, alignées sur --bg-header
const COULEUR_HEADER = { light: '#0d1220', dark: '#05070d' };

function appliquerMetaThemeColor(theme) {
  const meta = document.getElementById('meta-theme-color');
  if (meta) meta.setAttribute('content', COULEUR_HEADER[theme] || COULEUR_HEADER.light);
}

// Initialisation du thème au chargement
(function initTheme() {
  const themeSauvegarde = localStorage.getItem('theme');
  const preferenceSysteme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const themeFinal = themeSauvegarde || preferenceSysteme;

  document.documentElement.setAttribute('data-theme', themeFinal);
  appliquerMetaThemeColor(themeFinal);
})();

document.addEventListener('DOMContentLoaded', () => {
  const themeToggleBtn = document.getElementById('theme-toggle');

  if (themeToggleBtn) {
    themeToggleBtn.setAttribute('aria-pressed', document.documentElement.getAttribute('data-theme') === 'dark' ? 'true' : 'false');

    themeToggleBtn.addEventListener('click', () => {
      const themeActuel = document.documentElement.getAttribute('data-theme');
      const nouveauTheme = themeActuel === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', nouveauTheme);
      localStorage.setItem('theme', nouveauTheme);
      appliquerMetaThemeColor(nouveauTheme);
      themeToggleBtn.setAttribute('aria-pressed', nouveauTheme === 'dark' ? 'true' : 'false');

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