import mongoose from "mongoose";

// Definimos el "esquema" (la estructura de los datos)
const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "El título es obligatorio"],
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["movie", "series", "anime", "music"], // Solo permite estos valores
    },
    status: {
      type: String,
      enum: ["pending", "watching", "completed", "dropped"],
      default: "pending",
    },
    season: {
      type: Number,
      default: 1,
    },
    progress: {
      current: { type: Number, default: 0 }, // Ej: Episodio 5
      total: { type: Number, default: 1 }, // Ej: De 12 episodios
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    artist: String,
    album: String,
    tracks: [
      {
        title: String,
        duration: String,
        lyrics: String,
        completed: { type: Boolean, default: false },
      },
    ],
    userId: {
      type: mongoose.Schema.Types.ObjectId, // Esto vincula el item a un usuario
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // Esto crea automáticamente "createdAt" y "updatedAt"
  },
);

const Item = mongoose.model("Item", itemSchema);
export default Item;
