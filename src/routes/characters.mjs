import express from "express";
import Character from "../models/Character.mjs";

const router = express.Router();

// GET /api/characters - Obtener todos los personajes
router.get("/characters", async (req, res) => {
  try {
    const characters = await Character.find().select();
    res.json(characters);
  } catch (error) {
    console.error("Error al obtener personajes:", error);
    res.status(500).json({
      message: "Error interno del servidor"
    });
  }
});

// GET /api/characters/:id - Obtener un personaje específico
router.get("/characters/:id", async (req, res) => {
  try {
    const character = await Character.findById(req.params.id).select();
    
    if (!character) {
      return res.status(404).json({
        message: "Personaje no encontrado"
      });
    }

    res.json(character);
  } catch (error) {
    console.error("Error al obtener personaje:", error);
    res.status(500).json({
      message: "Error interno del servidor"
    });
  }
});

export default router;