import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("Conectado a MongoDB");
    return true;
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error.message);
    return false;
  }
};

export default connectDB;
