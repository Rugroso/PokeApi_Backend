import mongoose from "mongoose";

const characterSchema = new mongoose.Schema({
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
characterSchema.index({ name: 1 });

const Character = mongoose.model("Character", characterSchema);

export default Character;