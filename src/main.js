import ENVIRONMENT from "./config/environment.config.js";
import connectMongoDB from "./config/mongodb.config.js";

// --- IMPORTACIONES COMENTADAS (No necesarias ahora) ---
// import User from "./models/user.model.js";
// import { sumar } from "./math.js";
// import userRepository from "./repositories/user.repository.js";

// --- NUEVA IMPORTACIÓN ---
import workspaceRepository from "./repositories/workspace.repository.js";

const testApp = async () => {
    try {
        // 1. Conexión a la base de datos (Obligatorio antes de cualquier consulta)
        await connectMongoDB();
        console.log("Conexión exitosa a MongoDB.\n");

        /* =================================================================
           CÓDIGO ANTERIOR DE USUARIOS (COMENTADO)
           ================================================================= */
        // await userRepository.create ('Lake', 'lake@gmail.com', 'lake.123')
        // await userRepository.create ('Pepe', 'pepe@gmail.com', 'pepe.123')
        // await userRepository.create ('Juan', 'juan@gmail.com', 'juan.123')
        //
        // const idParaBorrar = '69eaafc77c3bd94e80f7afd3';
        // console.log(`Intentando borrar el usuario: ${idParaBorrar}...`);
        // await userRepository.deleteById(idParaBorrar);
        // console.log("¡Usuario eliminado exitosamente de la base de datos!");


        /* =================================================================
           NUEVO CÓDIGO DE PRUEBAS PARA WORKSPACE
           ================================================================= */
        console.log("=== INICIANDO PRUEBAS DE WORKSPACE ===");

        // CREATE
        console.log("--- 1. Probando create() ---");
        const nuevoWorkspace = await workspaceRepository.create(
            "Proyecto Alpha",
            "Workspace para el equipo de desarrollo"
        );
        console.log("Resultado:", nuevoWorkspace);

        // GET ALL (Antes del borrado)
        console.log("\n--- 2. Probando getAll() ---");
        let listaActivos = await workspaceRepository.getAll();
        console.log(`Workspaces activos encontrados: ${listaActivos.length}`);

        // UPDATE
        console.log("\n--- 3. Probando updateById() ---");
        const workspaceActualizado = await workspaceRepository.updateById(
            nuevoWorkspace._id,
            { descripcion: "Descripción actualizada por Mongoose" }
        );
        console.log("Resultado de la actualización:", workspaceActualizado);

        // DELETE (Soft Delete)
        console.log("\n--- 4. Probando deleteById() (Soft Delete) ---");
        const workspaceBorrado = await workspaceRepository.deleteById(nuevoWorkspace._id);
        console.log("Estado actual del documento (debería ser false):", workspaceBorrado.estado);

        // GET ALL (Después del borrado lógico)
        console.log("\n--- 5. Verificando getAll() tras el borrado ---");
        listaActivos = await workspaceRepository.getAll();
        console.log(`Workspaces activos encontrados ahora: ${listaActivos.length}`);

    } catch (error) {
        // Captura y muestra cualquier error que ocurra en el bloque try
        console.error("Error crítico durante la ejecución:", error.message);
    } finally {
        // Cierra el proceso de Node.js al terminar, sin importar si hubo error o no
        process.exit(0);
    }
};

// Ejecutar la función principal
testApp();