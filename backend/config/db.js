const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      }
);

// --- INITIALISATION AUTOMATIQUE DE LA BASE DE DONNÉES ---
const initDatabase = async () => {
  try {
    const sqlPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(sqlPath)) {
      const sql = fs.readFileSync(sqlPath, 'utf8');
      await pool.query(sql);
      console.log('✅ Base de données initialisée avec succès !');
    }
  } catch (err) {
    console.error('❌ Erreur lors de l\'initialisation du schéma :', err);
  }
};

initDatabase();

pool.on('error', (err) => {
  console.error('Erreur inattendue du pool PostgreSQL', err);
});

module.exports = pool;