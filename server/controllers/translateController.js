import { translateText } from "../services/translateService.js";

export const translateLyrics = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Texto requerido" });
    }

    const translated = await translateText(text);
    res.json({ translation: translated });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al traducir", error: error.message });
  }
};
