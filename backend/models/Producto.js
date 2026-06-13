const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  descripcion: {
    type: String
  },
  precio: {
    type: Number,
    required: true
  },
  categoria: {
    type: String
  },
  tallas: {
    type: [String]
  },
  colores: {
    type: [String]
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  imagen: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Producto', productoSchema);
