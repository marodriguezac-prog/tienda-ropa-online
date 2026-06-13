const express = require('express');
const router = express.Router();
const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');
const verificarToken = require('../middleware/auth');

// CREAR PEDIDO (con descuento de inventario)
router.post('/', verificarToken, async (req, res) => {
  try {
    const { productos } = req.body; // [{ producto: id, cantidad, talla, color }]

    let total = 0;
    const itemsPedido = [];

    for (const item of productos) {
      const productoDB = await Producto.findById(item.producto);

      if (!productoDB) {
        return res.status(404).json({ mensaje: `Producto ${item.producto} no encontrado` });
      }

      if (productoDB.stock < item.cantidad) {
        return res.status(400).json({
          mensaje: `Stock insuficiente para ${productoDB.nombre}. Disponible: ${productoDB.stock}`
        });
      }

      // Descontar stock
      productoDB.stock -= item.cantidad;
      await productoDB.save();

      const subtotal = productoDB.precio * item.cantidad;
      total += subtotal;

      itemsPedido.push({
        producto: productoDB._id,
        cantidad: item.cantidad,
        talla: item.talla,
        color: item.color,
        precioUnitario: productoDB.precio
      });
    }

    const nuevoPedido = new Pedido({
      usuario: req.usuario.id,
      productos: itemsPedido,
      total
    });

    await nuevoPedido.save();
    res.status(201).json(nuevoPedido);

  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// VER MIS PEDIDOS
router.get('/mis-pedidos', verificarToken, async (req, res) => {
  try {
    const pedidos = await Pedido.find({ usuario: req.usuario.id }).populate('productos.producto');
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// VER TODOS LOS PEDIDOS (admin)
router.get('/', verificarToken, async (req, res) => {
  try {
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'Acceso denegado' });
    }
    const pedidos = await Pedido.find().populate('usuario productos.producto');
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

module.exports = router;