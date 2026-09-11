require('dotenv').config();
const express = require('express');
const cors = require('cors');

const logger = require('./middlewares/logger');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

const auteursRoutes = require('./routes/auteurs');
const adherentsRoutes = require('./routes/adherents');
const livresRoutes = require('./routes/livres');
const empruntsRoutes = require('./routes/emprunts');
const statsRoutes = require('./routes/stats');

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

app.get('/api', (req, res) => res.json({ message: 'API Bibliothèque de quartier - OK' }));

app.use('/api/auteurs', auteursRoutes);
app.use('/api/adherents', adherentsRoutes);
app.use('/api/livres', livresRoutes);
app.use('/api/emprunts', empruntsRoutes);
app.use('/api/stats', statsRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
