import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.mjs";
import pokemonRoutes from "./routes/3rd_party/pokemon.mjs";
import UserRoutes from "./routes/user.mjs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.get("/", (req, res) => {
  res.json({ message: "Pokemon API corriendo correctamente" });
});

app.use("/api", pokemonRoutes);
app.use("/api", UserRoutes);

const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
};

startServer();

export default app;
