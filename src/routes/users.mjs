import express from "express";
import User from "../models/User.mjs";

const router = express.Router();

// Helper: construir URL para la API de Marvel
const buildMarvelUrl = (path, params = {}) => {
  // Lee la base desde .env; puede incluir o no "/characters"
  let base = (process.env.MARVEL_URL || "https://gateway.marvel.com/v1/public").toString();
  const ts = process.env.MARVEL_TS || "1";
  const apikey = process.env.MARVEL_APIKEY;
  const hash = process.env.MARVEL_HASH;

  // Normalizar: quitar slash(es) finales en base
  base = base.replace(/\/+$/, "");

  // Si la base ya contiene '/characters' y la ruta que le pasamos también comienza con '/characters',
  // eliminamos el duplicado para evitar URLs como .../characters/characters
  if (base.endsWith("/characters") && path.startsWith("/characters")) {
    path = path.replace(/^\/characters/, "");
  }

  // Asegurar que la ruta comience con '/'
  if (!path.startsWith("/")) path = `/${path}`;

  const url = new URL(base + path);
  url.searchParams.set("ts", ts);
  if (apikey) url.searchParams.set("apikey", apikey);
  if (hash) url.searchParams.set("hash", hash);

  // añadir params adicionales
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  });

  return url.toString();
};

// Helper: buscar personaje en Marvel por nombre o id
const fetchMarvelCharacter = async ({ id, name }) => {
  try {
    let url;
    if (id) {
      url = buildMarvelUrl(`/characters/${id}`);
    } else if (name) {
      url = buildMarvelUrl(`/characters`, { nameStartsWith: name, limit: 1 });
    } else {
      throw new Error("Se requiere id o name para buscar en Marvel");
    }

    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Marvel API error ${res.status}: ${text}`);
    }

    const data = await res.json();
    // la estructura: data.data.results[]
    if (data && data.data && Array.isArray(data.data.results) && data.data.results.length > 0) {
      return data.data.results[0];
    }

    return null;
  } catch (error) {
    throw error;
  }
};

// POST /api/users - Crear o actualizar usuario
router.post("/users", async (req, res) => {
  try {
    const { firebaseUid, email, displayName } = req.body;

    // Validaciones
    if (!firebaseUid || !email || !displayName) {
      return res.status(400).json({
        error: "Faltan campos requeridos: firebaseUid, email, displayName",
      });
    }

    // Buscar si el usuario ya existe
    let user = await User.findOne({ firebaseUid });

    if (user) {
      // Actualizar usuario existente
      user.email = email;
      user.displayName = displayName;
      await user.save();

      return res.status(200).json({
        message: "Usuario actualizado exitosamente",
        user,
      });
    }

    // Crear nuevo usuario
    user = new User({
      firebaseUid,
      email,
      displayName,
    });

    await user.save();

    res.status(201).json({
      message: "Usuario creado exitosamente",
      user,
    });
  } catch (error) {
    console.error("Error al guardar usuario:", error);

    // Error de duplicado
    if (error.code === 11000) {
      return res.status(409).json({
        error: "El email ya está registrado",
      });
    }

    res.status(500).json({
      error: "Error al guardar usuario en la base de datos",
      details: error.message,
    });
  }
});

// GET /api/users/:firebaseUid - Obtener usuario por Firebase UID
router.get("/users/:firebaseUid", async (req, res) => {
  try {
    const { firebaseUid } = req.params;

    const user = await User.findOne({ firebaseUid });

    if (!user) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({
      error: "Error al obtener usuario",
      details: error.message,
    });
  }
});

// GET /api/users/:firebaseUid/favorites - Listar favoritos del usuario
router.get("/users/:firebaseUid/favorites", async (req, res) => {
  try {
    const { firebaseUid } = req.params;

    const user = await User.findOne({ firebaseUid }).select("favorites");

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    res.status(200).json({ favorites: user.favorites });
  } catch (error) {
    console.error("Error al listar favoritos:", error);
    res.status(500).json({ error: "Error al listar favoritos", details: error.message });
  }
});

// POST /api/users/:firebaseUid/favorites - Agregar favorito por name o id
router.post("/users/:firebaseUid/favorites", async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    const { name, id } = req.body; // aceptar name o id

    if (!name && !id) {
      return res.status(400).json({ error: "Se requiere 'name' o 'id' en el body" });
    }

    const user = await User.findOne({ firebaseUid });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // Buscar en Marvel
    const character = await fetchMarvelCharacter({ id, name });
    if (!character) return res.status(404).json({ error: "Personaje no encontrado en Marvel" });

    const marvelId = character.id;
    const characterName = character.name;
    const thumbnail = character.thumbnail ? `${character.thumbnail.path}.${character.thumbnail.extension}` : "";

    // Verificar duplicados
    if (user.favorites.some((f) => f.marvelId === marvelId)) {
      return res.status(409).json({ error: "El personaje ya está en favoritos" });
    }

    user.favorites.push({ marvelId, name: characterName, thumbnail });
    await user.save();

    res.status(201).json({ message: "Favorito agregado", favorite: { marvelId, name: characterName, thumbnail } });
  } catch (error) {
    console.error("Error al agregar favorito:", error);
    res.status(500).json({ error: "Error al agregar favorito", details: error.message });
  }
});

/// DELETE /api/users/:firebaseUid/favorites/:marvelId - Eliminar favorito por Marvel ID
router.delete("/users/:firebaseUid/favorites/:marvelId", async (req, res) => {
  try {
    const { firebaseUid, marvelId } = req.params;

    const user = await User.findOne({ firebaseUid });
    
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Eliminar el favorito del array
    user.favorites = user.favorites.filter(fav => fav.marvelId !== parseInt(marvelId));
    await user.save();

    res.json({ 
      message: "Favorito eliminado correctamente",
      favorites: user.favorites 
    });
  } catch (error) {
    console.error("Error al eliminar favorito:", error);
    res.status(500).json({ error: "Error al eliminar favorito", details: error.message });
  }
});
export default router;
