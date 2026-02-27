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

export const getSeasonDetails = async (tvId, seasonNumber) => {
  try {
    const response = await tmdbApi.get(`/tv/${tvId}/season/${seasonNumber}`, {
      params: {
        language: "es-ES",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching season ${seasonNumber} for TV ${tvId}:`,
      error.message,
    );
    return null; // Retornamos null si no existe la temporada (ej. temporada futura)
  }
};

export const getWatchProviders = async (type, tmdbId, region) => {
  try {
    const response = await tmdbApi.get(`/${type}/${tmdbId}/watch/providers`);

    const regionData = response.data?.results?.[region];

    if (!regionData) return null;

    const mapProviders = (arr = []) =>
      arr.map((p) => ({
        id: p.provider_id,
        name: p.provider_name,
        logoPath: p.logo_path,
      }));

    return {
      link: regionData.link,
      flatrate: mapProviders(regionData.flatrate),
      rent: mapProviders(regionData.rent),
      buy: mapProviders(regionData.buy),
    };
  } catch (error) {
    console.error("Error fetching watch providers:", error.message);
    return null;
  }
};
