import mongoose from "mongoose";
import dotenv from "dotenv";
import Item from "./models/Items.js";

dotenv.config();

// Tu ID de usuario proporcionado
const USER_ID = "696a98e91223cafcca8039ad";

const seedItems = [
  {
    userId: USER_ID,
    title: "Chainsaw Man",
    type: "anime",
    status: "watching",
    season: 1,
    progress: { current: 9, total: 12 },
    rating: 5, // Ajustado a escala de 5
    createdAt: new Date(),
  },
  {
    userId: USER_ID,
    title: "Attack on Titan",
    type: "anime",
    status: "dropped",
    season: 4,
    progress: { current: 5, total: 28 },
    rating: 4,
    updatedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
  },
  {
    userId: USER_ID,
    title: "The Bear",
    type: "series",
    status: "watching",
    season: 2,
    progress: { current: 4, total: 10 },
    rating: 5,
    createdAt: new Date(),
  },
  {
    userId: USER_ID,
    title: "Dune: Part Two",
    type: "movie",
    status: "pending",
    progress: { current: 0, total: 1 },
    rating: 0,
    createdAt: new Date(),
  },
  {
    userId: USER_ID,
    title: "Starboy",
    type: "music",
    artist: "The Weeknd",
    album: "Starboy",
    status: "watching",
    progress: { current: 2, total: 18 },
    tracks: [
      {
        title: "Starboy",
        completed: true,
        lyrics: "I'm tryna put you in the worst mood, ah...",
      },
      {
        title: "Party Monster",
        completed: true,
        lyrics: "I'm good, I'm good, I'm great...",
      },
      {
        title: "False Alarm",
        completed: false,
        lyrics: "She loves everybody, can't you tell?...",
      },
    ],
    rating: 5,
    createdAt: new Date(),
  },
  {
    userId: USER_ID,
    title: "Houdini",
    type: "music",
    artist: "Eminem",
    status: "pending",
    progress: { current: 0, total: 1 },
    rating: 4,
    createdAt: new Date(),
  },
  {
    userId: USER_ID,
    title: "Lo-fi Beats",
    type: "music",
    artist: "Artista Desconocido",
    status: "watching",
    progress: { current: 0, total: 1 },
    rating: 0,
    createdAt: new Date(),
  },
  {
    userId: USER_ID,
    title: "Hybrid Theory",
    type: "music",
    artist: "Linkin Park",
    album: "Hybrid Theory",
    status: "completed",
    progress: { current: 12, total: 12 },
    tracks: [
      { title: "Papercut", completed: true },
      { title: "One Step Closer", completed: true },
      { title: "With You", completed: true },
      { title: "Points of Authority", completed: true },
      { title: "Crawling", completed: true },
      { title: "In the End", completed: true },
    ],
    rating: 5,
    createdAt: new Date(),
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado para la siembra...");

    await Item.deleteMany({ userId: USER_ID });
    console.log("🗑️ Base de datos limpia para este usuario.");

    await Item.insertMany(seedItems);
    console.log("🌱 ¡Siembra completada con éxito!");

    await mongoose.disconnect();
    console.log("🔌 Desconectado.");
  } catch (error) {
    console.error("❌ Error sembrando:", error);
    process.exit(1);
  }
};

seedDB();
