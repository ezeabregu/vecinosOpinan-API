import mongoose from "mongoose";

export const dbConnection = async (): Promise<void> => {
  try {
    const dbURL = process.env.DB_URL;
    if (!dbURL) {
      throw new Error("URL mal definida en variables de entorno.");
    }
    await mongoose.connect(dbURL);
  } catch (error) {
    console.log(error);
    throw new Error("Error al iniciar la DB.");
  }
};
