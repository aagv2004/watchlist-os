import { searchMusic } from "../services/musicService.js";

export const searchMusicContent = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res
        .status(400)
        .json({ message: "Se requiere un término de búsqueda." });
    }

    const results = await searchMusic(query);

    // Mapeamos la respuesta de iTunes a nuestro formato estándar
    const formattedResults = results.map((item) => {
      // Truco para aumentar la resolución de la imagen de iTunes (de 100x100 a 600x600)
      const highResImage = item.artworkUrl100
        ? item.artworkUrl100.replace("100x100bb", "600x600bb")
        : null;

      return {
        tmdbId: item.collectionId, // Usamos collectionId como ID único
        title: item.collectionName,
        artist: item.artistName,
        poster: highResImage,
        year: item.releaseDate ? item.releaseDate.substring(0, 4) : "",
        type: "music",
        rating: 0,
        // iTunes no da sinopsis de álbumes fácil, así que lo dejamos vacío o ponemos el género
        overview: `${item.primaryGenreName} - ${item.trackCount} canciones`,
      };
    });

    res.json(formattedResults);
  } catch (error) {
    res.status(500).json({ message: "Error buscando música" });
  }
};

export const getMusicTracks = async (req, res) => {
  try {
    const { id } = req.params;
    const { getAlbumDetails } = await import("../services/musicService.js");

    const tracks = await getAlbumDetails(id);

    const formattedTracks = tracks.map((t) => ({
      title: t.trackName,
      // Convertir milisegundos a mm:ss
      duration: t.trackTimeMillis
        ? `${Math.floor(t.trackTimeMillis / 60000)}:${((t.trackTimeMillis % 60000) / 1000).toFixed(0).padStart(2, "0")}`
        : "0:00",
      completed: false,
      lyrics: "",
    }));

    res.json(formattedTracks);
  } catch (error) {
    console.error("Error getting tracks", error);
    res.status(500).json({ message: "Error fetching tracks" });
  }
};

export const getTrackLyrics = async (req, res) => {
  try {
    const { artist, title } = req.query;
    if (!artist || !title)
      return res.status(400).json({ message: "Artist and Title required" });

    const { getLyrics } = await import("../services/musicService.js");
    const lyrics = await getLyrics(artist, title);

    res.json({ lyrics: lyrics || "" });
  } catch (error) {
    console.error("Error fetching lyrics:", error);
    res.status(500).json({ message: "Error fetching lyrics" });
  }
};
