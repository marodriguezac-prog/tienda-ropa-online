const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const Pedido = require('../models/Pedido');

// GET - Lista de usuarios registrados
router.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-password');
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// PUT - Cambiar estado de un pedido
router.put('/pedidos/:id/estado', async (req, res) => {
  try {
    const { estado } = req.body;
    const pedido = await Pedido.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    );
    if (!pedido) return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    res.json(pedido);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

module.exports = router;