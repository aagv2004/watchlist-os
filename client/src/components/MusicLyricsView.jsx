import { useState, useEffect } from "react";
import { X, Edit3 } from "lucide-react";

const MusicLyricsView = ({ item, onClose, onEdit }) => {
  const [activeTrack, setActiveTrack] = useState(item.tracks[0]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "unset");
  }, []);

  return (
    <div className="fixed inset-0 bg-white dark:bg-zinc-800/50 z-[10000] flex flex-col md:flex-row">
      {/* Grupo de botones */}
      <div className="absolute top-6 right-6 flex gap-2 z-50">
        <button
          onClick={() => onEdit(item)} // <--- Llama a la función de editar
          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full transition-colors flex items-center gap-2 px-4"
        >
          <Edit3 size={20} />
          <span className="text-xs font-bold">EDITAR</span>
        </button>

        <button
          onClick={onClose}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* LATERAL: Lista de temas */}
      <div className="w-full md:w-1/3 h-[40vh] md:h-full p-10 bg-gray-50 dark:bg-zinc-800/50 border-r border-gray-100 dark:border-zinc-700 overflow-y-auto">
        <span className="text-xs font-black text-blue-600 uppercase tracking-widest">
          Ahora escuchando
        </span>
        <h2 className="text-3xl font-black mt-2 leading-none dark:text-white">
          {item.artist}
        </h2>
        <p className="text-gray-400 font-medium mt-1">{item.album}</p>

        <div className="mt-10 space-y-4">
          {item.tracks.map((track, index) => (
            <div
              key={index}
              onClick={() => setActiveTrack(track)}
              className={`p-4 rounded-2xl cursor-pointer transition-all ${activeTrack?.title === track.title ? "bg-black text-white shadow-lg" : "hover:bg-gray-200"}`}
            >
              <p className="font-bold">{track.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PRINCIPAL: Las Letras */}
      <div className="flex-1 p-6 md:p-20 overflow-y-auto bg-white dark:bg-black flex justify-center dark:bg-zinc-800/50">
        <div className="max-w-2xl w-full">
          {activeTrack ? (
            <>
              <h1 className="text-4xl font-black mb-10 dark:text-white">
                {activeTrack.title}
              </h1>
              <pre className="whitespace-pre-wrap font-sans text-xl leading-relaxed text-gray-700 dark:text-gray-300">
                {activeTrack.lyrics ||
                  "Esta canción aún no tiene letra agregada..."}
              </pre>
            </>
          ) : (
            <p className="text-gray-300 text-center mt-20">
              Selecciona una canción para ver la letra
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicLyricsView;
