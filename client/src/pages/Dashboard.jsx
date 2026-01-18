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

      try {
        // 3. Llamada a la API
        await api.put(`/items/${item._id}`, {
          progress: { ...item.progress, current: newCurrent },
          status: newStatus,
        });

        fetchItems();
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
        Swal.fire("Error", "No se pudo actualizar el progreso", "error");
      }
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar elemento?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000000",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      borderRadius: "24px",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/items/${id}`);
        fetchItems();
        Swal.fire({
          title: "¡Eliminado!",
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
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

  return (
    <>
      <div className="space-y-6 pb-20">
        {/* Header de dashboard */}
        <header className="flex justify-between items-center ">
          <div>
            {/* Titulo según sección */}
            <h1 className="text-3xl font-black tracking-tight">
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {filteredItems.length} Elementos en total.
            </p>
            {items.filter((i) => i.status === "dropped" || i.isInactive)
              .length > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 rounded-full border-red-100 dark:bg-red-900/20 dark:border-red-900/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-50"></span>
                </span>
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">
                  {
                    items.filter((i) => i.status === "dropped" || i.isInactive)
                      .length
                  }{" "}
                  Abandonadas
                </p>
              </div>
            )}
          </div>

          {/* Separador */}
          <div className="w-[1px] h-6 bg-gray-100 mx-10" />

          {/* BARRA DE BÚSQUEDA */}
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              placeholder="Buscar en mi colección..."
              className="w-full bg-transparent p-2 pl-10 text-sm outline-none placeholder:text-gray-300 dark:text-white dark:placeholder:text-zinc-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              className="absolute left-3 text-gray-300 dark:text-zinc-500"
              size={16}
            />
          </div>

          {/* FILTRO DE ESTADOS O STATUS */}
          <div className="relative w-full md:w-auto">
            {/* BOTÓN FILTRO DE ESTADO */}
            <button
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 ${
                statusFilter !== "all"
                  ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                  : "bg-white text-gray-700 border-gray-100 hover:border-gray-300 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
              }`}
            >
              {/* DISEÑO DE OPCIONES FILTRO DE ESTADO */}
              <div
                className={`w-2.5 h-2.5 rounded-full shadow-sm ${
                  statusFilter === "pending"
                    ? "bg-purple-400"
                    : statusFilter === "watching"
                      ? "bg-amber-400"
                      : statusFilter === "completed"
                        ? "bg-emerald-400"
                        : "bg-gray-400"
                }`}
              />
              {/* SPAN QUE CAMBIA EL TITULO DEL BOTÓN DE FILTRO DE ESTADO */}
              <span className="text-xs font-bold hidden sm:block">
                {statusFilter === "all"
                  ? "Filtrar por estado"
                  : statusTranslation[statusFilter]}
              </span>
              {/* ICONO */}
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-300 ${isStatusOpen ? "rotate-180" : ""}`}
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

            {/* OPCIONES LÓGICAS DEL FILTRO DE ESTADOS DE ARRIBA */}
            {isStatusOpen && (
              <>
                {/* Capa invisible para cerrar al hacer clic fuera??? */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsStatusOpen(false)}
                />

                <div
                  className="absolute mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden 
                dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-2xl dark:shadow-black"
                >
                  {[
                    {
                      id: "all",
                      label: "Todos los estados",
                      icon: "bg-gray-400",
                    },
                    { id: "pending", label: "Por ver", icon: "bg-purple-400" },
                    { id: "watching", label: "Viendo", icon: "bg-amber-400" },
                    {
                      id: "completed",
                      label: "Completado",
                      icon: "bg-emerald-400",
                    },
                    { id: "dropped", label: "Abandonado", icon: "bg-red-400" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setStatusFilter(option.id);
                        setIsStatusOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-all ${
                        statusFilter === option.id
                          ? "text-black font-bold dark:hover:bg-zinc-800 dark:text-white"
                          : "text-gray-500 hover:bg-gray-50 hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${option.icon} ${statusFilter === option.id ? "ring-4 ring-black/5 dark:ring-white/10" : ""}`}
                        style={{
                          boxShadow:
                            statusFilter === option.id
                              ? `0 0 10px ${option.icon.replace("bg-", "")}`
                              : "none",
                        }}
                      />
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </header>

        {/* INICIO CARDS DINÁMICAS */}
        {loading ? (
          <p className="text-gray-400 animate-pulse dark:text-zinc-500 font-medium text-center py-20">
            Cargando...
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* CARDS DINÁMICAS HEADER */}
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-gray-50 dark:bg-zinc-800 rounded-xl text-gray-600 dark:text-gray-400">
                    {item.type === "movie" && <Film size={18} />}
                    {item.type === "series" && <Tv size={18} />}
                    {item.type === "music" && <Mic size={18} />}
                    {item.type === "anime" && (
                      <Torii className="h-5 w-5 stroke-[1.75]" />
                    )}
                  </div>
                  {item.rating > 0 && (
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-lg dark:bg-amber-900/20 dark:text-amber-400">
                      <Star size={12} className="fill-amber-600" />
                      <span className="text-xs font-black">{item.rating}</span>
                    </div>
                  )}

                  {item.type !== "music" && (
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full 
                      ${
                        item.status === "completed"
                          ? "bg-emerald-50 text-emerald-600"
                          : item.status === "watching"
                            ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                            : item.status === "dropped"
                              ? "bg-red-50 text-red-600"
                              : "bg-purple-50 text-purple-600"
                      }`}
                    >
                      {statusTranslation[item.status] || item.status}
                    </span>
                  )}

                  {item.isInactive && (
                    <span className="flex items-center gap-1 text-[9px] text-red-500 font-black animate-pulse">
                      <Clock size={10} /> INACTIVO HACE +30 DÍAS
                    </span>
                  )}
                </div>
                <h3
                  className="font-bold text-lg truncate cursor-pointer transition-colors dark:text-white"
                  onClick={() => {
                    if (item.type === "music") {
                      setSelectedItemForLyrics(item);
                    } else {
                      handleEditClick(item);
                    }
                  }}
                >
                  {(item.type === "series" || item.type === "anime") && (
                    <span className="shrink-0 text-[10px] bg-black text-white px-2 m-2 py-0.5 rounded-md font-black">
                      S{Number(item.season) || 1}
                    </span>
                  )}
                  {item.type === "music" ? (
                    // NOMBRE DEL ARTISTA
                    <div className="flex flex-col mb-1">
                      <span className="text-black dark:text-white font-bold leading-tight">
                        {item.artist || item.title || "Artista Desconocido"}
                      </span>

                      {/* NOMBRE DEL ALBUM */}
                      {item.album && (
                        <span className="text-[11px] text-gray-400 dark:text-zinc-500 font-semibold mt-1.5 uppercase tracking-wider truncate">
                          {item.album}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="truncate">{item.title}</span>
                  )}
                </h3>

                {item.type === "music" && item.tracks?.length > 0 && (
                  <div className="mb-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-1">
                      {item.tracks.slice(0, 4).map((track, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-zinc-400"
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${track.completed ? "bg-emerald-400" : "bg-gray-300 dark:bg-zinc-700"}`}
                          />
                          <span className="truncate">{track.title}</span>
                        </div>
                      ))}
                      {item.tracks.length > 4 && (
                        <p className="text-[9px] text-gray-400 dark:text-zinc-500 font-bold pl-1 uppercase tracking-tighter">
                          + {item.tracks.length - 4} canciones más
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Barra de progreso */}
                {item.progress && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 dark:text-zinc-500">
                      <span className="tracking-widest">
                        {item.type === "music" ? "PROGRESO" : "EPISODIOS"}
                      </span>
                      {/* Si no hay progreso definido, mostramos 0/1 por defecto */}
                      <div className="flex items-center gap-2">
                        <span>
                          {item.progress?.current || 0} /{" "}
                          {item.progress?.total || 1}
                        </span>
                      </div>

                      {/* Botón de incremento rápido (Solo si no está completado) */}
                      {item.status !== "completed" && item.type !== "music" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Función nueva: evita conflictos si luego hacemos clic en la tarjeta.
                            handleQuickUpdate(item);
                          }}
                          className="p-1 bg-gray-100 hover:bg-black hover:text-white rounded-md transition-all group 
                          dark:bg-zinc-800 dark:hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-black"
                          title="Siguiente capítulo"
                        >
                          <PlusCircle
                            size={14}
                            className="group-active:scale-90"
                          />
                        </button>
                      )}
                    </div>

                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden dark:bg-zinc-800">
                      <div
                        className="bg-black h-full transition-all duration-700 ease-out dark:bg-zinc-100"
                        style={{
                          width: `${((item.progress?.current || 0) / (item.progress?.total || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
                <div className="mt-4 flex items-center gap-2 text-gray-400 text-sm">
                  {new Date() - new Date(item.createdAt) < 60 * 60 * 1000 && (
                    <div className="flex items-center gap-1 text-emerald-500 font-bold text-[10px]">
                      <Clock size={12} />
                      <span>Recien agregado</span>
                    </div>
                  )}
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="ml-auto p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
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
        />
      )}
    </>
  );
};

export default Dashboard;
