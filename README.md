# Tienda de Ropa Online

Proyecto desarrollado para la materia de **Ingenieria de Software**.

**Autor:** Miguel Rodriguez

## Descripcion

Aplicacion web full-stack para una tienda de ropa, que permite a los clientes ver un catalogo de productos, registrarse, iniciar sesion, agregar productos al carrito y realizar compras. El sistema descuenta automaticamente el stock disponible al confirmar una compra. Incluye un panel de administracion para gestionar el catalogo de productos.

## Funcionalidades

- Catalogo de productos con imagenes, precios, tallas, colores y stock
- Registro e inicio de sesion de usuarios con autenticacion JWT
- Carrito de compras
- Sistema de pedidos con descuento automatico de inventario
- Panel de administracion para agregar y eliminar productos

## Tecnologias utilizadas

**Backend:**
- Node.js
- Express
- MongoDB (Atlas) con Mongoose
- JSON Web Tokens (JWT) para autenticacion
- bcryptjs para encriptacion de contraseñas

**Frontend:**
- HTML5
- CSS3
- JavaScript (vanilla)

## Estructura del proyecto
tienda-ropa-online/

├── backend/

│   ├── models/

│   │   ├── Producto.js

│   │   ├── Usuario.js

│   │   └── Pedido.js

│   ├── routes/

│   │   ├── productos.js

│   │   ├── auth.js

│   │   └── pedidos.js

│   ├── middleware/

│   │   └── auth.js

│   ├── server.js

│   └── package.json

├── frontend/

│   ├── index.html

│   ├── login.html

│   ├── registro.html

│   ├── carrito.html

│   ├── admin.html

│   ├── style.css

│   └── app.js

└── README.md
## Instalacion y ejecucion

### Requisitos previos

- [Node.js](https://nodejs.org) instalado (version 18 o superior)
- Una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (gratuita)

### Pasos

1. Clonar el repositorio:
```bash
git clone https://github.com/marodriguezac-prog/tienda-ropa-online.git
cd tienda-ropa-online
```

2. Instalar las dependencias del backend:
```bash
cd backend
npm install
```

3. Crear un archivo `.env` dentro de la carpeta `backend` con el siguiente contenido:
MONGO_URI=tu_cadena_de_conexion_de_mongodb_atlas

PORT=3000

JWT_SECRET=una_clave_secreta_segura

4. Iniciar el servidor backend:
```bash
node server.js
```

Si todo esta correcto, se debera ver en la consola:
Servidor corriendo en puerto 3000

Conectado a MongoDB
5. Iniciar el frontend:

Abrir el archivo `frontend/index.html` directamente en el navegador (doble clic desde el explorador de archivos).

> **Importante:** el servidor backend debe estar corriendo (paso 4) para que el frontend pueda cargar el catalogo, iniciar sesion, agregar al carrito y realizar compras.

## Uso

- **index.html**: catalogo principal de productos
- **registro.html** / **login.html**: crear cuenta e iniciar sesion
- **carrito.html**: ver el carrito y confirmar compra
- **admin.html**: agregar y eliminar productos del catalogo

## Endpoints principales de la API

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | /api/productos | Obtener catalogo de productos |
| POST | /api/productos | Crear un nuevo producto |
| DELETE | /api/productos/:id | Eliminar un producto |
| POST | /api/auth/registro | Registrar nuevo usuario |
| POST | /api/auth/login | Iniciar sesion |
| POST | /api/pedidos | Crear un pedido (requiere autenticacion) |
| GET | /api/pedidos/mis-pedidos | Ver pedidos del usuario autenticado |

## Capturas de pantalla

> _Agregar aqui capturas del catalogo, carrito, login y panel de administracion._
