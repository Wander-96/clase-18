import mongoose from "mongoose"

/*
Defiinir el esquema que tendra un usuario dentro de nuestra aplicacion
*/

const userSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
            
        },
        password: {
            type: String,
            required: true
        },
        fecha_creacion: {
            type: Date,
            required: true,
            default: Date.now
        },

        activo: {
            type: Boolean,
            required: true,
            default: true

        },

    }
)

const USER_COLLECTION_NAME = "user"
const User = mongoose.model(USER_COLLECTION_NAME, userSchema)

export default User