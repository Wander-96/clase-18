import ENVIRONMENT from "./config/environment.config.js";
import connectMongoDB from "./config/mongodb.config.js";
import User from "./models/user.model.js";
import { sumar } from "./math.js";
import userRepository from "./repositories/user.repository.js";

// console.log(ENVIRONMENT.MONGO_DB_CONNECTION_STRING)


connectMongoDB()


// userRepository.create ('Lake', 'lake@gmail.com', 'lake.123')


// userRepository.create ('Pepe', 'pepe@gmail.com', 'pepe.123')


// userRepository.create ('Juan', 'juan@gmail.com', 'juan.123')

// userRepository.getById('69eaafc77c3bd94e80f7afd3')
// .then(
//     (resultado) => {
//         console.log (resultado)
//     }
// )

// 1. Nos conectamos a la base de datos primero (¡con await!)
await connectMongoDB();

try {
    // 2. Buscamos el ID real de MongoDB. 
    // MongoDB usa un "ObjectId" (un string alfanumérico largo), no números simples como 1 o 2.
    // Tienes que copiar un ID real de tu base de datos (ej: '65f1a2b3c4d5e6f7a8b9c0d1')
    const idParaBorrar = '69eaafc77c3bd94e80f7afd3';

    console.log(`Intentando borrar el usuario: ${idParaBorrar}...`);
    
    // 3. Ejecutamos el método del repositorio
    await userRepository.deleteById(idParaBorrar);
    
    console.log("¡Usuario eliminado exitosamente de la base de datos!");
    
} catch (error) {
    console.error("Error al intentar borrar el usuario:", error.message);
}