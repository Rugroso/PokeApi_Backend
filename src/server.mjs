import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.mjs";
import pokemonRoutes from "./routes/3rd_party/pokemon.mjs";
import UserRoutes from "./routes/users.mjs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const VALID_API_KEYS = JSON.parse(process.env.API_KEY_LIST); // Lista de API keys válidas

const authenticateApiKey = (req, res, next) => {
    const apiKey = req.header('X-API-KEY'); // Get API key from 'X-API-KEY' header

    if (!apiKey) {
        return res.status(401).json({ message: 'API Key is missing.' });
    }

    if (!VALID_API_KEYS.includes(apiKey)) {
        return res.status(401).json({ message: 'Invalid API Key.' });
    }

    // API Key is valid, proceed to the next middleware or route handler
    next();
};


// Rutas principales
app.get("/", authenticateApiKey, (req, res) => {
  res.json({
    message: "PokeAPI corriendo correctamente",
    version: "1.0.0",
    environment: "Vercel Serverless",
    endpoints: {
      users: "/api/users",
      pokemon: "/api/pokemon",
    },
  });
});


app.use("/api", authenticateApiKey, pokemonRoutes);
app.use("/api", authenticateApiKey, UserRoutes);

const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
};

startServer();

export default app;
