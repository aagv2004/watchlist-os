import { searchMulti } from "../services/tmdbService.js";

export const searchContent = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res
        .status(400)
        .json({ message: "Se requiere un término de búsqueda." });
    }

    const results = await searchMulti(query);

    const filteredResults = results
      .filter((item) => item.media_type === "movie" || item.media_type === "tv")
      .map((item) => ({
        tmdbId: item.id,
        title: item.title || item.name,
        originalTitle: item.original_title || item.original_name,
        poster: item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : null,
        year: (item.release_date || item.first_air_date || "").substring(0, 4),
        type: item.media_type === "movie" ? "movie" : "series",
        rating: item.vote_average ? Math.round(item.vote_average / 2) : 0, // Convertimos de 1-10 a 0-5
        overview: item.overview,
        original_language: item.original_language,
        origin_country: item.origin_country,
      }));

    res.json(filteredResults);
  } catch (error) {
    res.status(500).json({ message: "Error buscando en TMDB" });
  }
};

export const getSeasonDetailsController = async (req, res) => {
  try {
    const { id, season } = req.params;
    const seasonData = await import("../services/tmdbService.js").then(
      (module) => module.getSeasonDetails(id, season),
    );

    if (!seasonData) {
      return res.status(404).json({ message: "Temporada no encontrada" });
    }

    res.json({
      season_number: seasonData.season_number,
      episode_count: seasonData.episodes.length,
      air_date: seasonData.air_date,
      name: seasonData.name,
    });
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo detalles de temporada" });
  }
};
