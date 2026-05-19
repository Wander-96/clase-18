# Resumen de Clase 18: Autenticación Avanzada y Verificación de Email

Este documento resume los conceptos y el paso a paso implementado en la Clase 18 para crear un flujo de autenticación robusto y profesional utilizando Node.js, Express, Mongoose, JWT y Nodemailer.

---

## 1. Conceptos Clave

*   **JWT (JSON Web Token):** Un estándar para crear tokens que permiten el intercambio seguro de información entre cliente y servidor. Lo usamos tanto para la verificación de correos electrónicos mediante links temporales, como para el token de sesión (Access Token) en el inicio de sesión.
*   **Bcrypt:** Librería esencial para el hashing (encriptación irreversible) de contraseñas antes de guardarlas en la base de datos.
*   **Nodemailer:** Módulo para enviar correos electrónicos directamente desde el servidor backend (útil para links de verificación, recuperación de contraseñas, etc.).
*   **Arquitectura en Capas:** Separación de responsabilidades mediante la creación de un `Repository` para interactuar con la Base de Datos, y un `Controller` para manejar la lógica de negocio y las peticiones HTTP.

---

## 2. Configuración Inicial y Variables de Entorno (`.env`)

Es crucial no quemar (hardcodear) información sensible en el código. Para ello, configuramos nuestras variables en el archivo `.env`:

```env
MONGO_DB_CONNECTION_STRING=mongodb+srv://...
MONGO_DB_NAME=Testuser
PORT=3000
URL_BACKEND=http://localhost:3000
GMAIL_USERNAME=tu_correo@gmail.com
GMAIL_PASSWORD=tu_contraseña_de_aplicacion_google
JWT_SECRET=tu_secreto_super_seguro
```

> [!IMPORTANT]
> Recuerda que `GMAIL_PASSWORD` no es la contraseña normal de tu correo, sino una "Contraseña de Aplicación" generada desde la seguridad de tu cuenta de Google.

---

## 3. Modelo de Usuario (`user.model.js`)

Se preparó el modelo de Mongoose para soportar la autenticación, agregando el campo `email_verificado` para controlar el estado de la cuenta.

```javascript
import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    email_verificado: { type: Boolean, default: false, required: true },
    fecha_creacion: { type: Date, required: true, default: Date.now },
    activo: { type: Boolean, required: true, default: true }
})

const User = mongoose.model("user", userSchema)
export default User
```

---

## 4. Capa de Repositorio (`user.repository.js`)

Creamos el intermediario entre la lógica de negocio y la base de datos para buscar y actualizar al usuario, logrando un código más escalable.

```javascript
import User from "../models/user.model.js";

class UserRepository {
    async create(nombre, email, password) {
        return await User.create({ nombre, email, password })
    }

    async getByEmail(email) {
        return await User.findOne({ email: email, activo: true })
    }

    async updateById(user_id, update_data) {
        await User.findByIdAndUpdate(user_id, update_data)
    }
}
export default new UserRepository()
```

---

## 5. Controladores de Autenticación (`auth.controller.js`)

Aquí reside toda la lógica fuerte de la clase. Se dividió en tres grandes endpoints:

### A. Registro (`POST /api/auth/register`)
1.  **Validación de campos:** Nombre, formato de correo y longitud de contraseña.
2.  **Verificación de existencia:** Comprueba si el email ya existe en la DB.
3.  **Hashing de contraseña:** Usa `bcrypt.hash(password, 12)`.
4.  **Generación del Token de Verificación:** Crea un token JWT que encapsula el email del usuario recién creado.
5.  **Envío de Correo:** Nodemailer envía un mail al usuario con un link de la forma `URL_BACKEND/api/auth/verify-email?verification_token=...`

### B. Verificación de Email (`GET /api/auth/verify-email`)
1.  **Recibe el token:** Lo extrae de la query string (`req.query`).
2.  **Verifica y Decodifica:** `jwt.verify` desencripta el token. Si es inválido (fue modificado o caducó), el bloque `catch` captura el error específico devolviendo un `401 Unauthorized`.
3.  **Actualización:** Si es exitoso, cambia `email_verificado: true` a través del repositorio.

### C. Inicio de Sesión (`POST /api/auth/login`)
El flujo profesional propuesto se estructura de la siguiente manera:
1.  **Validaciones Tempranas (Regex):** Asegura el formato correcto del correo recibido para no saturar la base de datos con peticiones inútiles.
2.  **Validación de Existencia y Verificación:** Se comprueba que el usuario exista y que el `email_verificado` sea `true`. En caso contrario, se deniega el acceso (`404` o `401`).
3.  **Cotejo de Contraseña:** Se utiliza `bcrypt.compare` para cruzar la contraseña plana con el hash de la base de datos.
4.  **Firma del Access Token:** Se construye un objeto `profile_info` (`nombre`, `email`, `id`, `fecha_creacion`) y se envía a `jwt.sign` para crear la sesión.
5.  **Respuesta Limpia:** Se devuelve al cliente únicamente el `access_token` generado para que el Frontend lo almacene y manipule.

---

## 6. Integración de Rutas (`auth.routers.js`)

Finalmente, conectamos los métodos del controlador con sus rutas correspondientes en Express.

```javascript
import express from 'express'
import authController from '../controllers/auth.controller.js'

const authRouter = express.Router()

authRouter.post('/register', authController.register)
authRouter.get('/verify-email', authController.verifyEmail)
authRouter.post('/login', authController.login)

export default authRouter
```

---

## 💡 Resumen del Flujo Completo

1. El usuario hace **POST** a `/register`.
2. El servidor guarda la cuenta (con `email_verificado` en `false`) y envía un email con un **Token JWT**.
3. El usuario abre su correo, hace click en el enlace enviando un **GET** a `/verify-email`.
4. El servidor procesa el token, valida el correo y actualiza `email_verificado` a `true`.
5. El usuario envía sus credenciales mediante un **POST** a `/login`.
6. El servidor valida las credenciales y devuelve un **Access Token JWT** que el usuario usará para realizar acciones dentro de la plataforma.
