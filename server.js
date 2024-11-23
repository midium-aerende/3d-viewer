const express = require('express');
const path = require('path');
const app = express();

// Servir les fichiers du dossier dist (généré par Vite)
app.use(express.static(path.join(__dirname, 'dist')));

// Rediriger toutes les requêtes vers index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
