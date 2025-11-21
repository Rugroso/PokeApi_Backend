import fetch from "node-fetch";

const base = "http://localhost:3000/api";

async function testPokemonAPI() {
  console.log("=== PRUEBAS DE POKEMON API ===\n");

  try {
    // 1) Obtener lista de pokemon
    console.log("1. Obteniendo lista de pokemon...");
    let res = await fetch(`${base}/pokemon?limit=10&offset=0`);
    let data = await res.json();
    console.log("Status:", res.status);

    if (!res.ok) throw new Error(JSON.stringify(data));

    console.log("Resultados:", data.results.length);
    console.log("Total disponibles:", data.total, "\n");

    // 2) Obtener pokemon por ID
    console.log("2. Obteniendo Pikachu por ID (25)...");
    res = await fetch(`${base}/pokemon/25`);
    data = await res.json();
    console.log("Status:", res.status);

    if (!res.ok) throw new Error(JSON.stringify(data));

    console.log("Pokemon:", data.pokemon.name);
    console.log("Tipos:", data.pokemon.types.join(", "));
    console.log("Sprite:", data.pokemon.sprite, "\n");

    // 3) Obtener pokemon por nombre
    console.log("3. Obteniendo Charizard por nombre...");
    res = await fetch(`${base}/pokemon/charizard`);
    data = await res.json();
    console.log("Status:", res.status);

    if (!res.ok) throw new Error(JSON.stringify(data));

    console.log("ID:", data.pokemon.pokeId);
    console.log("Pokemon:", data.pokemon.name);
    console.log("Sprite:", data.pokemon.sprite);
    console.log("Tipos:", data.pokemon.types.join(", "));
    console.log("Altura:", data.pokemon.height);
    console.log("Peso:", data.pokemon.weight);
    console.log("Habilidades:", data.pokemon.abilities.join(", "));
    console.log("Stats:", data.pokemon.stats.join(", "));

    // 4) Búsqueda por nombre parcial
    console.log('4. Buscando pokemon que contengan "char"...');
    res = await fetch(`${base}/pokemon/search/char`);
    data = await res.json();
    console.log("Status:", res.status);

    if (!res.ok) throw new Error(JSON.stringify(data));

    console.log("Encontrados:", data.count);
    console.log(
      "Resultados:",
      data.results.map((p) => p.name).join(", "),
      "\n"
    );

    // 5) Buscar por tipo
    console.log('5. Buscando pokemon de tipo "fire"...');
    res = await fetch(`${base}/pokemon/type/fire`);
    data = await res.json();
    console.log("Status:", res.status);

    if (!res.ok) throw new Error(JSON.stringify(data));

    console.log("Pokemon de tipo fuego encontrados:", data.count);
    console.log(
      "Primeros resultados:",
      data.results
        .slice(0, 5)
        .map((p) => p.name)
        .join(", "),
      "\n"
    );

    console.log("✅ Todas las pruebas completadas exitosamente!");
  } catch (error) {
    console.error("❌ Error en las pruebas:", error.message);
  }
}

testPokemonAPI();
