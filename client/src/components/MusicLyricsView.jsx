import { useState, useEffect, useRef } from "react";
import {
  X,
  Edit3,
  Save,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Check,
} from "lucide-react";
import Swal from "sweetalert2";

const MusicLyricsView = ({ item, onClose, onEdit, onSaveLyrics }) => {
  // Guardamos solo el Título para derivar el objeto actualizado de las props (item.tracks)
  const [activeTrackTitle, setActiveTrackTitle] = useState(
    item.tracks[0]?.title,
  );
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef(null);

  // Derivar el track activo siempre de la prop 'item' más reciente
  const activeTrack =
    item.tracks.find((t) => t.title === activeTrackTitle) || item.tracks[0];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "unset");
  }, []);

  // Ya no necesitamos el useEffect de sincronización porque 'activeTrack' se recalcula en cada render

  const handleFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    // Mantener el foco
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleSave = () => {
    if (!editorRef.current) return;

    // 1. Obtener HTML limpio
    let newContent = editorRef.current.innerHTML;

    // Básica sanitización (Evitar scripts inyectados)
    newContent = newContent
      .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "")
      .replace(/on\w+="[^"]*"/g, "");

    // 2. Actualizar tracks
    const updatedTracks = item.tracks.map((t) =>
      t.title === activeTrack.title ? { ...t, lyrics: newContent } : t,
    );

    // 3. Guardar arriba
    onSaveLyrics(item, updatedTracks);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex bg-black text-white overflow-hidden animate-in fade-in duration-300">
      {/* 1. LAYER DE FONDO (Álbum borroso dinámico) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-[-20%] bg-cover bg-center blur-[100px] opacity-60 scale-110 transition-all duration-1000"
          style={{ backgroundImage: `url(${item.poster})` }}
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* 2. CONTENIDO (Z-Index alto para estar sobre el fondo) */}
      <div className="relative z-10 w-full h-full flex flex-col md:flex-row backdrop-blur-3xl md:backdrop-blur-none">
        {/* BOTONES SUPERIORES */}
        <div className="absolute top-6 right-6 flex gap-3 z-50">
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-black/20 hover:bg-white/10 hover:rotate-90 backdrop-blur-md border border-white/5 transition-all duration-300 text-white/70 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* --- COLUMNA IZQ: TRACKLIST & PORTADA --- */}
        <div className="w-full md:w-[400px] flex flex-col p-8 md:p-10 border-b md:border-b-0 md:border-r border-white/10 bg-black/20 backdrop-blur-md h-[40vh] md:h-full overflow-hidden">
          {/* Portada visible nítida (Estática Premium) */}
          <div className="hidden md:block w-56 h-56 rounded-2xl shadow-2xl overflow-hidden mb-10 self-center md:self-start ring-1 ring-white/10 group relative">
            <img
              src={item.poster}
              alt={item.album}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>

          <div className="mb-6">
            <h2 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-white mb-2 line-clamp-2">
              {item.artist}
            </h2>
            <p className="text-white/50 text-lg font-medium tracking-wide line-clamp-1">
              {item.album}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-1">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">
              Tracklist
            </p>
            {item.tracks.map((track, index) => (
              <button
                key={index}
                onClick={() => {
                  if (isEditing) {
                    if (confirm("Estás editando. ¿Salir sin guardar?")) {
                      setIsEditing(false);
                      setActiveTrackTitle(track.title);
                    }
                  } else {
                    setActiveTrackTitle(track.title);
                  }
                }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 group flex items-center gap-3
                    ${
                      activeTrack?.title === track.title
                        ? "bg-white/20 text-white shadow-lg shadow-black/20 border border-white/10"
                        : "hover:bg-white/5 text-white/60 hover:text-white border border-transparent"
                    }`}
              >
                <span
                  className={`text-xs font-bold ${activeTrack?.title === track.title ? "text-white" : "text-white/30 group-hover:text-white/50"}`}
                >
                  {(index + 1).toString().padStart(2, "0")}
                </span>
                <span className="font-semibold text-sm truncate">
                  {track.title}
                </span>
                {track.lyrics && (
                  <div
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-white/40"
                    title="Tiene letra"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* --- COLUMNA DER: LETRAS --- */}
        <div className="flex-1 overflow-y-auto relative custom-scrollbar scroll-smooth">
          <div className="min-h-full flex flex-col items-center justify-center p-8 md:p-20 pb-40 relative">
            {activeTrack ? (
              <div className="max-w-3xl w-full text-center animate-in fade-in slide-in-from-bottom-4 duration-500 key={activeTrack.title}">
                {/* HEADER CANCIÓN */}
                <div className="flex flex-col items-center mb-10">
                  <span className="inline-block text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mb-4 border border-white/10 px-3 py-1 rounded-full">
                    Ahora sonando
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-2xl mb-4">
                    {activeTrack.title}
                  </h1>

                  {/* BOTONES DE ACCIÓN (Editar / Guardar) */}
                  <div className="h-10">
                    {" "}
                    {/* Espaciador fijo para evitar saltos */}
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
                      >
                        <Edit3 size={12} /> Editar Letra
                      </button>
                    ) : (
                      /* BARRA DE HERRAMIENTAS EDITOR */
                      <div className="flex items-center gap-2 animate-in zoom-in duration-300 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 shadow-2xl">
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleFormat("bold");
                          }}
                          className="p-1.5 hover:bg-white/20 rounded-md text-white/70 hover:text-white transition-colors"
                          title="Negrita"
                        >
                          <Bold size={14} />
                        </button>
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleFormat("italic");
                          }}
                          className="p-1.5 hover:bg-white/20 rounded-md text-white/70 hover:text-white transition-colors"
                          title="Cursiva"
                        >
                          <Italic size={14} />
                        </button>
                        <div className="w-px h-4 bg-white/10 mx-1"></div>
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleFormat("justifyLeft");
                          }}
                          className="p-1.5 hover:bg-white/20 rounded-md text-white/70 hover:text-white transition-colors"
                          title="Izquierda"
                        >
                          <AlignLeft size={14} />
                        </button>
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleFormat("justifyCenter");
                          }}
                          className="p-1.5 hover:bg-white/20 rounded-md text-white/70 hover:text-white transition-colors"
                          title="Centro"
                        >
                          <AlignCenter size={14} />
                        </button>
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleFormat("justifyRight");
                          }}
                          className="p-1.5 hover:bg-white/20 rounded-md text-white/70 hover:text-white transition-colors"
                          title="Derecha"
                        >
                          <AlignRight size={14} />
                        </button>
                        <div className="w-px h-4 bg-white/10 mx-1 hidden md:block"></div>

                        <button
                          onClick={() => setIsEditing(false)}
                          className="p-1.5 hover:bg-red-500/20 text-white/50 hover:text-red-400 rounded-full transition-colors"
                          title="Cancelar"
                        >
                          <X size={14} />
                        </button>

                        <button
                          onClick={handleSave}
                          className="ml-2 flex items-center gap-2 px-4 py-1.5 bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-all text-xs font-black uppercase tracking-wider shadow-lg shadow-white/10"
                        >
                          <Save size={12} /> Guardar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* CONTENEDOR DE LETRA */}
                <div className="relative">
                  {isEditing ? (
                    <div
                      ref={editorRef}
                      className="text-xl md:text-2xl leading-relaxed font-medium text-white/90 outline-none min-h-[50vh] p-4 rounded-xl border-2 border-dashed border-white/20 focus:border-white/50 bg-black/20"
                      contentEditable
                      suppressContentEditableWarning
                      dangerouslySetInnerHTML={{
                        __html: activeTrack.lyrics
                          ? activeTrack.lyrics.replace(/\n/g, "<br/>")
                          : "",
                      }}
                    />
                  ) : (
                    <div className="space-y-8 animate-in fade-in duration-500">
                      {activeTrack.lyrics ? (
                        // Si detectamos HTML (tags <br> o <p>), renderizamos HTML. Si no, fallback a split texto plano antiguo
                        /<[a-z][\s\S]*>/i.test(activeTrack.lyrics) ? (
                          <div
                            className="text-xl md:text-2xl leading-relaxed font-medium text-white/90 drop-shadow-md [&>div]:mb-4"
                            dangerouslySetInnerHTML={{
                              __html: activeTrack.lyrics,
                            }}
                          />
                        ) : (
                          // Fallback legacy (texto plano)
                          activeTrack.lyrics.split("\n\n").map((verse, i) => (
                            <p
                              key={i}
                              className="text-xl md:text-2xl leading-relaxed font-medium text-white/90 drop-shadow-md mb-8"
                            >
                              {verse.split("\n").map((line, j) => (
                                <span key={j} className="block mb-1">
                                  {line}
                                </span>
                              ))}
                            </p>
                          ))
                        )
                      ) : (
                        <div className="flex flex-col items-center py-20 text-white/30">
                          <span className="text-4xl mb-4 opacity-50">😶</span>
                          <p className="text-lg font-medium">
                            No hay letra disponible
                          </p>
                          <p className="text-sm mt-2">
                            Haz click en "Editar Letra" para escribirla.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-white/30 flex items-center gap-2 text-lg">
                <Music size={20} /> Selecciona una canción
              </p>
            )}

            {/* Espacio extra abajo para scroll cómodo */}
            <div className="h-20" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicLyricsView;
