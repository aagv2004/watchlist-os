import { useState, useEffect, useRef } from "react";
import {
  X,
  Search,
  Save,
  Film,
  Tv,
  Music,
  Image as ImageIcon,
  Loader2,
  Star,
  Calendar,
} from "lucide-react";
import Swal from "sweetalert2";
import api from "../api/axios";
import MusicTrackManager from "./MusicTrackManager";

const ItemModal = ({ isOpen, onClose, onRefresh, itemToEdit }) => {
  // 1. ESTADOS
  const [formData, setFormData] = useState({
    title: "",
    type: "movie",
    status: "pending",
    rating: 0,
    season: 1,
    progress: { current: 0, total: 1 },
    poster: "",
    overview: "",
    year: "",
    artist: "",
    album: "",
    tracks: [],
    tmdbId: null,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Estado para revertir si el usuario solo estaba "mirando" (hover) y no seleccionó nada
  const [backupFormData, setBackupFormData] = useState(null);

  // Ref para tener siempre el estado más reciente de formData sin causar re-renders
  // Esto soluciona la advertencia del useEffect sin romper la lógica
  const formDataRef = useRef(formData);
  const showSuggestionsRef = useRef(showSuggestions);
  const ignoreSearchRef = useRef(false); // <--- NUEVO: Para evitar re-búsqueda al seleccionar

  // Mantenemos las referencias actualizadas
  useEffect(() => {
    formDataRef.current = formData;
    showSuggestionsRef.current = showSuggestions;
  }, [formData, showSuggestions]);

  // 2. EFECTO DE CARGA / EDICIÓN
  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        ...itemToEdit,
        progress: itemToEdit.progress || { current: 0, total: 1 },
        poster: itemToEdit.poster || "",
        overview: itemToEdit.overview || "",
        tracks: itemToEdit.tracks || [],
      });
      setSearchTerm(itemToEdit.title);
    } else {
      resetForm();
    }
  }, [itemToEdit, isOpen]);

  const resetForm = () => {
    setFormData({
      title: "",
      type: "movie",
      status: "pending",
      rating: 0,
      season: 1,
      progress: { current: 0, total: 12 },
      poster: "",
      overview: "",
      year: "",
      artist: "",
      album: "",
      tracks: [],
      tmdbId: null,
    });
    setSearchTerm("");
    setSuggestions([]);
  };

  // 3. BUSCADOR EN TMDB
  // 3. BUSCADOR EN TMDB & MÚSICA
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      // Si acabamos de seleccionar manualmente, IGNORAMOS la búsqueda esta vez
      if (ignoreSearchRef.current) {
        ignoreSearchRef.current = false;
        return;
      }

      // Usamos el validador directo de la longitud
      if (searchTerm.length > 2 && !itemToEdit) {
        setIsSearching(true);
        try {
          if (!showSuggestionsRef.current) {
            setBackupFormData({ ...formDataRef.current });
          }

          let responseData = [];

          // RAMA MÚSICA 🎵 vs RAMA VIDEO 🎬
          if (formData.type === "music") {
            const { data } = await api.get(`/music/search?query=${searchTerm}`);
            responseData = data;
          } else {
            const { data } = await api.get(`/tmdb/search?query=${searchTerm}`);

            // Procesamiento de Anime
            responseData = data.map((item) => {
              if (
                item.type === "series" &&
                (item.original_language === "ja" ||
                  item.origin_country?.includes("JP"))
              ) {
                return { ...item, type: "anime" };
              }
              return item;
            });
          }

          setSuggestions(responseData);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Error buscando:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, itemToEdit, formData.type]); // Añadimos formData.type para refrescar al cambiar tabs

  // AUTO-DETECTAR EPISODIOS AL CAMBIAR DE TEMPORADA 📺
  useEffect(() => {
    // Solo actuamos si es Series/Anime, tiene ID de TMDB y hay una temporada válida
    if (
      (formData.type === "series" || formData.type === "anime") &&
      formData.tmdbId &&
      formData.season
    ) {
      const fetchSeasonData = async () => {
        try {
          // Pequeña pausa para no saturar si escriben rápido
          const { data } = await api.get(
            `/tmdb/series/${formData.tmdbId}/season/${formData.season}`,
          );
          if (data && data.episode_count) {
            setFormData((prev) => ({
              ...prev,
              progress: {
                ...prev.progress,
                total: data.episode_count,
              },
            }));
          }
        } catch (error) {
          console.error("No se pudo cargar data de la temporada:", error);
          // No hacemos nada visualmente para no molestar, el usuario puede editar manual
        }
      };

      const timeoutId = setTimeout(fetchSeasonData, 500); // Debounce de 500ms
      return () => clearTimeout(timeoutId);
    }
  }, [formData.season, formData.tmdbId, formData.type]);

  // 4A. HOVER PREVIEW (La magia ⭐️)
  const handlePreviewSuggestion = (suggestion) => {
    setFormData((prev) => ({
      ...prev,
      title: suggestion.title,
      poster: suggestion.poster,
      overview: suggestion.overview,
      year: suggestion.year,
      type: suggestion.type,
      tmdbId: suggestion.tmdbId,
      // MÚSICA
      artist: suggestion.artist || "",
      album: suggestion.type === "music" ? suggestion.title : "", // En música, el título suele ser el Álbum en nuestra búsqueda de iTunes
      rating: suggestion.rating || 0, // ¡Autrellenado de Rating!
      season:
        suggestion.type === "series" || suggestion.type === "anime"
          ? 1
          : prev.season,
      // Intentamos ser inteligentes con los capítulos si es serie
      progress:
        suggestion.type === "series" || suggestion.type === "anime"
          ? { current: 0, total: 12 }
          : { current: 0, total: 1 }, // Reset para películas/música
    }));
  };

  // 4B. SELECCIÓN FINAL (Confirmar)
  const handleSelectSuggestion = async (suggestion) => {
    ignoreSearchRef.current = true; // <--- Bloqueamos la búsqueda automática
    handlePreviewSuggestion(suggestion); // Aseguramos que los datos estén puestos
    setSearchTerm(suggestion.title);
    setShowSuggestions(false);
    setBackupFormData(null); // Ya no necesitamos revertir, el usuario confirmó

    // Si es música, buscamos los tracks reales
    if (suggestion.type === "music" && suggestion.tmdbId) {
      try {
        // Pequeño feedback visual podría ir aquí, pero por rapidez solo haremos el fetch
        const { data: tracks } = await api.get(
          `/music/album/${suggestion.tmdbId}`,
        );
        setFormData((prev) => ({
          ...prev,
          tracks: tracks,
        }));
      } catch (error) {
        console.error("Error cargando canciones:", error);
      }
    }
  };

  // 4C. SALIR DEL HOVER (Opcional: Revertir si se desea, o dejar la última vista)
  // Por ahora lo dejamos "sticky" (pegajoso) porque se siente mejor UX no perder lo que viste.

  // 5. HANDLESUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
      customClass: {
        popup: "dark:bg-zinc-800 dark:text-white",
      },
    });

    if (formData.progress.total <= 0) {
      return Toast.fire({
        icon: "warning",
        title: "¡El total de capítulos debe ser mayor a 0!",
      });
    }

    let finalStatus = formData.status;
    if (
      formData.progress.current === formData.progress.total &&
      formData.progress.total > 0
    ) {
      finalStatus = "completed";
    } else if (formData.progress.current > 0 && finalStatus === "pending") {
      finalStatus = "watching";
    }

    let finalTitle = searchTerm;
    if (formData.type === "music") {
      finalTitle = formData.artist || formData.album || "Artista Desconocido";
    }

    // LIMPIEZA DE DATOS PARA EL BACKEND (Discriminadores)
    // Eliminamos campos que no corresponden al tipo para evitar errores de validación
    const cleanData = { ...formData, title: finalTitle, status: finalStatus };

    if (cleanData.type === "movie") {
      delete cleanData.season;
      // delete cleanData.progress; // AHORA SÍ queremos progreso en películas (0/1)
      delete cleanData.artist;
      delete cleanData.album;
      delete cleanData.tracks;
    } else if (cleanData.type === "series" || cleanData.type === "anime") {
      delete cleanData.artist;
      delete cleanData.album;
      delete cleanData.tracks;
      delete cleanData.year;
      // overview y poster pueden ser útiles en música también
    }

    // Lógica Inteligente: Si está marcado como "Completado" pero el progreso dice lo contrario (ej. Nueva temporada)
    // Cambiamos automáticamente a "Viendo"
    if (
      cleanData.status === "completed" &&
      cleanData.progress &&
      cleanData.progress.current < cleanData.progress.total
    ) {
      cleanData.status = "watching";
    }

    try {
      if (itemToEdit) {
        await api.put(`/items/${itemToEdit._id}`, cleanData);
        Toast.fire({ icon: "success", title: "¡Información Actualizada!" });
      } else {
        await api.post("/items", cleanData);
        Toast.fire({ icon: "success", title: "¡Añadido a tu biblioteca!" });
      }

      onRefresh();
      onClose();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Ups...",
        text: "No pudimos guardar los cambios",
        confirmButtonColor: "#000000",
        background: document.documentElement.classList.contains("dark")
          ? "#18181b"
          : "#fff",
        color: document.documentElement.classList.contains("dark")
          ? "#fff"
          : "#000",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full md:max-w-2xl bg-white dark:bg-zinc-900 rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col max-h-[95vh] md:max-h-[90vh] transition-all duration-300 animate-in slide-in-from-bottom-10 fade-in">
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-xl font-black tracking-tight dark:text-white">
            {itemToEdit ? "Editar Elemento" : "Nuevo Descubrimiento"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full hover:rotate-90 transition-transform"
          >
            <X size={20} className="dark:text-white" />
          </button>
        </div>

        {/* BODY CON SCROLL */}
        <div className="overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* TIPO */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {[
              { id: "movie", label: "Película", icon: Film },
              { id: "series", label: "Serie", icon: Tv },
              { id: "anime", label: "Anime", icon: Tv },
              { id: "music", label: "Música", icon: Music },
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.id })}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${
                  formData.type === type.id
                    ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-700"
                }`}
              >
                <type.icon size={16} />
                {type.label}
              </button>
            ))}
          </div>

          {/* BUSCADOR */}
          <div className="relative z-20">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">
              {formData.type === "music" ? "Buscar Música (iTunes)" : "Título"}
            </label>
            <div className="relative group">
              <input
                type="text"
                placeholder={
                  formData.type === "music"
                    ? "Ej: Pink Floyd, Adele, Bad Bunny..."
                    : "Escribe para buscar..."
                }
                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-lg font-semibold p-4 pl-12 rounded-2xl outline-none focus:ring-2 ring-black dark:ring-white transition-all dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
                {isSearching ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Search size={20} />
                )}
              </div>
            </div>

            {/* SUGERENCIAS (COMMAND PALETTE STYLE) */}
            {showSuggestions && suggestions.length > 0 && (
              <>
                {/* BACKDROP INVISIBLE PARA CERRAR AL TOCAR AFUERA (Móvil Friendly 📱) */}
                <div
                  className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px]"
                  onClick={() => setShowSuggestions(false)}
                />

                <div
                  className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-700 overflow-hidden max-h-72 overflow-y-auto z-50 ring-4 ring-black/5 dark:ring-white/5 animate-in fade-in slide-in-from-top-2"
                  onMouseLeave={() => {
                    // Opcional: Si sale del área de sugerencias, ¿hacemos algo?
                  }}
                >
                  <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-zinc-800/50 sticky top-0 backdrop-blur-sm z-10">
                    Sugerencias
                  </div>
                  {suggestions.map((sugg) => (
                    <button
                      key={sugg.tmdbId}
                      type="button"
                      // EVENTOS CLAVE:
                      onMouseEnter={() => handlePreviewSuggestion(sugg)}
                      onClick={() => handleSelectSuggestion(sugg)}
                      className="w-full flex items-center gap-4 p-3 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-left group border-b border-gray-50 dark:border-zinc-800 last:border-0"
                    >
                      {sugg.poster ? (
                        <img
                          src={sugg.poster}
                          alt=""
                          className="w-12 h-16 object-cover rounded-lg shadow-sm group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-12 h-16 bg-gray-200 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                          <Film size={20} className="opacity-30" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm dark:text-white truncate group-hover:text-black dark:group-hover:text-white">
                          {sugg.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-zinc-400">
                          <span className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                            <Calendar size={10} />
                            {sugg.year}
                          </span>
                          {sugg.type === "music" ? (
                            <>
                              <span className="flex items-center gap-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-500 px-1.5 py-0.5 rounded font-bold max-w-[120px] truncate">
                                <Music size={10} className="stroke-[3]" />
                                {sugg.artist}
                              </span>
                              <span className="text-gray-400 dark:text-zinc-500 truncate max-w-[100px]">
                                {sugg.overview?.split("-")[0]} {/* Género */}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 px-1.5 py-0.5 rounded font-bold">
                                <Star size={10} className="fill-current" />
                                {sugg.rating}
                              </span>
                              <span className="capitalize">
                                {sugg.type === "movie"
                                  ? "Pelicula"
                                  : sugg.type === "anime"
                                    ? "Anime"
                                    : "Serie"}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* GRID LAYOUT */}
          <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-6">
            {/* IZQUIERDA: POSTER */}
            <div className="flex flex-col gap-2">
              <div className="relative aspect-[2/3] w-full md:w-[140px] rounded-2xl overflow-hidden bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-inner group transition-all duration-500">
                {formData.poster ? (
                  <img
                    src={formData.poster}
                    alt="Poster"
                    className="w-full h-full object-cover transition-opacity duration-300 animate-in fade-in"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-300 dark:text-zinc-600">
                    <ImageIcon size={32} />
                    <span className="text-[10px] mt-2 font-bold uppercase">
                      Sin imagen
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <input
                    type="text"
                    className="text-xs bg-transparent text-white text-center w-full px-2 outline-none placeholder:text-white/70"
                    placeholder="URL img"
                    onChange={(e) =>
                      setFormData({ ...formData, poster: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* DERECHA: CAMPOS */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                    Estado
                  </label>
                  <select
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 p-3 rounded-xl text-sm font-medium outline-none focus:ring-2 ring-black dark:text-white appearance-none transition-all"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="pending">Por ver</option>
                    <option value="watching">Viendo</option>
                    <option value="completed">Completado</option>
                    <option value="dropped">Abandonado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                    Rating ({formData.rating}/5)
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700 accent-black dark:accent-white z-10"
                      value={formData.rating}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rating: Number(e.target.value),
                        })
                      }
                    />
                    {/* Estrellitas visuales background si quisieras, por ahora simple */}
                  </div>
                </div>
              </div>

              {(formData.type === "series" || formData.type === "anime") && (
                <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-800 space-y-3 animate-in slide-in-from-top-2 fade-in">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                        Temp.
                      </label>
                      <input
                        type="number"
                        className="w-full p-2 bg-white dark:bg-zinc-900 rounded-lg text-center font-bold text-sm outline-none dark:text-white"
                        value={formData.season}
                        onChange={(e) =>
                          setFormData({ ...formData, season: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                        Cap.
                      </label>
                      <input
                        type="number"
                        className="w-full p-2 bg-white dark:bg-zinc-900 rounded-lg text-center font-bold text-sm outline-none dark:text-white"
                        value={formData.progress.current}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            progress: {
                              ...formData.progress,
                              current: Number(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                        Total
                      </label>
                      <input
                        type="number"
                        className="w-full p-2 bg-white dark:bg-zinc-900 rounded-lg text-center font-bold text-sm outline-none text-gray-400"
                        value={formData.progress.total}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            progress: {
                              ...formData.progress,
                              total: Number(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* MÚSICA (Campos extra) */}
              {formData.type === "music" && (
                <>
                  <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 fade-in">
                    <input
                      placeholder="Artista"
                      className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 p-3 rounded-xl text-sm outline-none dark:text-white"
                      value={formData.artist}
                      onChange={(e) =>
                        setFormData({ ...formData, artist: e.target.value })
                      }
                    />
                    <input
                      placeholder="Álbum"
                      className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 p-3 rounded-xl text-sm outline-none dark:text-white"
                      value={formData.album}
                      onChange={(e) =>
                        setFormData({ ...formData, album: e.target.value })
                      }
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">
                      Lista de Canciones & Letras
                    </label>
                    <MusicTrackManager
                      tracks={formData.tracks || []}
                      artistName={formData.artist}
                      onChange={(newTracks) =>
                        setFormData({ ...formData, tracks: newTracks })
                      }
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                  Sinopsis
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 p-3 rounded-xl text-sm outline-none resize-none dark:text-white placeholder:text-gray-300 transition-all"
                  placeholder={formData.overview || "Escribe algo..."}
                  value={formData.overview}
                  onChange={(e) =>
                    setFormData({ ...formData, overview: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-3 bg-white dark:bg-zinc-900 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-3 rounded-xl font-bold text-sm bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-lg shadow-black/10 hover:shadow-xl hover:scale-105 transform duration-200"
          >
            <Save size={18} />
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemModal;
