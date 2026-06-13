const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// REGISTRO
router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'El correo ya esta registrado' });
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(password, salt);

    // Crear el usuario
    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password: passwordEncriptada
    });

    await nuevoUsuario.save();
    res.status(201).json({ mensaje: 'Usuario registrado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ mensaje: 'Credenciales invalidas' });
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(400).json({ mensaje: 'Credenciales invalidas' });
    }

    // Crear token
    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});
// Ruta temporal para asignar superadmin - BORRA ESTO DESPUÉS
  router.post('/hacer-superadmin', async (req, res) => {
  try {
    const { email } = req.body;
    const usuario = await Usuario.findOneAndUpdate(
      { email },
      { rol: 'superadmin' },
      { new: true }
    );
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json({ mensaje: `${usuario.nombre} ahora es superadmin`, usuario });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});
module.exports = router;