import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Film, Tv, Mic } from "lucide-react";
import { Torii } from "./Torii.jsx";

const NavMobile = () => {
  const location = useLocation();

  const tabs = [
    { to: "/dashboard", label: "Todo", icon: LayoutDashboard },
    { to: "/movies", label: "Películas", icon: Film },
    { to: "/series", label: "Series", icon: Tv },
    { to: "/music", label: "Música", icon: Mic },
    { to: "/animes", label: "Animes", icon: "anime" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm px-3 py-2">
      <div className="flex items-center gap-1">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.to;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`flex items-center justify-center rounded-full transition-all duration-300 ${
                isActive
                  ? "flex-[1.6] bg-black text-white px-3 py-2 dark:bg-white dark:text-black"
                  : "flex-1 text-gray-400 px-2 py-2"
              }`}
            >
              {tab.icon === "anime" ? (
                <Torii
                  className={`h-5 w-5 ${
                    isActive ? "text-red-400" : "text-gray-400"
                  }`}
                />
              ) : (
                <tab.icon
                  className={`h-5 w-5 ${
                    isActive ? "text-white dark:text-black" : "text-gray-400"
                  }`}
                />
              )}

              {isActive && (
                <span className="ml-2 text-[11px] font-semibold truncate">
                  {tab.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default NavMobile;
