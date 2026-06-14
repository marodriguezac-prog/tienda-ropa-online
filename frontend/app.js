const API_URL = 'https://tienda-ropa-online.onrender.com/api'; 

let todosLosProductos = []; // guarda el catalogo completo para filtrar

// Cargar catalogo
async function cargarCatalogo() {
  const contenedor = document.getElementById('catalogo');
  if (!contenedor) return;

  try {
    const res = await fetch(`${API_URL}/productos`);
    const productos = await res.json();

    todosLosProductos = productos;
    renderizarCatalogo(productos);

  } catch (error) {
    contenedor.innerHTML = '<p>Error al cargar el catalogo. Verifica que el servidor este corriendo.</p>';
    console.error(error);
  }
}

// Dibuja las tarjetas de productos
function renderizarCatalogo(productos) {
  const contenedor = document.getElementById('catalogo');
  contenedor.innerHTML = '';

  if (productos.length === 0) {
    contenedor.innerHTML = '<p>No se encontraron productos.</p>';
    return;
  }

  const STOCK_MINIMO = 5; // umbral para alerta de stock bajo

  productos.forEach(producto => {
    const card = document.createElement('div');
    card.className = 'producto-card';

    const tallasOptions = producto.tallas.map(t => `<option value="${t}">${t}</option>`).join('');
    const coloresOptions = producto.colores.map(c => `<option value="${c}">${c}</option>`).join('');

    const stockBajo = producto.stock <= STOCK_MINIMO;
    const claseStock = stockBajo ? 'stock-bajo' : '';
    const badgeStock = stockBajo ? `<span class="badge-stock-bajo">Stock bajo</span>` : '';

    card.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}">
      <div class="info">
        <h3>${producto.nombre}</h3>
        <p>${producto.descripcion || ''}</p>
        <div class="precio">$${producto.precio.toLocaleString()}</div>
        <div class="stock ${claseStock}">Stock disponible: ${producto.stock} ${badgeStock}</div>
        <select class="select-talla">${tallasOptions}</select>
        <select class="select-color">${coloresOptions}</select>
        <button onclick="agregarAlCarrito('${producto._id}', '${producto.nombre}', ${producto.precio}, this)">
          Agregar al carrito
        </button>
      </div>
    `;

    contenedor.appendChild(card);
  });
}

// Filtra el catalogo segun lo escrito en el buscador
function filtrarCatalogo() {
  const texto = document.getElementById('buscador').value.toLowerCase().trim();

  if (!texto) {
    renderizarCatalogo(todosLosProductos);
    return;
  }

  const filtrados = todosLosProductos.filter(p => {
    const nombreCoincide = p.nombre.toLowerCase().includes(texto);
    const tallaCoincide = (p.tallas || []).some(t => t.toLowerCase().includes(texto));
    const colorCoincide = (p.colores || []).some(c => c.toLowerCase().includes(texto));
    return nombreCoincide || tallaCoincide || colorCoincide;
  });

  renderizarCatalogo(filtrados);
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
  function irAPago() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Debes iniciar sesion para continuar');
    window.location.href = 'login.html';
    return;
  }
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  if (carrito.length === 0) {
    alert('El carrito esta vacio');
    return;
  }
  window.location.href = 'pago.html';
} 
  document.addEventListener('DOMContentLoaded', () => {
  cargarCatalogo();
  actualizarContadorCarrito();
  actualizarMenuUsuario();

  const buscador = document.getElementById('buscador');
  if (buscador) {
    buscador.addEventListener('input', filtrarCatalogo);
  }
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

    const facturaData = {
      items: carrito,
      total: data.total,
      fecha: data.createdAt,
      pedidoId: data._id
    };
    localStorage.setItem('ultimaFactura', JSON.stringify(facturaData));

    localStorage.removeItem('carrito');
    window.location.href = 'factura.html';

  } catch (error) {
    alert('Error de conexion con el servidor');
  }
} 
// Actualizar el evento DOMContentLoaded existente
document.addEventListener('DOMContentLoaded', () => {
  mostrarCarrito();
});// ─── ADMIN: Agregar producto ──────────────────────────
async function agregarProducto() {
  const mensaje = document.getElementById('mensaje');

  const nombre = document.getElementById('nombre').value;
  const descripcion = document.getElementById('descripcion').value;
  const precio = Number(document.getElementById('precio').value);
  const categoria = document.getElementById('categoria').value;
  const tallas = document.getElementById('tallas').value.split(',').map(t => t.trim()).filter(Boolean);
  const colores = document.getElementById('colores').value.split(',').map(c => c.trim()).filter(Boolean);
  const stock = Number(document.getElementById('stock').value);
  const imagen = document.getElementById('imagen').value;

  if (!nombre || !precio || stock === undefined) {
    mensaje.innerHTML = `<p class="mensaje-error">Nombre, precio y stock son obligatorios</p>`;
    return;
  }

  try {
    const res = await fetch(`${API_URL}/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, descripcion, precio, categoria, tallas, colores, stock, imagen })
    });

    const data = await res.json();

    if (!res.ok) {
      mensaje.innerHTML = `<p class="mensaje-error">${data.mensaje}</p>`;
      return;
    }

    mensaje.innerHTML = `<p class="mensaje-exito">Producto agregado exitosamente</p>`;

    // Limpiar formulario
    document.getElementById('nombre').value = '';
    document.getElementById('descripcion').value = '';
    document.getElementById('precio').value = '';
    document.getElementById('categoria').value = '';
    document.getElementById('tallas').value = '';
    document.getElementById('colores').value = '';
    document.getElementById('stock').value = '';
    document.getElementById('imagen').value = '';

    cargarListaAdmin();

  } catch (error) {
    mensaje.innerHTML = `<p class="mensaje-error">Error de conexion con el servidor</p>`;
  }
}

