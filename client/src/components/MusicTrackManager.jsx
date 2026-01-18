import { Plus, Trash2, Music, AlignLeft } from "lucide-react";
import { useState } from "react";

const MusicTrackManager = ({ tracks, onChange }) => {
  const [newTrackName, setNewTrackName] = useState("");

  const addTrack = () => {
    if (!newTrackName.trim()) return;
    const newTrack = {
      title: newTrackName,
      completed: false,
      lyrics: "",
    };
    onChange([...tracks, newTrack]);
    setNewTrackName("");
  };

  const toggleTrack = (index) => {
    const updated = tracks.map((t, i) =>
      i === index ? { ...t, completed: !t.completed } : t,
    );
    onChange(updated);
  };

  const removeTrack = (index) => {
    onChange(tracks.filter((_, i) => i !== index));
  };

  const updateLyrics = (index, lyrics) => {
    const updated = tracks.map((t, i) => (i === index ? { ...t, lyrics } : t));
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Nombre de la canción..."
          className="flex-1 p-3 rounded-xl bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-black outline-none text-sm 
                     dark:bg-zinc-800 dark:ring-zinc-700 dark:text-white dark:focus:ring-white dark:placeholder:text-zinc-500"
          value={newTrackName}
          onChange={(e) => setNewTrackName(e.target.value)}
          onKeyPress={(e) =>
            e.key === "Enter" && (e.preventDefault(), addTrack())
          }
        />
        <button
          type="button"
          onClick={addTrack}
          className="p-3 bg-black text-white rounded-xl active:scale-90 transition-transform 
                     dark:bg-white dark:text-black"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {tracks.map((track, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-2xl p-3 border border-gray-100 
                       dark:bg-zinc-800/40 dark:border-zinc-700 dark:text-white"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={track.completed}
                onChange={() => toggleTrack(index)}
                className="w-5 h-5 rounded-lg accent-black"
              />
              <span
                className={`flex-1 text-sm font-medium ${track.completed ? "line-through text-gray-400 dark:text-zinc-500" : "text-gray-700 dark:text-zinc-200"}`}
              >
                {track.title}
              </span>
              <button
                type="button"
                onClick={() => removeTrack(index)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <details className="mt-2 group">
              <summary
                className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer list-none flex items-center gap-1 
                                   dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
              >
                <AlignLeft size={10} />{" "}
                {track.lyrics ? "Ver Letra" : "Añadir Letra"}
              </summary>
              <textarea
                className="w-full mt-2 p-3 text-xs bg-white rounded-xl border-none ring-1 ring-gray-100 outline-none focus:ring-black 
                           dark:bg-zinc-900 dark:ring-zinc-700 dark:text-zinc-200 dark:focus:ring-white"
                placeholder="Pega la letra aquí..."
                rows="3"
                value={track.lyrics}
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
