import axios from "axios";

const itunesApi = axios.create({
  baseURL: "https://itunes.apple.com",
  headers: {
    "Content-Type": "application/json",
  },
});

export const searchMusic = async (query) => {
  try {
    const response = await itunesApi.get("/search", {
      params: {
        term: query,
        media: "music",
        entity: "album", // Buscamos álbumes principalmente para tener portadas
        limit: 10,
      },
    });
    return response.data.results;
  } catch (error) {
    console.error("Error en Music Service (iTunes):", error.message);
    return [];
  }
};

export const getAlbumDetails = async (collectionId) => {
  try {
    const response = await itunesApi.get("/lookup", {
      params: {
        id: collectionId,
        entity: "song",
      },
    });
    // Removemos el primer resultado que suele ser el álbum en sí, dejando solo las canciones
    const results = response.data.results;
    if (results && results.length > 0) {
      return results.filter((item) => item.wrapperType === "track");
    }
    return [];
  } catch (error) {
    console.error("Error fetching available tracks:", error);
    return [];
  }
};

export const getLyrics = async (artist, title) => {
  try {
    // API simple y gratuita: lyrics.ovh
    const response = await axios.get(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`,
    );
    return response.data.lyrics;
  } catch (error) {
    // Es normal que falle si no encuentra la canción, no hacemos log error ruidoso
    return null;
  }
};