// ─── ADMIN: Listar y eliminar productos ──────────────
async function cargarListaAdmin() {
  const contenedor = document.getElementById('lista-admin');
  if (!contenedor) return;

  try {
    const res = await fetch(`${API_URL}/productos`);
    const productos = await res.json();

    contenedor.innerHTML = '';

    productos.forEach(producto => {
      const div = document.createElement('div');
      div.className = 'carrito-item';
      div.innerHTML = `
        <div>
          <strong>${producto.nombre}</strong> - $${producto.precio.toLocaleString()} - Stock: ${producto.stock}
        </div>
        <button class="btn-eliminar" onclick="eliminarProducto('${producto._id}')">Eliminar</button>
      `;
      contenedor.appendChild(div);
    });

  } catch (error) {
    contenedor.innerHTML = '<p>Error al cargar productos</p>';
  }
}

async function eliminarProducto(id) {
  if (!confirm('Seguro que deseas eliminar este producto?')) return;

  try {
    await fetch(`${API_URL}/productos/${id}`, { method: 'DELETE' });
    cargarListaAdmin();
  } catch (error) {
    alert('Error al eliminar el producto');
  }
}

// Cargar lista admin al iniciar (si existe el contenedor)
document.addEventListener('DOMContentLoaded', () => {
  cargarListaAdmin();
}); // ─── FACTURA ────────────────────────────────────────
function cargarFactura() {
  const datos = JSON.parse(localStorage.getItem('ultimaFactura'));
  const contenedorDatos = document.getElementById('factura-datos');
  const contenedorItems = document.getElementById('factura-items');
  const contenedorTotal = document.getElementById('factura-total');

  if (!datos) {
    contenedorDatos.innerHTML = '<p>No hay informacion de factura disponible.</p>';
    return;
  }

  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const fecha = new Date(datos.fecha).toLocaleString();

  contenedorDatos.innerHTML = `
    <p><strong>Numero de pedido:</strong> ${datos.pedidoId}</p>
    <p><strong>Cliente:</strong> ${usuario ? usuario.nombre : 'N/A'}</p>
    <p><strong>Fecha:</strong> ${fecha}</p>
  `;

  contenedorItems.innerHTML = '';
  datos.items.forEach(item => {
    const subtotal = item.precio * item.cantidad;
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${item.nombre}</td>
      <td>${item.talla}</td>
      <td>${item.color}</td>
      <td>${item.cantidad}</td>
      <td>$${item.precio.toLocaleString()}</td>
      <td>$${subtotal.toLocaleString()}</td>
    `;
    contenedorItems.appendChild(fila);
  });

  contenedorTotal.textContent = `Total: $${datos.total.toLocaleString()}`;
}  // ─── REPORTES ───────────────────────────────────────
async function generarReporte() {
  const resumen = document.getElementById('resumen-reporte');
  const tbody = document.getElementById('productos-vendidos-body');
  const historialBody = document.getElementById('historial-body');
  if (!resumen) return;

  const desde = document.getElementById('fecha-desde').value;
  const hasta = document.getElementById('fecha-hasta').value;

  let url = `${API_URL}/reportes/ventas`;
  const params = [];
  if (desde) params.push(`desde=${desde}`);
  if (hasta) params.push(`hasta=${hasta}`);
  if (params.length > 0) url += `?${params.join('&')}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    // Resumen
    resumen.innerHTML = `
      <div class="resumen-card">
        <h4>Total Recaudado</h4>
        <div class="valor">$${data.totalRecaudado.toLocaleString()}</div>
      </div>
      <div class="resumen-card">
        <h4>Numero de Ventas</h4>
        <div class="valor">${data.numeroVentas}</div>
      </div>
    `;

    // Productos mas vendidos
    tbody.innerHTML = '';
    if (data.productosMasVendidos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3">No hay ventas en este periodo.</td></tr>';
    } else {
      data.productosMasVendidos.forEach(p => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
          <td>${p.nombre}</td>
          <td>${p.cantidad}</td>
          <td>$${p.totalVendido.toLocaleString()}</td>
        `;
        tbody.appendChild(fila);
      });
    }

    // Historial de ventas
    historialBody.innerHTML = '';
    if (data.pedidos.length === 0) {
      historialBody.innerHTML = '<tr><td colspan="6">No hay ventas en este periodo.</td></tr>';
    } else {
      data.pedidos.forEach(pedido => {
        const fecha = new Date(pedido.createdAt).toLocaleString();
        const cliente = pedido.usuario && pedido.usuario.nombre ? pedido.usuario.nombre : 'Cliente no disponible';
        const email = pedido.usuario && pedido.usuario.email ? pedido.usuario.email : 'N/A';
        const productos = pedido.productos
          .map(item => `${item.producto ? item.producto.nombre : 'N/A'} x${item.cantidad}`)
          .join(', ');

        const fila = document.createElement('tr');
        fila.innerHTML = `
          <td>${fecha}</td>
          <td>${cliente}</td>
          <td>${email}</td>
          <td>${productos}</td>
          <td>$${pedido.total.toLocaleString()}</td>
          <td>${pedido.estado}</td>
        `;
        historialBody.appendChild(fila);
      });
    }

  } catch (error) {
    resumen.innerHTML = '<p>Error al cargar el reporte.</p>';
    console.error(error);
  }
}  // ─── SUPER ADMIN ─────────────────────────────────────

function mostrarSeccion(id, btn) {
  document.querySelectorAll('.seccion').forEach(s => s.classList.remove('activa'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('activo'));
  document.getElementById(`seccion-${id}`).classList.add('activa');
  btn.classList.add('activo');
}

// Cargar historial de pedidos con cambio de estado
async function cargarPedidosAdmin() {
  const tbody = document.getElementById('historial-pedidos');
  if (!tbody) return;

  try {
    const res = await fetch(`${API_URL}/reportes/ventas`);
    const data = await res.json();

    tbody.innerHTML = '';

    if (data.pedidos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6">No hay pedidos aun.</td></tr>';
      return;
    }

    data.pedidos.forEach(pedido => {
      const fecha = new Date(pedido.createdAt).toLocaleString();
      const cliente = pedido.usuario && pedido.usuario.nombre ? pedido.usuario.nombre : 'N/A';
      const productos = pedido.productos
        .map(item => `${item.producto ? item.producto.nombre : 'N/A'} x${item.cantidad}`)
        .join(', ');

      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${fecha}</td>
        <td>${cliente}</td>
        <td>${productos}</td>
        <td>$${pedido.total.toLocaleString()}</td>
        <td>
          <span class="badge-estado badge-${pedido.estado}">${pedido.estado}</span>
        </td>
        <td>
          <select class="estado-select" onchange="cambiarEstadoPedido('${pedido._id}', this.value, this)">
            <option value="pendiente" ${pedido.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
            <option value="pagado" ${pedido.estado === 'pagado' ? 'selected' : ''}>Pagado</option>
            <option value="enviado" ${pedido.estado === 'enviado' ? 'selected' : ''}>Enviado</option>
            <option value="entregado" ${pedido.estado === 'entregado' ? 'selected' : ''}>Entregado</option>
            <option value="cancelado" ${pedido.estado === 'cancelado' ? 'selected' : ''}>Cancelado</option>
          </select>
        </td>
      `;
      tbody.appendChild(fila);
    });

  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="6">Error al cargar pedidos.</td></tr>';
  }
}

async function cambiarEstadoPedido(id, nuevoEstado, select) {
  try {
    const res = await fetch(`${API_URL}/superadmin/pedidos/${id}/estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado })
    });

    if (!res.ok) {
      alert('Error al cambiar el estado');
      return;
    }

    // Actualizar el badge de estado visualmente
    const badge = select.closest('tr').querySelector('.badge-estado');
    badge.className = `badge-estado badge-${nuevoEstado}`;
    badge.textContent = nuevoEstado;

    alert(`Estado actualizado a: ${nuevoEstado}`);

  } catch (error) {
    alert('Error de conexion');
  }
}

// Cargar lista de usuarios
async function cargarUsuarios() {
  const tbody = document.getElementById('lista-usuarios');
  if (!tbody) return;

  try {
    const res = await fetch(`${API_URL}/superadmin/usuarios`);
    const usuarios = await res.json();

    tbody.innerHTML = '';

    if (usuarios.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4">No hay usuarios registrados.</td></tr>';
      return;
    }

    usuarios.forEach(usuario => {
      const fecha = new Date(usuario.createdAt).toLocaleDateString();
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${usuario.nombre}</td>
        <td>${usuario.email}</td>
        <td><span class="badge-estado badge-${usuario.rol === 'admin' ? 'pagado' : 'pendiente'}">${usuario.rol}</span></td>
        <td>${fecha}</td>
      `;
      tbody.appendChild(fila);
    });

  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="4">Error al cargar usuarios.</td></tr>';
  }
}   // ─── PAGO ───────────────────────────────────────────
let metodoPagoSeleccionado = null;

