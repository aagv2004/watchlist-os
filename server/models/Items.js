import mongoose from "mongoose";

// Opciones para el discriminador
const options = { discriminatorKey: "type", timestamps: true };

// 1. ESQUEMA BASE (Padre)
// Contiene solo los campos comunes a TODOS los items.
const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "El título es obligatorio"],
      trim: true,
    },
    // 'type' ahora actúa como la llave discriminadora.
    // Mongoose usará este campo para saber qué modelo hijo instanciar.
    type: {
      type: String,
      required: true,
      enum: ["movie", "series", "anime", "music"],
    },
    status: {
      type: String,
      enum: ["pending", "watching", "completed", "dropped"],
      default: "pending",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Campos comunes opcionales
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    progress: {
      current: { type: Number, default: 0 },
      total: { type: Number, default: 1 },
    },
    overview: String, // Sinopsis (común en cine/música a veces)
    poster: String, // Imagen principal
    year: String,
  },
  options,
);

// Modelo Base
const Item = mongoose.model("Item", itemSchema);

// 2. DISCRIMINADORES (Hijos)

// --- CINE (Películas) ---
const Movie = Item.discriminator(
  "movie",
  new mongoose.Schema({
    tmdbId: Number,
  }),
);

// --- SERIES y ANIME ---
// Comparten estructura (temporadas, capítulos)
const SeriesSchema = new mongoose.Schema({
  tmdbId: Number,
  season: {
    type: Number,
    default: 1,
  },
  // Progress removido de aquí porque ahora está en el Base
});

const Series = Item.discriminator("series", SeriesSchema);
const Anime = Item.discriminator("anime", SeriesSchema);

// --- MÚSICA ---
const Music = Item.discriminator(
  "music",
  new mongoose.Schema({
    artist: String,
    album: String,
    tracks: [
      {
        title: String,
        duration: String,
        lyrics: String,
        translation: String,
        completed: { type: Boolean, default: false },
      },
    ],
  }),
);

export default Item;
// Exportamos también los hijos por si se necesitan específicamente en el futuro
export { Movie, Series, Anime, Music };
