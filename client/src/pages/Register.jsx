import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";
import { AlertCircle, UserPlus, CheckCircle2, Info, User } from "lucide-react";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  // --- VALIDACIONES EN VIVO ---

  const getUsernameStatus = () => {
    if (username.length === 0) return "neutral";
    if (username.length < 3) return "error";
    return "success";
  };

  const getEmailStatus = () => {
    if (email.length === 0) return "neutral";
    const hasAt = email.includes("@");
    const hasDot = email.includes(".");
    return hasAt && hasDot ? "success" : "warning";
  };

  const getPasswordStatus = () => {
    if (password.length === 0) return "neutral";
    if (password.length < 6) return "warning";
    return "success";
  };

  const usernameStatus = getUsernameStatus();
  const emailStatus = getEmailStatus();
  const passwordStatus = getPasswordStatus();

  const statusClasses = {
    neutral: "ring-gray-200 dark:ring-zinc-800",
    error: "ring-red-500 bg-red-50 dark:bg-red-500/10",
    warning: "ring-amber-500 bg-amber-50 dark:bg-amber-500/10",
    success: "ring-emerald-500 bg-emerald-50 dark:bg-emerald-500/10",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/register", {
        username,
        email,
        password,
      });

      setIsSuccess(true);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      alert(error.response?.data?.message || "Error al crear cuenta");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg dark:bg-black p-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-950 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-900 transition-all">
        {isSuccess ? (
          <div className="flex flex-col items-center py-10 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="text-emerald-500" size={40} />
            </div>
            <h2 className="text-2xl font-bold dark:text-white">
              ¡Cuenta creada!
            </h2>
            <p className="text-gray-500 dark:text-zinc-400 text-center mt-2">
              Te estamos redirigiendo al inicio de sesión...
            </p>
          </div>
        ) : (
          <>
            {/* Cabecera */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 bg-black dark:bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <UserPlus className="text-white dark:text-black" size={28} />
              </div>
              <h1 className="text-2xl font-bold dark:text-white text-center">
                Crea tu cuenta
              </h1>
              <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1 text-center">
                Únete para empezar a organizar tu contenido.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Campo Username */}
              <div>
                <label className="block text-sm font-semibold mb-2 ml-1 dark:text-zinc-300">
                  Nombre de usuario
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className={`w-full p-3 rounded-xl bg-gray-50 dark:bg-zinc-900 outline-none ring-2 transition-all dark:text-white ${statusClasses[usernameStatus]}`}
                    placeholder="Tu apodo"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <div className="absolute right-4 top-3.5">
                    {usernameStatus === "success" && (
                      <CheckCircle2 className="text-emerald-500" size={20} />
                    )}
                    {usernameStatus === "error" && (
                      <AlertCircle className="text-red-500" size={20} />
                    )}
                  </div>
                </div>
              </div>

              {/* Campo Email */}
              <div>
                <label className="block text-sm font-semibold mb-2 ml-1 dark:text-zinc-300">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    className={`w-full p-3 rounded-xl bg-gray-50 dark:bg-zinc-900 outline-none ring-2 transition-all dark:text-white ${statusClasses[emailStatus]}`}
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="absolute right-4 top-3.5">
                    {emailStatus === "success" && (
                      <CheckCircle2 className="text-emerald-500" size={20} />
                    )}
                    {emailStatus === "warning" && (
                      <AlertCircle className="text-amber-500" size={20} />
                    )}
                  </div>
                </div>
              </div>

              {/* Campo Password */}
              <div>
                <label className="block text-sm font-semibold mb-2 ml-1 dark:text-zinc-300">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type="password"
                    className={`w-full p-3 rounded-xl bg-gray-50 dark:bg-zinc-900 outline-none ring-2 transition-all dark:text-white ${statusClasses[passwordStatus]}`}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="absolute right-4 top-3.5">
                    {passwordStatus === "success" && (
                      <CheckCircle2 className="text-emerald-500" size={20} />
                    )}
                    {passwordStatus === "warning" && (
                      <AlertCircle className="text-amber-500" size={20} />
                    )}
                  </div>
                </div>
                {passwordStatus === "warning" && (
                  <p className="mt-2 ml-1 text-[11px] text-amber-600 flex items-center gap-1">
                    <Info size={12} /> Falta poco para el mínimo de 6.
                  </p>
                )}
              </div>

              <button
                disabled={
                  emailStatus !== "success" ||
                  passwordStatus !== "success" ||
                  usernameStatus !== "success"
                }
                className="w-full bg-black dark:bg-white text-white dark:text-black p-4 rounded-2xl font-bold hover:opacity-90 transition-all disabled:bg-gray-200 dark:disabled:bg-zinc-800 disabled:text-gray-400 disabled:cursor-not-allowed shadow-md"
              >
                Registrarse ahora
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                ¿Ya tienes una cuenta?{" "}
                <Link
                  to="/login"
                  className="text-black dark:text-white font-bold hover:underline"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
