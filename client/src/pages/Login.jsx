import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios.js";
import { AlertCircle, LogIn, CheckCircle2, Info } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);

  // Validación en vivo
  // 1. Validar Email
  const getEmailStatus = () => {
    if (email.length === 0) return "neutral";
    if (email.length < 5) return "error";
    const hasAt = email.includes("@");
    const hasDot = email.includes(".");
    if (hasAt && hasDot) return "success";
    return "warning"; // Falta @ o punto
  };

  // 2. Validar contraseña
  const getPasswordStatus = () => {
    if (password.length === 0) return "neutral";
    if (password.length < 6) return "warning";
    return "success";
  };

  const emailStatus = getEmailStatus();
  const passwordStatus = getPasswordStatus();

  // Clases dinámicas para los bordes
  const statusClasses = {
    neutral: "ring-gray-200",
    error: "ring-red-500 bg-red-50",
    warning: "ring-amber-500 bg-amber-50",
    success: "ring-emerald-500 bg-emerald-50",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data);
    } catch (error) {
      // Esto capturará el "Credenciales inválidas" del backend
      console.error("Error:", error.response?.data?.message);
      alert(
        error.response?.data?.message || "Error al conectar con el servidor",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-4">
            <LogIn className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold">Bienvenido a Watchlist OS</h1>
          <p className="text-gray-500 text-sm">
            Organiza tu contenido sin fricción.
          </p>
        </div>
        {/* Fin Cabecera */}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo Email */}
          <div>
            <label className="block text-sm font-semibold mb-2 ml-1">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                className={`w-full p-2 rounded-lg bg-gray-50 outline-none ring-2 transition-all ${statusClasses[emailStatus]}`}
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="absolute right-4 top-4">
                {emailStatus === "success" && (
                  <CheckCircle2 className="text-emerald-500" size={20} />
                )}
                {emailStatus === "warning" && (
                  <AlertCircle className="text-amber-500" size={20} />
                )}
                {emailStatus === "error" && (
                  <AlertCircle className="text-red-500" size={20} />
                )}
              </div>
            </div>

            {/* Mensajes de ayuda dinámicos */}
            <div className="mt-2 ml-1 text-xs">
              {emailStatus === "error" && (
                <p className="text-red-600">El correo es demasiado corto.</p>
              )}
              {emailStatus === "warning" && (
                <p className="text-amber-600">
                  Recuerda incluir el "@" y un "." (ej. .com)
                </p>
              )}
              {emailStatus === "success" && (
                <p className="text-emerald-600">Formato de correo válido.</p>
              )}
            </div>
          </div>

          {/* Campo Password */}
          <div>
            <label className="block text-sm font-semibold mb-2 ml-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type="password"
                className={`w-full p-2 rounded-lg bg-gray-50 outline-none ring-2 transition-all ${statusClasses[passwordStatus]}`}
                placeholder="Min. 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="absolute right-4 top-4">
                {passwordStatus === "success" && (
                  <CheckCircle2 className="text-emerald-500" size={20} />
                )}
                {passwordStatus === "warning" && (
                  <AlertCircle className="text-amber-500" size={20} />
                )}
              </div>
            </div>

            {passwordStatus === "warning" && (
              <p className="mt-2 ml-1 text-xs text-amber-600 flex items-center gap-1">
                <Info size={14} /> Te faltan {6 - password.length} caracteres
                para el mínimo.
              </p>
            )}
          </div>

          <button
            disabled={emailStatus !== "success" || passwordStatus !== "success"}
            className="w-full bg-black text-white p-4 rounded-2xl font-bold hover:opacity-90 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
