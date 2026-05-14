import ENVIRONMENT from "../config/environment.config.js";
import mailer_transport from "../config/mailer.config.js";
import ServerError from "../helpers/serverError.helper.js";
import userRepository from "../repositories/user.repository.js";
import bcrypt from 'bcrypt'

class AuthController {
    async register(req, res) {
        try {
            const { name, email, password } = req.body;

            // Validaciones
            if (!name || name.length <= 2) {
                throw new ServerError("Nombre debe ser mayor a 2 caracteres", 400)
            }

            if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
                throw new ServerError("Email inválido", 400)
            }

            if (!password || password.length < 6) {
                throw new ServerError("Password debe tener al menos 6 caracteres", 400)
            }

            const existingUser = await userRepository.getByEmail(email);
            if (existingUser) {
                throw new ServerError("El email ya está registrado", 400)
            }

            const hashed_password = await bcrypt.hash(password, 12);

            const newUser = await userRepository.create(name, email, hashed_password);

            await mailer_transport.sendMail(
                {
                    to: email,
                    from: ENVIRONMENT.GMAIL_USERNAME,
                    subject: "Verifica tu mail",
                    html: `
                        <h1>Bienvenido a SLACK</h1>
                        <a href='${ENVIRONMENT.URL_BACKEND}/api/auth/verify-email?email=${email}'>Click aqui</a> para verificar tu cuenta
                    `
                }
            )

            return res.status(201).json({
                message: "Usuario registrado con éxito",
                ok: true,
                status: 201,
                data: {
                    user: {
                        id: newUser._id,
                        name: newUser.nombre,
                        email: newUser.email
                    }
                }
            });
        } catch (error) {
            if (error instanceof ServerError) {
                return res.status(error.status).json(
                    {
                        message: error.message,
                        ok: false,
                        status: error.status
                    }
                )
            }
            else {
                console.error('Error critico:', error);
                return res.status(500).json({
                    message: "Error interno del servidor",
                    ok: false,
                    status: 500
                });
            }

        }
    }

    async verifyEmail(req, res) {
        try {
            const { email } = req.query;

            // 1. Validar que llegó el email
            if (!email) {
                throw new ServerError("Falta proveer el email", 400);
            }

            // 2. Buscar al usuario por email
            const user = await userRepository.getByEmail(email);
            if (!user) {
                throw new ServerError("Usuario no encontrado", 404);
            }

            // 3. Validar que no esté verificado aún
            if (user.email_verificado === true) {
                throw new ServerError("El email ya fue verificado previamente", 400);
            }

            // 4. Actualizar el estado a verdadero en MongoDB
            await userRepository.updateById(user._id, { email_verificado: true });

            // 5. Responder exitosamente
            return res.status(200).json({
                message: "Email verificado exitosamente",
                ok: true,
                status: 200
            });

        } catch (error) {
            if (error instanceof ServerError) {
                return res.status(error.status).json({
                    message: error.message,
                    ok: false,
                    status: error.status
                });
            } else {
                console.error('Error critico en verifyEmail:', error);
                return res.status(500).json({
                    message: "Error interno del servidor",
                    ok: false,
                    status: 500
                });
            }
        }
    }
}

const authController = new AuthController();


export default authController


/* 

COMO VALIDAR UN MAIL?
El usuario se registra con un x mail
El sistema envia un mail con un link tipo 
    <a 
        href='${URL_BACKEND + '/api/auth/verify-email?email=${email}'}'
    >
        click aqui para verificar
    </a>
Cuando el usuario de click a ese link estara emitiendo un GET /api/auth/verify-email?email=pepe@gmail.com desde su navegador
Nosotros recibimos la consulta y cambiamos la propiedad email_verificado a true en la DB

CONSIGNA: 
Agregar la propiedad booleana 'email_verificado' sobre el usuario en el modelo de mongoose.

En el controller de register, luego de crear el usuario, enviar un mail con el link de verificacion.

Crear el endpoint
    /api/auth/verify-email 
        Recibe una querystring llamada email (req.query)
        Valida que el email exista
        Valida que no este verificado aun
        Cambia el verificado a verdadero
        Responde exitosamente
*/