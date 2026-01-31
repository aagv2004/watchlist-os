import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  PlusCircle,
  Film,
  Tv,
  Music,
  Clock,
  Trash2,
  Search,
  Star,
  Mic,
  Sun,
  Moon,
  Edit3,
} from "lucide-react";
import Swal from "sweetalert2";
import api from "../api/axios.js";
import ItemModal from "../components/ItemModal.jsx";
import { Torii } from "../components/Torii.jsx";
import MusicLyricsView from "../components/MusicLyricsView.jsx";

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemToEdit, setItemToEdit] = useState(null);
  const location = useLocation();
  const [statusFilter, setStatusFilter] = useState("all");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [hasNotifiedInactive, setHasNotifiedInactive] = useState(false);
  const [selectedItemForLyrics, setSelectedItemForLyrics] = useState(null);

  const fetchItems = async () => {
    try {
      const { data } = await api.get("/items");
      setItems(data);
    } catch (error) {
      console.error("Error al traer items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setItemToEdit(null);
  };

  const handleQuickUpdate = async (item) => {
    // 1. Evitar que suba más allá del total
    if (item.progress.current < item.progress.total) {
      const newCurrent = item.progress.current + 1;

      // 2. Lógica de estado automática
      let newStatus = item.status;
      if (newCurrent === item.progress.total) {
        newStatus = "completed";
      } else {
        newStatus = "watching";
      }

      // OPTIMISTIC UI: Actualizamos visualmente ANTES de ir al servidor
      // Esto hace que la app se sienta instantánea ⚡️
      setItems((prevItems) =>
        prevItems.map((i) =>
          i._id === item._id
            ? {
                ...i,
                status: newStatus,
                progress: { ...i.progress, current: newCurrent },
              }
            : i,
        ),
      );

      try {
        // 3. Llamada a la API (en segundo plano)
        await api.put(`/items/${item._id}`, {
          progress: { ...item.progress, current: newCurrent },
          status: newStatus,
        });

        // No necesitamos fetchItems() aquí si confiamos en nuestra actualización optimista
        // fetchItems();

        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
        Toast.fire({
          icon: "success",
          title: `¡Avanzaste a ${newCurrent}/${item.progress.total}!`,
        });
      } catch (error) {
        console.error("Error al actualizar", error);
        // Si falla, revertimos los cambios (Rollback)
        setItems((prevItems) =>
          prevItems.map((i) => (i._id === item._id ? item : i)),
        );
        Swal.fire("Error", "No se pudo actualizar el progreso", "error");
      }
    }
  };

  // SMART STATUS UPDATE (Música)
  const handleSmartStatusUpdate = async (item, newStatus) => {
    // 1. Optimistic Update Local
    const updatedItems = items.map((i) =>
      i._id === item._id ? { ...i, status: newStatus } : i,
    );
    setItems(updatedItems);

    // 2. Call API
    try {
      await api.put(`/items/${item._id}`, { status: newStatus });
    } catch (error) {
      console.error("Error smart update", error);
      fetchItems(); // Revertir si falla
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar?",
      text: "No podrás deshacer esto.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000000",
      cancelButtonColor: "#f3f4f6",
      confirmButtonText: "Sí, borrar",
      cancelButtonText: "Cancelar",
      reverseButtons: false, // Borrar a la izquierda, Cancelar a la derecha
      focusCancel: true,

      // PERSONALIZACIÓN VISUAL PARA QUE NO SEA INVASIVO
      background: document.documentElement.classList.contains("dark")
        ? "#18181b"
        : "#ffffff",
      color: document.documentElement.classList.contains("dark")
        ? "#ffffff"
        : "#000000",
      customClass: {
        popup:
          "rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-2xl",
        confirmButton:
          "bg-black text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform dark:bg-white dark:text-black",
        cancelButton:
          "bg-gray-100 text-gray-500 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors dark:bg-zinc-800 dark:text-gray-400 dark:hover:bg-zinc-700 dark:hover:text-white ml-3",
        title: "text-xl font-black",
      },
      buttonsStyling: false, // Importante para que tome nuestras clases
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/items/${id}`);
        fetchItems();
        Swal.fire({
          title: "¡Eliminado!",
          text: "El item ha sido borrado correctamente.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          color: "#000",
          background: "#fff",
          customClass: {
            popup:
              "rounded-3xl shadow-2xl border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white",
            title: "text-xl font-black",
          },
        });
      } catch (error) {
        Swal.fire("Error", `No se pudo eliminar: ${error}`, "error");
      }
    }
  };

  const processedItems = items.map((item) => {
    // Datos de fecha normales
    const lastDate = item.updatedAt || item.createdAt || new Date();
    const lastUpdate = new Date(lastDate);
    const now = new Date();
    const diffDays = Math.ceil(
      Math.abs(now - lastUpdate) / (1000 * 60 * 60 * 24),
    );

    // PRUEBA DEFINITIVA:
    // Si el título contiene la palabra "Prueba" o si quieres forzarlo a TODOS:
    // Cambia 'false' por 'true' para ver el efecto en toda la lista
    const forceTest = false;

    if (
      forceTest ||
      (["watching", "pending"].includes(item.status) &&
        item.type !== "movie" &&
        diffDays > 30)
    ) {
      return { ...item, isInactive: true, status: "dropped" };
    }
    return item;
  });

  const filteredItems = processedItems
    .filter((item) => {
      // Filtro por categoría (URL)
      const matchesCategory =
        location.pathname === "/dashboard" ||
        (location.pathname === "/movies" && item.type === "movie") ||
        (location.pathname === "/series" && item.type === "series") ||
        (location.pathname === "/music" && item.type === "music") ||
        (location.pathname === "/animes" && item.type === "anime");

      // Filtro por estado
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      // Filtro por búsqueda
      const matchesSearch = item.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchesCategory && matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      const priority = {
        watching: 1,
        pending: 2,
        completed: 3,
        dropped: 4,
      };

      if (priority[a.status] === priority[b.status]) {
        return (
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updateAt || a.createdAt)
        );
      }

      return priority[a.status] - priority[b.status];
    });

  const statusTranslation = {
    pending: "Por ver",
    watching: "Viendo",
    completed: "Completado",
    dropped: "Abandonado",
  };

  const musicStatusTranslation = {
    pending: "Por escuchar",
    watching: "Escuchando",
    completed: "Escuchado",
    dropped: "Archivado",
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    // Solo actuamos si ya terminó de cargar, hay items y NO hemos notificado aún
    if (!loading && items.length > 0 && !hasNotifiedInactive) {
      const abandonedCount = processedItems.filter((i) => i.isInactive).length;

      if (abandonedCount > 0) {
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 4000,
          timerProgressBar: true,
        });

        Toast.fire({
          icon: "info",
          title: `¡Atención!`,
          text: `Tienes ${abandonedCount} series en estado abandonado.`,
        });

        // Marcamos que ya notificamos para que no vuelva a salir hasta que recargue la página
        setHasNotifiedInactive(true);
      }
    }
  }, [loading, items.length, processedItems, hasNotifiedInactive]);

  const handleLyricsSave = async (originalItem, updatedTracks) => {
    // 1. Optimistic Update (UI immediata)
    const updatedItem = { ...originalItem, tracks: updatedTracks };

    setItems((prev) =>
      prev.map((i) => (i._id === originalItem._id ? updatedItem : i)),
    );
    if (selectedItemForLyrics?._id === originalItem._id) {
      setSelectedItemForLyrics(updatedItem);
    }

    // 2. Persistencia Backend
    try {
      await api.put(`/items/${originalItem._id}`, { tracks: updatedTracks });

      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      Toast.fire({ icon: "success", title: "¡Letra guardada!" });
    } catch (error) {
      console.error("Error saving lyrics", error);
      Swal.fire("Error", "No se pudo guardar la letra", "error");
      fetchItems(); // Revertir
    }
  };

  return (
    <>
      <div className="space-y-6 pb-20">
        {/* Header de dashboard responsivo */}
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight dark:text-white">
                {location.pathname === "/dashboard"
                  ? "Tu Biblioteca"
                  : location.pathname === "/movies"
                    ? "Películas"
                    : location.pathname === "/series"
                      ? "Series"
                      : location.pathname === "/music"
                        ? "Música"
                        : location.pathname === "/animes"
                          ? "Animes"
                          : location.pathname.replace("/", "")}
              </h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {filteredItems.length} Elementos en total.
              </p>
            </div>

            {/* Este es el indicador de "Abandonadas" para móvil (solo icono) */}
            {items.filter((i) => i.status === "dropped" || i.isInactive)
              .length > 0 && (
              <div className="flex md:hidden items-center gap-1.5 px-3 py-1 bg-red-50 rounded-full dark:bg-red-900/20 border border-red-100 dark:border-red-900/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[10px] font-black text-red-600">
                  {
                    items.filter((i) => i.status === "dropped" || i.isInactive)
                      .length
                  }
                </span>
              </div>
            )}
          </div>

          {/* Contenedor de Buscador y Filtros */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* BARRA DE BÚSQUEDA CORREGIDA */}
            <div className="relative w-full sm:w-64 group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-zinc-500 group-focus-within:text-black dark:group-focus-within:text-white transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Buscar en mi colección..."
                className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 pr-4 py-2.5 pl-10 text-sm rounded-xl outline-none focus:ring-2 ring-black/5 dark:ring-white/5 dark:text-white transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* FILTRO DE ESTADOS */}
            <div className="relative w-full sm:w-auto">
              <button
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className={`w-full flex items-center justify-between sm:justify-start gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
                  statusFilter !== "all"
                    ? "bg-black text-white border-black dark:bg-white dark:text-black"
                    : "bg-white text-gray-700 border-gray-100 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      statusFilter === "pending"
                        ? "bg-purple-400"
                        : statusFilter === "watching"
                          ? "bg-amber-400"
                          : statusFilter === "completed"
                            ? "bg-emerald-400"
                            : "bg-gray-400"
                    }`}
                  />
                  <span className="text-xs font-bold">
                    {statusFilter === "all"
                      ? "Estado"
                      : statusTranslation[statusFilter]}
                  </span>
                </div>
                <svg
                  className={`w-3.5 h-3.5 transition-transform ${isStatusOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Menú desplegable ajustado para móvil */}
              {isStatusOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsStatusOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-full sm:w-52 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 z-50 overflow-hidden">
                    {["all", "pending", "watching", "completed", "dropped"].map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setStatusFilter(status);
                            setIsStatusOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-3 ${
                            statusFilter === status
                              ? "bg-gray-50 dark:bg-zinc-800 text-black dark:text-white"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              status === "pending"
                                ? "bg-purple-400"
                                : status === "watching"
                                  ? "bg-amber-400"
                                  : status === "completed"
                                    ? "bg-emerald-400"
                                    : status === "dropped"
                                      ? "bg-red-400"
                                      : "bg-gray-400"
                            }`}
                          />
                          {status === "all"
                            ? "Todos"
                            : statusTranslation[status]}
                        </button>
                      ),
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* INICIO CARDS DINÁMICAS */}
        {loading ? (
          <p className="text-gray-400 animate-pulse dark:text-zinc-500 font-medium text-center py-20">
            Cargando...
          </p>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-1">
            {/* CARDS DINÁMICAS HEADER */}
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="group relative bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-[400px]"
              >
                {/* 1. IMAGEN DE FONDO (POSTER) */}
                <div className="absolute inset-0 z-0">
                  {item.type === "music" ? (
                    // DISEÑO ESPECIAL MÚSICA (VINILO) 💿
                    <div className="w-full h-full relative p-6 flex flex-col items-center justify-start pt-10 bg-gradient-to-br from-gray-900 to-black">
                      {/* VINILO GIRATORIO (Que sale al hover) */}
                      <div className="absolute top-10 w-48 h-48 rounded-full bg-black border-4 border-gray-800 shadow-xl group-hover:translate-x-12 group-hover:rotate-[360deg] transition-all duration-1000 ease-out z-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full border-4 border-gray-800 bg-gradient-to-tr from-pink-500 to-purple-500 opacity-80 animate-pulse"></div>
                        {/* Ranuras del vinilo */}
                        <div className="absolute inset-0 rounded-full border border-white/5"></div>
                        <div className="absolute inset-2 rounded-full border border-white/5"></div>
                        <div className="absolute inset-4 rounded-full border border-white/5"></div>
                      </div>

                      {/* CARÁTULA (Sobre el vinilo) */}
                      <div className="relative z-10 w-48 h-48 shadow-2xl rounded-lg overflow-hidden group-hover:-translate-x-6 transition-transform duration-500 ease-out">
                        {item.poster ? (
                          <img
                            src={item.poster}
                            className="w-full h-full object-cover"
                            alt=""
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <Music size={32} className="text-gray-600" />
                          </div>
                        )}
                      </div>

                      {/* Gradiente inferior oscuro */}
                      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/80 to-transparent z-20 pointer-events-none" />
                    </div>
                  ) : (
                    // DISEÑO ESTÁNDAR (VIDEO) 🎬
                    <>
                      {item.poster ? (
                        <img
                          src={item.poster}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 dark:bg-zinc-800 flex flex-col items-center justify-center p-6 text-center">
                          <Film
                            size={48}
                            className="text-gray-300 dark:text-zinc-700 mb-2"
                          />
                          <span className="text-xs font-bold text-gray-400 dark:text-zinc-600 uppercase tracking-widest">
                            Sin Portada
                          </span>
                        </div>
                      )}
                      {/* Gradiente para legibilidad */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-80" />
                    </>
                  )}
                </div>

                {/* 2. CONTENIDO (Z-INDEX SUPERIOR) */}
                <div className="relative z-10 flex flex-col h-full p-5 text-white">
                  {/* HEADER DE LA CARD: Badges SUPERIORES */}
                  <div className="flex justify-between items-start">
                    {/* Badge de TIPO */}
                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10">
                      {item.type === "movie" && (
                        <Film size={14} className="text-blue-400" />
                      )}
                      {item.type === "series" && (
                        <Tv size={14} className="text-purple-400" />
                      )}
                      {item.type === "music" && (
                        <Mic size={14} className="text-pink-400" />
                      )}
                      {item.type === "anime" && (
                        <Torii className="h-3.5 w-3.5 stroke-[2] text-red-400" />
                      )}

                      <span className="text-[10px] font-black uppercase tracking-wider">
                        {item.type === "movie"
                          ? "Cine"
                          : item.type === "series"
                            ? "Serie"
                            : item.type === "anime"
                              ? "Anime"
                              : "Música"}
                      </span>
                    </div>

                    {/* Badge de ESTADO (Solo si tiene) */}
                    {item.status && (
                      <span
                        className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10
                       ${
                         item.status === "completed"
                           ? "bg-emerald-500/20 text-emerald-300"
                           : item.status === "watching"
                             ? "bg-amber-500/20 text-amber-300"
                             : item.status === "dropped"
                               ? "bg-red-500/20 text-red-300"
                               : "bg-purple-500/20 text-purple-300"
                       }`}
                      >
                        {item.type === "music"
                          ? musicStatusTranslation[item.status]
                          : statusTranslation[item.status]}
                      </span>
                    )}
                  </div>

                  {/* CUERPO CENTRAL (Espaciador) */}
                  <div className="flex-1" />

                  {/* INFO PRINCIPAL (Titulo y Detalles) */}
                  <div className="mb-4 space-y-1">
                    {/* Temporada (Si aplica) */}
                    {(item.type === "series" || item.type === "anime") && (
                      <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-md mb-1">
                        <span className="text-[9px] font-bold tracking-widest uppercase">
                          TEMPORADA
                        </span>
                        <span className="text-[10px] font-black bg-white text-black px-1.5 rounded-sm">
                          {Number(item.season) || 1}
                        </span>
                      </div>
                    )}

                    <h3
                      className="font-black text-2xl leading-none tracking-tight line-clamp-2 cursor-pointer hover:text-gray-200 transition-colors"
                      onClick={() => {
                        if (item.type === "music") {
                          setSelectedItemForLyrics(item);
                          // SMART PLAY: Si está pendiente, pasa a "En rotación"
                          if (item.status === "pending") {
                            handleSmartStatusUpdate(item, "watching");
                          }
                        }
                      }}
                    >
                      {item.artist || item.title}
                    </h3>

                    {item.album && (
                      <p className="text-xs font-medium text-gray-300 uppercase tracking-widest line-clamp-1">
                        {item.album}
                      </p>
                    )}
                  </div>

                  {/* BARRA DE PROGRESO / CANCIONES */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/5 space-y-3">
                    {/* Caso MUSICA: Lista de tracks preview */}
                    {item.type === "music" ? (
                      <div className="text-[10px] space-y-1.5">
                        {item.tracks?.slice(0, 2).map((t, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-gray-300"
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${t.completed ? "bg-emerald-400" : "bg-white/20"}`}
                            />
                            <span className="truncate">{t.title}</span>
                          </div>
                        ))}
                        {item.tracks?.length > 2 && (
                          <span className="text-gray-500 text-[9px] block pl-3.5">
                            + {item.tracks.length - 2} canciones más...
                          </span>
                        )}
                        {(!item.tracks || item.tracks.length === 0) && (
                          <span className="text-gray-500 italic block text-center py-1">
                            Sin canciones aún
                          </span>
                        )}
                        {/* Footer MÚSICA: Editar / Borrar */}
                        <div className="pt-2 flex justify-end items-center gap-2 border-t border-white/5 mt-2">
                          <button
                            onClick={() => handleEditClick(item)}
                            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            title="Editar"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg transition-all"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Caso VIDEO: Barra de progreso
                      <>
                        <div className="flex justify-between items-end text-xs font-bold text-gray-300">
                          <span className="uppercase tracking-wider text-[9px] text-gray-400">
                            Progreso
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-white text-sm">
                              {item.progress?.current || 0}
                              <span className="text-gray-500 text-[10px] mx-0.5">
                                /
                              </span>
                              {item.progress?.total || 1}
                            </span>
                          </div>
                        </div>

                        <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700
                                ${item.progress?.current === item.progress?.total ? "bg-emerald-400" : "bg-white"}`}
                            style={{
                              width: `${((item.progress?.current || 0) / Math.max(item.progress?.total || 1, 1)) * 100}%`,
                            }}
                          />
                        </div>

                        {/* Botones de acción rápida */}
                        <div className="pt-1 flex justify-between items-center">
                          {/* Botón +1 : Solo si no está completo */}
                          {item.progress?.current < item.progress?.total ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickUpdate(item);
                              }}
                              className="flex items-center gap-1.5 bg-white text-black px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-gray-200 transition-colors"
                            >
                              <PlusCircle size={12} />
                              Visto
                            </button>
                          ) : (
                            <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                              <Star size={10} className="fill-current" />{" "}
                              Completado
                            </div>
                          )}

                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditClick(item)}
                              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                              title="Editar"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg transition-all"
                              title="Eliminar"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl dark:border-zinc-800 dark:bg-zinc-900/50">
                <p className="text-gray-400 dark:text-zinc-500 font-medium italic">
                  No hay nada aquí todavía. ¡Empieza agregando algo!
                </p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 right-8 z-50 flex items-center group shadow-2xl"
        >
          <div className="absolute inset-0 bg-black/20 dark:bg-white/5 rounded-full -z-10 group-hover:bg-black/40 transition-all duration-500" />
          <div className="bg-black dark:bg-zinc-900 text-white flex items-center gap-3 px-6 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-white/10 dark:border-zinc-700/50">
            <PlusCircle
              size={24}
              className="group-hover:rotate-90 transition-transform duration-500 dark:text-emerald-400"
            />
            <span className="font-bold tracking-tight hidden md:block">
              Agregar Item
            </span>
          </div>
        </button>
      </div>
      {/* ✨El modal✨ */}
      <ItemModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onRefresh={fetchItems}
        itemToEdit={itemToEdit}
        key={isModalOpen ? itemToEdit?._id || "new" : "closed"}
      />
      {selectedItemForLyrics && (
        <MusicLyricsView
          item={selectedItemForLyrics}
          onClose={() => setSelectedItemForLyrics(null)}
          onEdit={(item) => {
            setSelectedItemForLyrics(null);
            handleEditClick(item);
          }}
          onSaveLyrics={handleLyricsSave}
        />
      )}
    </>
  );
};

export default Dashboard;
