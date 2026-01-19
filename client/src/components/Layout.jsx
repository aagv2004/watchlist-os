import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { Torii } from "./Torii.jsx";
import {
  LayoutDashboard,
  Film,
  Tv,
  Music,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Layout = ({ children }) => {
  const { logout, user } = useContext(AuthContext);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/dashboard",
    },
    { name: "Películas", icon: <Film size={20} />, path: "/movies" },
    { name: "Series", icon: <Tv size={20} />, path: "/series" },
    { name: "Música", icon: <Music size={20} />, path: "/music" },
    {
      name: "Animes",
      icon: <Torii className="h-5 w-5 stroke-[1.75]" />,
      path: "/animes",
    },
  ];

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    if (isProfileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unser";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isProfileOpen]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
      {/* SIDEBAR */}

      {/* Sidebar Header */}
      <aside className="w-full md:w-64 bg-white border-b md:border-r border-gray-100 flex-shrink-0 md:fixed md:inset-y-0 md:left-0 z-20 flex flex-col dark:bg-zinc-950 dark:border-zinc-800">
        {/* SECCIÓN DEL LOGO + USER INFO MÓVIL */}
        <div className="p-4 inset-0 flex flex-row md:flex-col items-center md:items-start justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-300">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              </div>
              <div className="absolute inset-0 bg-black/20 rounded-full blur-md -z-0 group-hover:blur-xl transition-all" />
            </div>

            <div className="flex flex-col">
              <h1 className="font-black text-xl tracking-tighter leading-none dark:text-white">
                WATCHLIST
              </h1>
              <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] leading-none mt-1">
                SYSTEM OS
              </span>
            </div>
          </div>

          {/* Info de usuario MÓVIL - VERSION MINIMALISTA */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsProfileOpen(true)} // Necesitaremos este estado
              onPointerDown={(e) => e.stopPropagation()}
              className="flex items-center gap-2 p-1.5 pr-3 bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl active:scale-95 transition-all"
            >
              <div className="w-8 h-8 bg-black dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black font-black text-xs">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold dark:text-white">Perfil</span>
            </button>
          </div>
        </div>

        {/* MENU: Scroll horizontal en móvil, Vertical en PC */}
        <nav className="flex flex-row md:flex-col gap-2 p-2 px-4 md:p-4 overflow-x-auto md:overflow-y-auto no-scrollbar">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 md:py-3 rounded-xl transition-all whitespace-nowrap ${
                location.pathname === item.path
                  ? "bg-black text-white shadow-lg shadow-gray-200 dark:bg-white dark:text-black"
                  : "text-gray-500 hover:bg-gray-50 hover:text-black dark:hover:bg-gray-200 dark:text-gray-400"
              }`}
            >
              {item.icon}
              <span className="font-medium text-sm md:text-base">
                {item.name}
              </span>
            </Link>
          ))}
        </nav>

        {/* BOTÓN SALIR: Se oculta en el flujo principal en móvil o se adapta */}
        <div className="mt-auto p-4 border-t border-gray-50 dark:border-zinc-800 hidden md:block dark:text-white">
          <div className="px-4 py-2 mb-2">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
              Usuario
            </p>
            <p className="font-medium truncate">{user?.username}</p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 transition-colors"
            title={darkMode ? "Modo Claro" : "Modo Oscuro"}
          >
            {darkMode ? (
              <Sun size={18} className="text-yellow-500" />
            ) : (
              <Moon size={18} />
            )}
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Salir</span>
          </button>
        </div>
      </aside>

      <div className="hidden md:block md:w-64 flex-shrink-0" />

      {/* Perfil Drawer para Móvil */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-[999] md:hidden">
          {/* Fondo oscuro traslúcido */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsProfileOpen(false)}
          />

          {/* El Menú que sube */}
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-950 rounded-t-[3rem] p-8 pb-12 animate-in slide-in-from-bottom duration-300 border-t border-gray-100 dark:border-zinc-800">
            {/* Rayita decorativa para cerrar */}
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full mx-auto mb-8" />

            <div className="flex flex-col gap-6">
              {/* Info del Usuario */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-black dark:bg-white rounded-3xl flex items-center justify-center text-white dark:text-black text-2xl font-black">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Online
                    </span>
                  </div>
                  <h2 className="text-xl font-black dark:text-white truncate max-w-[200px]">
                    {user?.username}
                  </h2>
                </div>
              </div>

              <div className="h-[1px] bg-gray-100 dark:bg-zinc-900 w-full" />

              {/* Opciones de Accesibilidad */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 active:scale-95 transition-all"
                >
                  {darkMode ? (
                    <>
                      <Sun className="text-yellow-500" size={24} />
                      <span className="text-xs font-bold dark:text-white">
                        Modo Claro
                      </span>
                    </>
                  ) : (
                    <>
                      <Moon className="text-gray-400" size={24} />
                      <span className="text-xs font-bold text-gray-600">
                        Modo Oscuro
                      </span>
                    </>
                  )}
                </button>

                <button
                  onClick={logout}
                  className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 active:scale-95 transition-all group"
                >
                  <LogOut
                    className="text-red-500 group-hover:translate-x-1 transition-transform"
                    size={24}
                  />
                  <span className="text-xs font-bold text-red-600">
                    Cerrar Sesión
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL o Principal Layout (lo que se ve al lado del sidebarXD) */}
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-5xl mx-auto dark:text-white">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
