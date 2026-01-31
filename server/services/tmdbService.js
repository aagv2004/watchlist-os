import axios from "axios";

const tmdbApi = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}`,
    "Content-Type": "application/json",
  },
});

// DEBUG: Verificar si el token está cargado (solo imprimimos si existe o no)
console.log("🔑 TMDB Token Loaded:", !!process.env.TMDB_READ_TOKEN);

export const searchMulti = async (query) => {
  try {
    const response = await tmdbApi.get("/search/multi", {
      params: {
        query: query,
        language: "es-ES",
        include_adult: true,
      },
    });
    return response.data.results;
  } catch (error) {
    console.error("Error en TMDB Service:", error.message);
    return [];
  }
};
