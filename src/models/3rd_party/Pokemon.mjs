import mongoose from "mongoose";

// Esto no significa casi nada de momento, pero aqui va a ir lo de los pokemones de 3rd party API

const pokemonSchema = new mongoose.Schema(
  {
    pokeId: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sprite: {
      type: String,
      default: "",
    },
    types: [
      {
        type: String,
        trim: true,
      },
    ],
    height: {
      type: Number,
      default: 0,
    },
    weight: {
      type: Number,
      default: 0,
    },
    abilities: [
      {
        name: String,
        isHidden: Boolean,
      },
    ],
    stats: [
      {
        name: String,
        baseStat: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Índice para mejorar las consultas
pokemonSchema.index({ name: 1 });

const Pokemon = mongoose.model("Pokemon", pokemonSchema);

export default Pokemon;
