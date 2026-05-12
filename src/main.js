import express, { Router } from 'express';
import ENVIRONMENT from "./config/environment.config.js";
import connectMongoDB from "./config/mongodb.config.js";
import { sumar } from "./math.js";
import User from "./models/user.model.js";

/* SOLO EN LOCAL Y SI TENER PROBLEMAS DE DNS PARA CONECTARTE A MONGODB */
import dns from 'dns';
import userRepository from "./repositories/user.repository.js";
import workspaceMemberRepository from "./repositories/workspaceMember.repository.js";
import workspaceRepository from "./repositories/workspace.repository.js";
import { MEMBER_WORKSPACE_ROLES } from "./constants/memberRoles.constant.js";


if (ENVIRONMENT.MODE === 'development') {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
}

connectMongoDB()
//userRepository.create('pepe', 'pepe@gmail.com', 'pepe123')

/* userRepository.updateById(
    '69eaa482681999efac4eb3bd', {
        nombre: 'juan'
    }
) */

/* userRepository.getById('69eaa482681999efac4eb3bd')
.then(
    (resultado) => {
        console.log(resultado)
    }
) */

/* workspaceMemberRepository.create(
    '69eaa482681999efac4eb3bd',
    '69f14d6b8dc2e2fa8a6fa1be',
    MEMBER_WORKSPACE_ROLES.ADMIN
) */

//workspaceMemberRepository.getById('69f14b53ffa2c5930ae6713c').then(resultado => console.log(resultado))
//workspaceMemberRepository.updateById('69f14b53ffa2c5930ae6713c', {rol: MEMBER_WORKSPACE_ROLES.OWNER})
//workspaceMemberRepository.deleteById('69f14b53ffa2c5930ae6713c')
/*     workspaceRepository.create(
        'Test 2',
        'Test'
    ) */


workspaceMemberRepository.getByWorkspaceId('69f14d6b8dc2e2fa8a6fa1be').then(result => {

    console.log(result)
    result
})
    .catch(error => {
        console.log("error", error)
    })


/*
Crear una API de express
Route:
/api/auth => Trabaja todo lo relacionado a autentificacion
POST /register
body: {name, email, password}
Validar que el usuario tenga nombre mayor a 2 caracteres
Validar email
Validar password con almenos 6 caracteres
Crear un usuario en la DB

Mas Adelante ...
POST /login

RECOMENDACION:
El controller puede ser asincrono !!
authRouter.post(
import express, { Router } from 'express';
import ENVIRONMENT from "./config/environment.config.js";
import connectMongoDB from "./config/mongodb.config.js";
import { sumar } from "./math.js";
import User from "./models/user.model.js";

/* SOLO EN LOCAL Y SI TENER PROBLEMAS DE DNS PARA CONECTARTE A MONGODB */
import dns from 'dns';
import userRepository from "./repositories/user.repository.js";
import workspaceMemberRepository from "./repositories/workspaceMember.repository.js";
import workspaceRepository from "./repositories/workspace.repository.js";
import { MEMBER_WORKSPACE_ROLES } from "./constants/memberRoles.constant.js";


if (ENVIRONMENT.MODE === 'development') {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
}

connectMongoDB()
//userRepository.create('pepe', 'pepe@gmail.com', 'pepe123')

/* userRepository.updateById(
    '69eaa482681999efac4eb3bd', {
        nombre: 'juan'
    }
) */

/* userRepository.getById('69eaa482681999efac4eb3bd')
.then(
    (resultado) => {
        console.log(resultado)
    }
) */

/* workspaceMemberRepository.create(
    '69eaa482681999efac4eb3bd',
    '69f14d6b8dc2e2fa8a6fa1be',
    MEMBER_WORKSPACE_ROLES.ADMIN
) */

//workspaceMemberRepository.getById('69f14b53ffa2c5930ae6713c').then(resultado => console.log(resultado))
//workspaceMemberRepository.updateById('69f14b53ffa2c5930ae6713c', {rol: MEMBER_WORKSPACE_ROLES.OWNER})
//workspaceMemberRepository.deleteById('69f14b53ffa2c5930ae6713c')
/*     workspaceRepository.create(
        'Test 2',
        'Test'
    ) */


workspaceMemberRepository.getByWorkspaceId('69f14d6b8dc2e2fa8a6fa1be').then(result => {

    console.log(result)
    result
})
    .catch(error => {
        console.log("error", error)
    })


/*
Crear una API de express
Route:
/api/auth => Trabaja todo lo relacionado a autentificacion
POST /register
body: {name, email, password}
Validar que el usuario tenga nombre mayor a 2 caracteres
Validar email
Validar password con almenos 6 caracteres
Crear un usuario en la DB

Mas Adelante ...
POST /login

RECOMENDACION:
El controller puede ser asincrono !!
authRouter.post(
'/register',
async (request, response) => {
await userRepository.create('pepe')
    }
)       
*/




const app = express();

app.use(express.json());

const authRouter = Router();

authRouter.post('/register', async (request, response) => {
    try {

        const { name, email, password } = request.body;
        if (!name || name.length <= 2) {
            return response.status(400).json({ error: 'El nombre debe tener más de 2 caracteres' });
        }
        if (!email || !email.includes('@')) {
            return response.status(400).json({ error: 'Debes enviar un email válido' });
        }
        if (!password || password.length < 6) {
            return response.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }
        const newUser = await userRepository.create(name, email, password);

        return response.status(201).json({
            message: 'Usuario registrado exitosamente',
            user: newUser
        });

    } catch (error) {
        console.error("Error al registrar:", error);
        return response.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.use('/api/auth', authRouter);
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor Express levantado y escuchando en el puerto ${PORT}`);
    console.log(`🌐 Puedes probar la ruta POST en: http://localhost:${PORT}/api/auth/register`);
});
