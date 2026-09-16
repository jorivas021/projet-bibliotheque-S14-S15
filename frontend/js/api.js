const API_BASE = 'https://rivatheque.onrender.com/';

async function apiRequest(chemin, options = {}) {
  const reponse = await fetch(`${API_BASE}${chemin}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (reponse.status === 204) return null;

  const donnees = await reponse.json().catch(() => null);

  if (!reponse.ok) {
    throw new Error(donnees?.erreur || `Erreur ${reponse.status}`);
  }
  return donnees;
}

const api = {
  get: (chemin) => apiRequest(chemin),
  post: (chemin, corps) => apiRequest(chemin, { method: 'POST', body: JSON.stringify(corps) }),
  put: (chemin, corps) => apiRequest(chemin, { method: 'PUT', body: JSON.stringify(corps) }),
  patch: (chemin, corps) => apiRequest(chemin, { method: 'PATCH', body: corps ? JSON.stringify(corps) : undefined }),
  delete: (chemin) => apiRequest(chemin, { method: 'DELETE' }),
};
