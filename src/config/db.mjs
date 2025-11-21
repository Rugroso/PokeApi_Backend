import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    isConnected = conn.connections[0].readyState === 1;

    console.log("Conectado a MongoDB");
  } catch (error) {
    console.error("Error en conexión a MongoDB:", error);
    throw error;
  }
};

export default connectDB;
