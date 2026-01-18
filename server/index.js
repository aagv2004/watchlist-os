import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import "dotenv/config";
import itemRoutes from "./routes/itemRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
//Middleware
const whitelist = [process.env.FRONTEND_URL, "http://localhost:5173"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || whitelist.includes(origin)) {
        callback(null, true);
      } else {
        callback(
          new Error(
            "Error de CORS: Origen no permitido por la política (pd: esto lo escribiste tu mismo awuhejasf)",
          ),
        );
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
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
