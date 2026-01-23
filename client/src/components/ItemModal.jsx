import { useState, useEffect } from "react";
import {
  X,
  Search,
  Save,
  Film,
  Tv,
  Music,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import Swal from "sweetalert2"; // Importamos SweetAlert
import api from "../api/axios";

const ItemModal = ({ isOpen, onClose, onRefresh, itemToEdit }) => {
  // 1. ESTADOS (Mantenemos tu estructura completa)
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
    tmdbId: null, // Agregado para guardar referencia
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 2. EFECTO DE CARGA / EDICIÓN
  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        ...itemToEdit,
        // Aseguramos valores por defecto para evitar errores
        progress: itemToEdit.progress || { current: 0, total: 1 },
        poster: itemToEdit.poster || "",
        overview: itemToEdit.overview || "",
        tracks: itemToEdit.tracks || [],
      });
      setSearchTerm(itemToEdit.title);
    } else {
      // Reset para crear nuevo
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
    }
    setSuggestions([]);
  }, [itemToEdit, isOpen]);

  // 3. BUSCADOR EN TMDB (Tu lógica conectada al endpoint)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length > 2 && !itemToEdit) {
        setIsSearching(true);
        try {
          const { data } = await api.get(`/tmdb/search?query=${searchTerm}`);
          setSuggestions(data);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Error buscando en TMDB:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, itemToEdit]);

  // 4. MANEJADOR DE SELECCIÓN (Autocompletado)
  const handleSelectSuggestion = (suggestion) => {
    setFormData({
      ...formData,
      title: suggestion.title,
      poster: suggestion.poster,
      overview: suggestion.overview,
      year: suggestion.year,
      type: suggestion.type,
      tmdbId: suggestion.tmdbId,
      rating: 0, // El rating lo pone el usuario
    });
    setSearchTerm(suggestion.title);
    setShowSuggestions(false);
  };

  // 5. HANDLESUBMIT (¡TU LÓGICA CON SWEETALERTS RECUPERADA!)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Configuración del Toast
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
      // Ajuste para modo oscuro automático si usas clases 'dark' en body
      customClass: {
        popup: "dark:bg-zinc-800 dark:text-white",
      },
    });

    // --- TUS VALIDACIONES ---
    if (formData.progress.total <= 0) {
      return Toast.fire({
        icon: "warning",
        title: "¡El total de capítulos debe ser mayor a 0!",
      });
    }
    if (formData.progress.current < 0) {
      return Toast.fire({
        icon: "warning",
        title: "¡No puedes tener capítulos negativos!",
      });
    }
    if (formData.progress.current > formData.progress.total) {
      return Toast.fire({
        icon: "warning",
        title: "¡El actual no puede superar al total!",
      });
    }

    // --- LÓGICA DE ESTADO AUTOMÁTICO ---
    let finalStatus = formData.status;
    if (
      formData.progress.current === formData.progress.total &&
      formData.progress.total > 0
    ) {
      finalStatus = "completed";
    } else if (formData.progress.current > 0 && finalStatus === "pending") {
      finalStatus = "watching";
    }

    // --- LÓGICA DE TÍTULO DE MÚSICA ---
    let finalTitle = searchTerm; // Usamos lo que está en el input visualmente
    if (formData.type === "music") {
      finalTitle = formData.artist || formData.album || "Artista Desconocido";
    }

    const dataToSend = {
      ...formData,
      title: finalTitle,
      status: finalStatus,
    };

    try {
      if (itemToEdit) {
        await api.put(`/items/${itemToEdit._id}`, dataToSend);
        Toast.fire({ icon: "success", title: "¡Información Actualizada!" });
      } else {
        await api.post("/items", dataToSend);
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
              Título
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Escribe para buscar en TMDB..."
                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-lg font-semibold p-4 pl-12 rounded-2xl outline-none focus:ring-2 ring-black dark:ring-white transition-all dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                {isSearching ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Search size={20} />
                )}
              </div>
            </div>

            {/* SUGERENCIAS */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-700 overflow-hidden max-h-60 overflow-y-auto z-50">
                {suggestions.map((sugg) => (
                  <button
                    key={sugg.tmdbId}
                    type="button"
                    onClick={() => handleSelectSuggestion(sugg)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors text-left border-b border-gray-50 dark:border-zinc-700/50 last:border-0"
                  >
                    {sugg.poster ? (
                      <img
                        src={sugg.poster}
                        alt=""
                        className="w-10 h-14 object-cover rounded-md bg-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-14 bg-gray-200 dark:bg-zinc-600 rounded-md flex items-center justify-center">
                        <Film size={16} className="opacity-50" />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-sm dark:text-white line-clamp-1">
                        {sugg.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">
                        {sugg.year} •{" "}
                        {sugg.type === "movie" ? "Pelicula" : "Serie"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* GRID LAYOUT */}
          <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-6">
            {/* IZQUIERDA: POSTER */}
            <div className="flex flex-col gap-2">
              <div className="relative aspect-[2/3] w-full md:w-[140px] rounded-2xl overflow-hidden bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-inner group">
                {formData.poster ? (
                  <img
                    src={formData.poster}
                    alt="Poster"
                    className="w-full h-full object-cover"
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
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 p-3 rounded-xl text-sm font-medium outline-none focus:ring-2 ring-black dark:text-white appearance-none"
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
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700 accent-black dark:accent-white mt-3"
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rating: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              {(formData.type === "series" || formData.type === "anime") && (
                <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-800 space-y-3">
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
                <div className="grid grid-cols-2 gap-4">
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
              )}

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                  Sinopsis
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 p-3 rounded-xl text-sm outline-none resize-none dark:text-white placeholder:text-gray-300"
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
            className="px-8 py-3 rounded-xl font-bold text-sm bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-lg shadow-black/10"
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