function cargarResumenPago() {
  const contenedor = document.getElementById('resumen-items');
  const totalEl = document.getElementById('total-pago');
  const valorContra = document.getElementById('valor-contraentrega');
  if (!contenedor) return;

  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

  if (carrito.length === 0) {
    window.location.href = 'carrito.html';
    return;
  }

  let total = 0;
  contenedor.innerHTML = '';

  carrito.forEach(item => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
      <span>${item.nombre} (${item.talla} / ${item.color}) x${item.cantidad}</span>
      <span>$${subtotal.toLocaleString()}</span>
    `;
    contenedor.appendChild(div);
  });

  if (totalEl) totalEl.textContent = `$${total.toLocaleString()}`;
  if (valorContra) valorContra.textContent = `$${total.toLocaleString()}`;
}

function seleccionarMetodo(metodo, card) {
  document.querySelectorAll('.metodo-card').forEach(c => c.classList.remove('seleccionado'));
  card.classList.add('seleccionado');

  document.querySelectorAll('.info-pago').forEach(i => i.classList.remove('visible'));
  const infoDiv = document.getElementById(`info-${metodo}`);
  if (infoDiv) infoDiv.classList.add('visible');

  metodoPagoSeleccionado = metodo;

  const btnPagar = document.getElementById('btn-pagar');
  if (btnPagar) {
    btnPagar.disabled = false;
    btnPagar.textContent = `Pagar con ${metodo.charAt(0).toUpperCase() + metodo.slice(1)}`;
  }
}

async function procesarPago() {
  if (!metodoPagoSeleccionado) {
    alert('Por favor selecciona un metodo de pago');
    return;
  }

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

  const btnPagar = document.getElementById('btn-pagar');
  btnPagar.disabled = true;
  btnPagar.textContent = 'Procesando pago...';

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
      btnPagar.disabled = false;
      btnPagar.textContent = `Pagar con ${metodoPagoSeleccionado}`;
      return;
    }

    // Guardar datos de factura y confirmacion
    const facturaData = {
      items: carrito,
      total: data.total,
      fecha: data.createdAt,
      pedidoId: data._id,
      metodoPago: metodoPagoSeleccionado
    };
    localStorage.setItem('ultimaFactura', JSON.stringify(facturaData));
    localStorage.removeItem('carrito');

    window.location.href = 'confirmacion.html';

  } catch (error) {
    alert('Error de conexion con el servidor');
    btnPagar.disabled = false;
    btnPagar.textContent = `Pagar con ${metodoPagoSeleccionado}`;
  }
}

// ─── CONFIRMACION ────────────────────────────────────
function cargarConfirmacion() {
  const datos = JSON.parse(localStorage.getItem('ultimaFactura'));
  if (!datos) return;

  const metodoEl = document.getElementById('metodo-usado');
  const totalEl = document.getElementById('total-confirmacion');
  const pedidoEl = document.getElementById('pedido-id');

  if (metodoEl) metodoEl.textContent = datos.metodoPago || 'N/A';
  if (totalEl) totalEl.textContent = `$${datos.total ? datos.total.toLocaleString() : 0}`;
  if (pedidoEl) pedidoEl.textContent = datos.pedidoId || 'N/A';
}