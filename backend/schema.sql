-- ============================================
-- Schéma de la base de données - Bibliothèque de quartier
-- ============================================

DROP TABLE IF EXISTS emprunts;
DROP TABLE IF EXISTS livres;
DROP TABLE IF EXISTS adherents;
DROP TABLE IF EXISTS auteurs;

-- Auteurs
CREATE TABLE auteurs (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(150) NOT NULL,
    nationalite VARCHAR(100)
);

-- Adhérents
CREATE TABLE adherents (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(150) NOT NULL,
    contact VARCHAR(150) NOT NULL
);

-- Livres
CREATE TABLE livres (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(200) NOT NULL,
    annee_publication INTEGER,
    auteur_id INTEGER NOT NULL REFERENCES auteurs(id) ON DELETE CASCADE,
    disponible BOOLEAN NOT NULL DEFAULT TRUE
);

-- Emprunts
CREATE TABLE emprunts (
    id SERIAL PRIMARY KEY,
    livre_id INTEGER NOT NULL REFERENCES livres(id) ON DELETE CASCADE,
    adherent_id INTEGER NOT NULL REFERENCES adherents(id) ON DELETE CASCADE,
    date_emprunt DATE NOT NULL DEFAULT CURRENT_DATE,
    date_retour_prevue DATE NOT NULL,
    date_retour_effective DATE -- NULL tant que le livre n'est pas rendu
);

-- Réservations (file d'attente sur un livre déjà emprunté)
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    livre_id INTEGER NOT NULL REFERENCES livres(id) ON DELETE CASCADE,
    adherent_id INTEGER NOT NULL REFERENCES adherents(id) ON DELETE CASCADE,
    date_reservation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (livre_id, adherent_id)
);

-- Index utiles pour les recherches et jointures fréquentes
CREATE INDEX idx_livres_auteur ON livres(auteur_id);
CREATE INDEX idx_emprunts_livre ON emprunts(livre_id);
CREATE INDEX idx_emprunts_adherent ON emprunts(adherent_id);
CREATE INDEX idx_emprunts_retour_effective ON emprunts(date_retour_effective);
CREATE INDEX idx_reservations_livre ON reservations(livre_id);

-- ============================================
-- Données de démonstration (optionnel)
-- ============================================
INSERT INTO auteurs (nom, nationalite) VALUES
('Victor Hugo', 'Française'),
('Chinua Achebe', 'Nigériane'),
('Alain Mabanckou', 'Congolaise');

INSERT INTO adherents (nom, contact) VALUES
('Awa Ngoma', 'awa.ngoma@mail.com'),
('Paul Ikama', '06 123 45 67');

INSERT INTO livres (titre, annee_publication, auteur_id, disponible) VALUES
('Les Misérables', 1862, 1, TRUE),
('Le Monde s''effondre', 1958, 2, TRUE),
('Verre Cassé', 2005, 3, TRUE);
