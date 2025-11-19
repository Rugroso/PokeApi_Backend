import mongoose from "mongoose";

// Esto no significa casi nada de momento, pero aqui va a ir lo de los pokemones de 3rd party API

const pokemonschema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

// Índice para mejorar las consultas
pokemonschema.index({ name: 1 });

const Pokemon = mongoose.model("Pokemon", pokemonschema);

export default Pokemon;