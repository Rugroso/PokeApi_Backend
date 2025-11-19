import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
      // Lista de favoritos del usuario (personajes de Marvel)
      favorites: [
        {
          marvelId: {
            type: Number,
            required: true,
          },
          name: {
            type: String,
            required: true,
            trim: true,
          },
          thumbnail: {
            type: String,
            default: "",
          },
          addedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
  },
  {
    timestamps: true,
  }
);

// Índices para mejorar las consultas
// Los índices se crean a través de las propiedades (unique: true). Evitamos
// declarar índices duplicados para no recibir advertencias de Mongoose.

const User = mongoose.model("User", userSchema);

export default User;
