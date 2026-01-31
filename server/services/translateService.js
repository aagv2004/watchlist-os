import axios from "axios";

// MyMemory API es gratuita para uso anónimo limitado
const TRANSLATE_API = "https://api.mymemory.translated.net/get";

export const translateText = async (text) => {
  if (!text) return "";

  try {
    // Truco: MyMemory funciona mejor con frases cortas.
    // Dividir por saltos de línea para no saturar el query param en GET
    const lines = text.split("\n");
    let translatedLines = [];

    // Procesar en lotes pequeños o línea por línea (secuencial para no rate-limit)
    // Para no exceder límites, tomaremos solo los primeros 15-20 versos en esta demo
    // o iteramos todo con cuidado.
    for (const line of lines) {
      if (!line.trim()) {
        translatedLines.push("");
        continue;
      }

      // Petición simple
      const response = await axios.get(TRANSLATE_API, {
        params: {
          q: line,
          langpair: "en|es",
        },
      });

      if (response.data && response.data.responseData) {
        translatedLines.push(response.data.responseData.translatedText);
      } else {
        translatedLines.push(line);
      }
    }

    return translatedLines.join("\n");
  } catch (error) {
    console.error("Error en Translation Service:", error.message);
    throw new Error("Servicio de traducción no disponible temporalmente");
  }
};
