import express from "express";
import Pokemon from "../../models/3rd_party/Pokemon.mjs";

const router = express.Router();
const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

// Aquí van a poner los endpoints del 3rd party API de Pokemón

// Helper: buscar pokemon en PokeAPI por nombre o id
const fetchPokemonFromAPI = async ({ id, name }) => {
  try {
    let url;
    if (id) {
      url = `${POKEAPI_BASE_URL}/pokemon/${id}`;
    } else if (name) {
      url = `${POKEAPI_BASE_URL}/pokemon/${name.toLowerCase()}`;
    } else {
      throw new Error("Se requiere id o name para buscar en PokeAPI");
    }

    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404) return null;
      const text = await res.text();
      throw new Error(`PokeAPI error ${res.status}: ${text}`);
    }

    const data = await res.json();

    // Transformar datos de PokeAPI al formato de nuestro modelo
    return {
      pokeId: data.id,
      name: data.name,
      sprite: data.sprites?.front_default || "",
      types: data.types?.map((t) => t.type.name) || [],
      height: data.height || 0,
      weight: data.weight || 0,
      abilities:
        data.abilities?.map((a) => ({
          name: a.ability.name,
          isHidden: a.is_hidden,
        })) || [],
      stats:
        data.stats?.map((s) => ({
          name: s.stat.name,
          baseStat: s.base_stat,
        })) || [],
    };
  } catch (error) {
    throw error;
  }
};

// Helper: obtener lista de pokemon con paginación
const fetchPokemonList = async (limit = 20, offset = 0) => {
  try {
    const url = `${POKEAPI_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`;
    const res = await fetch(url);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`PokeAPI error ${res.status}: ${text}`);
    }

    const data = await res.json();
    return {
      count: data.count,
      results: data.results,
      next: data.next,
      previous: data.previous,
    };
  } catch (error) {
    throw error;
  }
};

// GET /api/pokemon - Obtener lista de pokemon con paginación
router.get("/pokemon", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const pokemonList = await fetchPokemonList(limit, offset);

    res.status(200).json({
      total: pokemonList.count,
      limit,
      offset,
      results: pokemonList.results,
      next: pokemonList.next,
      previous: pokemonList.previous,
    });
  } catch (error) {
    console.error("Error al obtener lista de pokemon:", error);
    res.status(500).json({
      error: "Error al obtener lista de pokemon",
      details: error.message,
    });
  }
});

router.get("/pokemon/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;

    const isId = !isNaN(identifier);
    const data = await fetchPokemonFromAPI(
      isId ? { id: Number(identifier) } : { name: identifier }
    );

    if (!data) return res.status(404).json({ error: "Pokemon no encontrado" });

    // TODO Equipo Mongo:
    // Si en el futuro quieren guardar favoritos, integrarlo en rutas /users/... no aquí

    res.status(200).json({ pokemon: data });
  } catch (error) {
    console.error("Error al obtener pokemon:", error);
    res.status(500).json({ error: "Error interno", details: error.message });
  }
});

// GET /api/pokemon/search/:query - Buscar pokemon por nombre parcial (usando PokeAPI, sin Mongo)
router.get("/pokemon/search/:query", async (req, res) => {
  try {
    const { query } = req.params;

    // PokeAPI no tiene búsqueda parcial directa,
    // pero podemos traer muchos nombres y filtrar
    const url = `${POKEAPI_BASE_URL}/pokemon?limit=2000&offset=0`;
    const apiRes = await fetch(url);

    if (!apiRes.ok) {
      const text = await apiRes.text();
      throw new Error(`PokeAPI error ${apiRes.status}: ${text}`);
    }

    const data = await apiRes.json();

    // Filtrar por nombre que contenga el query
    const filtered = data.results.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );

    res.status(200).json({
      query,
      count: filtered.length,
      results: filtered, // [{ name, url }, ...]
    });
  } catch (error) {
    console.error("Error al buscar pokemon:", error);
    res.status(500).json({
      error: "Error al buscar pokemon",
      details: error.message,
    });
  }
});

// GET /api/pokemon/type/:type - Obtener pokemon por tipo
router.get("/pokemon/type/:type", async (req, res) => {
  try {
    const { type } = req.params;

    // 1. Obtener lista de pokémon por tipo desde PokeAPI
    const url = `${POKEAPI_BASE_URL}/type/${type.toLowerCase()}`;
    const apiRes = await fetch(url);

    if (!apiRes.ok) {
      if (apiRes.status === 404) {
        return res.status(404).json({
          error: `Tipo '${type}' no encontrado en PokeAPI`,
        });
      }
      const text = await apiRes.text();
      throw new Error(`PokeAPI error ${apiRes.status}: ${text}`);
    }

    const data = await apiRes.json();

    // 2. La PokeAPI devuelve una lista así:
    // {
    //   pokemon: [
    //     { pokemon: { name: "charmander", url: "..."} },
    //     { pokemon: { name: "vulpix", url: "..."} },
    //     ...
    //   ]
    // }

    const results = data.pokemon.map((p) => ({
      name: p.pokemon.name,
      url: p.pokemon.url,
    }));

    // 3. Responder compatible con tu test
    res.status(200).json({
      type,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("Error al buscar pokemon por tipo:", error);
    res.status(500).json({
      error: "Error al buscar pokemon por tipo",
      details: error.message,
    });
  }
});

export default router;
