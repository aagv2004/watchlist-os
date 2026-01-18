import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB conectado exitosamente");
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1); // Detiene la app si no hay base de datos
  }
};

export default connectDB;
