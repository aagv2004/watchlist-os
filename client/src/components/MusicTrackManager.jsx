import { Plus, Trash2, AlignLeft, Wand2, Loader2, Music2 } from "lucide-react";
import { useState } from "react";
import api from "../api/axios";
import Swal from "sweetalert2";

const MusicTrackManager = ({ tracks, onChange, artistName }) => {
  const [newTrackName, setNewTrackName] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isFetchingLyrics, setIsFetchingLyrics] = useState(false);
  const [fetchingProgress, setFetchingProgress] = useState("");

  const addTrack = () => {
    if (!newTrackName.trim()) {
      setHasError(true);
      return;
    }
    const newTrack = {
      title: newTrackName,
      completed: false,
      lyrics: "",
    };
    onChange([...tracks, newTrack]);
    setNewTrackName("");
    setHasError(false);
  };

  const removeTrack = (index) => {
    onChange(tracks.filter((_, i) => i !== index));
  };

  const updateLyrics = (index, lyrics) => {
    const updated = tracks.map((t, i) => (i === index ? { ...t, lyrics } : t));
    onChange(updated);
  };

  // ✨ MAGIA: Auto-rellenado de letras
  const fetchAllLyrics = async () => {
    if (!artistName) return alert("¡Necesitas un Artista primero!");

    setIsFetchingLyrics(true);
    let updatedTracks = [...tracks];
    let successCount = 0;

    for (let i = 0; i < updatedTracks.length; i++) {
      // Si ya tiene letra, no la sobreescribimos (salvo que quieras forzar)
      if (updatedTracks[i].lyrics) continue;

      setFetchingProgress(`(${i + 1}/${updatedTracks.length})`);

      try {
        // Using the imported 'api' (which is axios) for external lyrics API
        const { data } = await api.get(
          `https://api.lyrics.ovh/v1/${artistName}/${updatedTracks[i].title}`,
        );

        if (data.lyrics) {
          updatedTracks[i].lyrics = data.lyrics;

          // AUTO-TRANSLATE CHAIN 🔗
          try {
            // Pequeña pausa para no saturar APIs
            await new Promise((r) => setTimeout(r, 500));

            // Usamos nuestro endpoint interno
            const translateRes = await api.post("/translate", {
              text: data.lyrics,
            });
            if (translateRes.data.translation) {
              updatedTracks[i].translation = translateRes.data.translation;
            }
          } catch (trError) {
            console.warn(
              "Translation failed for track:",
              updatedTracks[i].title,
            );
          }

          successCount++;
        }
      } catch (error) {
        console.warn(`No lyrics found for: ${updatedTracks[i].title}`);
      }

      // Pequeño delay para no saturar la API pública
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    onChange(updatedTracks); // Use onChange prop to update parent state
    setIsFetchingLyrics(false);
    setFetchingProgress("");

    if (successCount > 0) {
      Swal.fire({
        icon: "success",
        title: "¡Letras encontradas!",
        text: `Se añadieron letras (y traducciones) para ${successCount} canciones.`,
        timer: 2000,
      });
    } else {
      Swal.fire({
        icon: "info",
        title: "Sin resultados",
        text: "No pudimos encontrar letras automáticas. Intenta añadir manualmente.",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* HEADER: Input agregar + Botón Mágico */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 relative">
          <input
            type="text"
            placeholder={
              hasError ? "¡Escribe un nombre!" : "Nombre de la canción..."
            }
            className={`flex-1 p-3 rounded-xl bg-gray-50 border-none ring-1 outline-none text-sm transition-all
                        dark:bg-zinc-800 dark:text-white 
                        ${
                          hasError
                            ? "ring-red-500 focus:ring-red-500 placeholder:text-red-400 bg-red-50 dark:bg-red-900/10"
                            : "ring-gray-200 focus:ring-black dark:ring-zinc-700 dark:focus:ring-white dark:placeholder:text-zinc-500"
                        }`}
            value={newTrackName}
            onChange={(e) => {
              setNewTrackName(e.target.value);
              if (hasError) setHasError(false);
            }}
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), addTrack())
            }
          />
          <button
            type="button"
            onClick={addTrack}
            className="p-3 bg-black text-white rounded-xl active:scale-90 transition-transform 
                        dark:bg-white dark:text-black"
            title="Agregar canción manual"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* BOTÓN AUTO-LYRICS */}
        {tracks.length > 0 && (
          <button
            type="button"
            onClick={fetchAllLyrics}
            disabled={isFetchingLyrics}
            className="flex items-center justify-center gap-2 w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-900/30 dark:text-indigo-300"
          >
            {isFetchingLyrics ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                {fetchingProgress}
              </>
            ) : (
              <>
                <Wand2 size={14} />
                Auto-rellenar Letras (Beta)
              </>
            )}
          </button>
        )}
      </div>

      {/* LISTA DE TRACKS */}
      <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {tracks.map((track, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-2xl p-3 border border-gray-100 
                       dark:bg-zinc-800/40 dark:border-zinc-700 dark:text-white"
          >
            <div className="flex items-center gap-3">
              {/* Icono animado si tiene letra, o numero estático */}
              <div className="w-8 h-8 flex items-center justify-center bg-white dark:bg-zinc-700 rounded-lg text-xs font-bold text-gray-400 shadow-sm">
                {track.lyrics ? (
                  <Music2 size={14} className="text-indigo-500" />
                ) : (
                  <span className="opacity-50">{index + 1}</span>
                )}
              </div>

              <span className="flex-1 text-sm font-medium text-gray-700 dark:text-zinc-200 truncate">
                {track.title}
              </span>

              <button
                type="button"
                onClick={() => removeTrack(index)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Eliminar canción"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <details className="mt-2 group">
              <summary
                className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer list-none flex items-center gap-1 
                                   dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors select-none mt-1 ml-1"
              >
                <AlignLeft size={10} />{" "}
                {track.lyrics ? "Editar Letra" : "Añadir Letra"}
              </summary>
              <textarea
                className="w-full mt-2 p-3 text-xs bg-white rounded-xl border-none ring-1 ring-gray-100 outline-none focus:ring-black 
                           dark:bg-zinc-900 dark:ring-zinc-700 dark:text-zinc-200 dark:focus:ring-white font-mono leading-relaxed"
                placeholder="Pega la letra aquí..."
                rows="6"
                value={track.lyrics || ""}
                onChange={(e) => updateLyrics(index, e.target.value)}
              />
            </details>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MusicTrackManager;
