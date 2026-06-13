const API_URL = 'http://localhost:3000/api';

// Cargar catalogo
async function cargarCatalogo() {
  const contenedor = document.getElementById('catalogo');
  if (!contenedor) return;

  try {
    const res = await fetch(`${API_URL}/productos`);
    const productos = await res.json();

    contenedor.innerHTML = '';

    productos.forEach(producto => {
      const card = document.createElement('div');
      card.className = 'producto-card';

      const tallasOptions = producto.tallas.map(t => `<option value="${t}">${t}</option>`).join('');
      const coloresOptions = producto.colores.map(c => `<option value="${c}">${c}</option>`).join('');

      card.innerHTML = `
        <img src="${producto.imagen}" alt="${producto.nombre}">
        <div class="info">
          <h3>${producto.nombre}</h3>
          <p>${producto.descripcion || ''}</p>
          <div class="precio">$${producto.precio.toLocaleString()}</div>
          <div class="stock">Stock disponible: ${producto.stock}</div>
          <select class="select-talla">${tallasOptions}</select>
          <select class="select-color">${coloresOptions}</select>
          <button onclick="agregarAlCarrito('${producto._id}', '${producto.nombre}', ${producto.precio}, this)">
            Agregar al carrito
          </button>
        </div>
      `;

      contenedor.appendChild(card);
    });
  } catch (error) {
    contenedor.innerHTML = '<p>Error al cargar el catalogo. Verifica que el servidor este corriendo.</p>';
    console.error(error);
  }
}

// Agregar producto al carrito (guardado en localStorage)
function agregarAlCarrito(id, nombre, precio, boton) {
  const card = boton.closest('.producto-card');
  const talla = card.querySelector('.select-talla').value;
  const color = card.querySelector('.select-color').value;

  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

  const itemExistente = carrito.find(item =>
    item.producto === id && item.talla === talla && item.color === color
  );

  if (itemExistente) {
    itemExistente.cantidad += 1;
  } else {
    carrito.push({ producto: id, nombre, precio, talla, color, cantidad: 1 });
  }

  localStorage.setItem('carrito', JSON.stringify(carrito));
  actualizarContadorCarrito();
  alert(`${nombre} agregado al carrito`);
}

// Actualizar el numero que se ve en el carrito
function actualizarContadorCarrito() {
  const contador = document.getElementById('contador-carrito');
  if (!contador) return;

  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  contador.textContent = totalItems;
}

// Verificar si el usuario esta logueado y actualizar el menu
function actualizarMenuUsuario() {
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const usuarioInfo = document.getElementById('usuario-info');
  const linkLogin = document.getElementById('link-login');
  const linkRegistro = document.getElementById('link-registro');
  const linkLogout = document.getElementById('link-logout');

  if (token && usuario) {
    if (usuarioInfo) usuarioInfo.textContent = `Hola, ${usuario.nombre}`;
    if (linkLogin) linkLogin.style.display = 'none';
    if (linkRegistro) linkRegistro.style.display = 'none';
    if (linkLogout) {
      linkLogout.style.display = 'inline';
      linkLogout.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = 'index.html';
      });
    }
  }
}

// Inicializar al cargar cualquier pagina
document.addEventListener('DOMContentLoaded', () => {
  cargarCatalogo();
  actualizarContadorCarrito();
  actualizarMenuUsuario();
}); // ─── LOGIN ──────────────────────────────────────────
async function iniciarSesion() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const mensaje = document.getElementById('mensaje');

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      mensaje.innerHTML = `<p class="mensaje-error">${data.mensaje}</p>`;
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));

    mensaje.innerHTML = `<p class="mensaje-exito">Inicio de sesion exitoso. Redirigiendo...</p>`;
    setTimeout(() => window.location.href = 'index.html', 1000);

  } catch (error) {
    mensaje.innerHTML = `<p class="mensaje-error">Error de conexion con el servidor</p>`;
  }
}

// ─── REGISTRO ───────────────────────────────────────
async function registrarUsuario() {
  const nombre = document.getElementById('nombre').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const mensaje = document.getElementById('mensaje');

  try {
    const res = await fetch(`${API_URL}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      mensaje.innerHTML = `<p class="mensaje-error">${data.mensaje}</p>`;
      return;
    }

    mensaje.innerHTML = `<p class="mensaje-exito">Registro exitoso. Redirigiendo a inicio de sesion...</p>`;
    setTimeout(() => window.location.href = 'login.html', 1000);

  } catch (error) {
    mensaje.innerHTML = `<p class="mensaje-error">Error de conexion con el servidor</p>`;
  }
}

// ─── CARRITO ────────────────────────────────────────
function mostrarCarrito() {
  const contenedor = document.getElementById('carrito-items');
  if (!contenedor) return;

  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const divVacio = document.getElementById('carrito-vacio');
  const divTotal = document.getElementById('carrito-total');

  if (carrito.length === 0) {
    divVacio.style.display = 'block';
    divTotal.style.display = 'none';
    contenedor.innerHTML = '';
    return;
  }

  divVacio.style.display = 'none';
  divTotal.style.display = 'block';

  contenedor.innerHTML = '';
  let total = 0;

  carrito.forEach((item, index) => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;

    const div = document.createElement('div');
    div.className = 'carrito-item';
    div.innerHTML = `
      <div>
        <strong>${item.nombre}</strong><br>
        Talla: ${item.talla} | Color: ${item.color}<br>
        Cantidad: ${item.cantidad} x $${item.precio.toLocaleString()} = $${subtotal.toLocaleString()}
      </div>
      <button class="btn-eliminar" onclick="eliminarDelCarrito(${index})">Eliminar</button>
    `;
    contenedor.appendChild(div);
  });

  document.getElementById('total-monto').textContent = total.toLocaleString();
}

function eliminarDelCarrito(index) {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  carrito.splice(index, 1);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  mostrarCarrito();
  actualizarContadorCarrito();
}

async function confirmarCompra() {
  const token = localStorage.getItem('token');

  if (!token) {
    alert('Debes iniciar sesion para completar la compra');
    window.location.href = 'login.html';
    return;
  }

  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

  if (carrito.length === 0) {
    alert('El carrito esta vacio');
    return;
  }

  const productos = carrito.map(item => ({
    producto: item.producto,
    cantidad: item.cantidad,
    talla: item.talla,
    color: item.color
  }));

  try {
    const res = await fetch(`${API_URL}/pedidos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productos })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(`Error: ${data.mensaje}`);
      return;
    }

    alert('¡Compra realizada con exito!');
    localStorage.removeItem('carrito');
    window.location.href = 'index.html';

  } catch (error) {
    alert('Error de conexion con el servidor');
  }
}

// Actualizar el evento DOMContentLoaded existente
document.addEventListener('DOMContentLoaded', () => {
  mostrarCarrito();
});