const express = require('express');
const router = express.Router();
const Pedido = require('../models/Pedido');

// GET /api/reportes/ventas?desde=2026-01-01&hasta=2026-12-31
router.get('/ventas', async (req, res) => {
  try {
    const { desde, hasta } = req.query;

    let filtro = {};
    if (desde || hasta) {
      filtro.createdAt = {};
      if (desde) filtro.createdAt.$gte = new Date(desde);
      if (hasta) {
        const fechaHasta = new Date(hasta);
        fechaHasta.setHours(23, 59, 59, 999);
        filtro.createdAt.$lte = fechaHasta;
      }
    }

    const pedidos = await Pedido.find(filtro).populate('productos.producto');

    const totalRecaudado = pedidos.reduce((sum, p) => sum + p.total, 0);
    const numeroVentas = pedidos.length;

    // Contar productos mas vendidos
    const conteoProductos = {};
    pedidos.forEach(pedido => {
      pedido.productos.forEach(item => {
        const nombre = item.producto ? item.producto.nombre : 'Producto eliminado';
        if (!conteoProductos[nombre]) {
          conteoProductos[nombre] = { nombre, cantidad: 0, totalVendido: 0 };
        }
        conteoProductos[nombre].cantidad += item.cantidad;
        conteoProductos[nombre].totalVendido += item.precioUnitario * item.cantidad;
      });
    });

    const productosMasVendidos = Object.values(conteoProductos)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    res.json({
      totalRecaudado,
      numeroVentas,
      productosMasVendidos,
      pedidos
    });

  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

module.exports = router;