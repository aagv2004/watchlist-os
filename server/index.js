import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import "dotenv/config";
import itemRoutes from "./routes/itemRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
//Middleware
app.use(
  cors({
    origin: ["https://appvercel.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());

//Conexión a base de datos
connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
