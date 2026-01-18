import { useState } from "react";
import { X, Save, Star, StarHalf } from "lucide-react";
import MusicTrackManager from "./MusicTrackManager";
import Swal from "sweetalert2";
import api from "../api/axios";

const ItemModal = ({ isOpen, onClose, onRefresh, itemToEdit }) => {
  const [formData, setFormData] = useState(() => {
    if (itemToEdit)
      return {
        ...itemToEdit,
        season: itemToEdit.season || 1,
        artist: itemToEdit.artist || "",
        album: itemToEdit.album || "",
        tracks: itemToEdit.tracks || [],
      };
    return {
      title: "",
      type: "movie",
      status: "pending",
      rating: 0,
      season: 1,
      artist: "",
      album: "",
      tracks: [],
      progress: {
        current: 0,
        total: 1,
      },
    };
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Configuración del diseño del Toast
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
      background: "#ffffff",
      color: "#000000",
      iconColor: "#10b981",
    });

    if (formData.progress.total <= 0) {
      return Toast.fire({
        icon: "warning",
        title: "¡No puedes poner total de capitulos en negativo!",
        iconColor: "#cc3300",
      });
    }

    if (formData.progress.current < 0) {
      return Toast.fire({
        icon: "warning",
        title: "¡No puedes empezar un capítulo desde el -1!",
        iconColor: "#cc3300",
      });
    }

    if (formData.progress.current > formData.progress.total) {
      return Toast.fire({
        icon: "warning",
        title: "¡Tu capitulo actual no puede superar al total!",
        iconColor: "#cc3300",
      });
    }

    // Status automático
    let finalStatus = formData.status;
    if (formData.progress.current === formData.progress.total) {
      finalStatus = "completed";
    } else if (formData.progress.current > 0) {
      finalStatus = "watching";
    } else {
      finalStatus = "pending";
    }

    let finalTitle = formData.title;
    if (formData.type === "music") {
      finalTitle =
        formData.artist ||
        formData.album ||
        (formData.tracks.length > 0
          ? formData.tracks[0].title
          : "Artista Desconocido");
    }

    const dataToSend = {
      ...formData,
      title: finalTitle,
      status: finalStatus,
    };

    try {
      if (itemToEdit) {
        // Modo edición
        await api.put(`/items/${itemToEdit._id}`, dataToSend);
        Toast.fire({
          icon: "success",
          title: "¡Información Actualizada!",
        });
      } else {
        // Modo crear / post
        await api.post("/items", dataToSend);
        Toast.fire({
          icon: "success",
          title: "¡Añadido a tu biblioteca!",
        });
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
      });
    }
  };

  return (
    // Contenedor Principal
    <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center dark:bg-zinc-950/80">
      {/* Header */}
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 dark:bg-zinc-900 dark:border dark:border-zinc-800 dark:text-white">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center dark:border-gray-500">
          <h2 className="text-xl font-bold">
            {itemToEdit ? "Actualizar información" : "Nuevo Ítem"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar"
        >
          {/* Input de titulo si no es "music" */}
          {formData.type !== "music" && (
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-zinc-400">
                Título
              </label>
              <input
                required={formData.type !== "music"}
                className="w-full p-4 rounded-2xl bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-black outline-none transition-all dark:bg-zinc-800 dark:ring-zinc-700 dark:text-white dark:focus:ring-white"
                placeholder="Ej: Elite"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
          )}

          {/* Calificación que solo aparece si no es "music" */}
          {formData.type !== "music" && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-3 dark:text-zinc-400">
                Calificación:{" "}
                {formData.rating > 0 ? formData.rating : "Sin nota"}
              </label>

              {/* Contenedor Responsive: Wrap para que no se rompa en pantallas pequeñas */}
              <div
                className="flex flex-wrap items-center gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100 
                dark:bg-zinc-800/50 dark:border-zinc-700"
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFull = formData.rating >= star;
                  const isHalf = formData.rating === star - 0.5;

                  return (
                    <div
                      key={star}
                      className="relative flex items-center group"
                    >
                      {/* Lado Izquierdo (Media Estrella) */}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, rating: star - 0.5 })
                        }
                        className="absolute left-0 w-1/2 h-full z-10 cursor-pointer"
                        title={`Calificar con ${star - 0.5}`}
                      />

                      {/* Lado Derecho (Estrella Completa) */}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, rating: star })
                        }
                        className="absolute right-0 w-1/2 h-full z-10 cursor-pointer"
                        title={`Calificar con ${star}`}
                      />

                      {/* El Icono Visual */}
                      <div className="transition-transform group-active:scale-90">
                        {isHalf ? (
                          <StarHalf className="w-8 h-8 text-amber-400 fill-amber-400" />
                        ) : (
                          <Star
                            className={`w-8 h-8 ${
                              isFull
                                ? "text-amber-400 fill-amber-400"
                                : "text-gray-200 fill-transparent"
                            }`}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Botón para resetear a 0 si se equivoca */}
                {formData.rating > 0 && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: 0 })}
                    className="ml-auto text-[10px] font-bold text-gray-300 hover:text-red-500 uppercase"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>
          )}

          {/* SELECT DE TIPO */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-zinc-400 tracking-widest">
                Tipo
              </label>
              <select
                className="w-full p-4 rounded-2xl bg-gray-50 border-none ring-1 ring-gray-200 outline-none dark:bg-zinc-800 dark:ring-zinc-700 dark:text-white dark:focus:ring-white"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="movie">Película</option>
                <option value="series">Serie</option>
                <option value="anime">Anime</option>
                <option value="music">Música</option>
              </select>
            </div>
          </div>

          {(formData.type === "series" || formData.type === "anime") && (
            <div className="col-span-2">
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-zinc-400 uppercase text-[10px] tracking-widest">
                Temporada Actual
              </label>
              <input
                type="number"
                min="1"
                className="w-full p-4 rounded-2xl bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-black outline-none transition-all font-bold dark:bg-zinc-800 dark:ring-zinc-700 dark:text-white dark:focus:ring-white"
                value={formData.season}
                onChange={(e) =>
                  setFormData({ ...formData, season: Number(e.target.value) })
                }
              />
            </div>
          )}

          {/* LÓGICA DE PROGRESO SEGÚN TIPO */}
          {formData.type === "music" ? (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
              {/* ARTISTA O BANDA */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400 uppercase mb-2">
                  Artista o Banda
                </label>
                <input
                  placeholder="Ej: Mozart, Bach..."
                  className="w-full p-4 rounded-2xl bg-gray-50 ring-1 ring-gray-200 focus:ring-2 focus:ring-black outline-none transition-all dark:bg-zinc-800 dark:ring-zinc-700 dark:text-white dark:focus:ring-white"
                  value={formData.artist || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, artist: e.target.value })
                  }
                />
              </div>
              {/* INPUT DE ALBUM */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400 uppercase mb-2">
                  Álbum
                </label>
                <input
                  placeholder="Ej: Das mozart..."
                  className="w-full p-4 rounded-2xl bg-gray-50 ring-1 ring-gray-200 focus:ring-2 focus:ring-black outline-none transition-all dark:bg-zinc-800 dark:ring-zinc-700 dark:text-white dark:focus:ring-white"
                  value={formData.album || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, album: e.target.value })
                  }
                />
              </div>
              {/* LISTADO DE CANCIONES */}
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400 uppercase tracking-widest">
                  Listado de Canciones
                </label>
                <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full">
                  {formData.tracks.length} temas
                </span>
              </div>

              <MusicTrackManager
                tracks={formData.tracks}
                onChange={(newTracks) => {
                  setFormData({
                    ...formData,
                    tracks: newTracks,
                    progress: {
                      current: newTracks.filter((t) => t.completed).length,
                      total: newTracks.length || 1,
                    },
                  });
                }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-zinc-400">
                  Capítulo Actual
                </label>
                <input
                  type="number"
                  className="w-full p-4 rounded-2xl bg-gray-50 border-none ring-1 ring-gray-200 outline-none dark:bg-zinc-800 dark:ring-zinc-700 dark:text-white dark:focus:ring-white"
                  value={formData.progress.current}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      progress: {
                        ...formData.progress,
                        current: Number(e.target.value),
                      },
                    });
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-zinc-400">
                  Total
                </label>
                <input
                  type="number"
                  className="w-full p-4 rounded-2xl bg-gray-50 border-none ring-1 ring-gray-200 outline-none dark:bg-zinc-800 dark:ring-zinc-700 dark:text-white dark:focus:ring-white"
                  value={formData.progress.total}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      progress: {
                        ...formData.progress,
                        total: Number(e.target.value),
                      },
                    });
                  }}
                />
              </div>
            </div>
          )}

          {itemToEdit &&
            (formData.type === "series" || formData.type === "anime") && (
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    ...formData,
                    season: formData.season + 1,
                    progress: { current: 0, total: 12 },
                  });
                }}
                className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-xs font-bold text-gray-400 hover:border-black hover:text-black transition-all 
                        dark:border-zinc-700 dark:text-zinc-500 dark:hover:border-white dark:hover:text-white"
              >
                + COMENZAR NUEVA TEMPORADA
              </button>
            )}

          <button
            type="submit"
            className="w-full p-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all mt-4 
             bg-black text-white hover:bg-zinc-800 shadow-lg shadow-black/10
             dark:bg-zinc-800 dark:text-zinc-100 dark:border dark:border-zinc-700 
             dark:hover:bg-zinc-700 dark:hover:border-zinc-600 dark:shadow-none"
          >
            <Save size={20} className="dark:text-emerald-400" />
            {itemToEdit ? "Guardar Cambios" : "Guardar en Biblioteca"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ItemModal;
