const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');

console.log('URI:', process.env.MONGO_URI.replace(/:[^:@]+@/, ':****@'));

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch((err) => console.log('❌ Error de conexión:', err.message));

app.get('/', (req, res) => {
  res.send('¡El servidor está funcionando!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));