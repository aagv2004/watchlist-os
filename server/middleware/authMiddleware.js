import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  // El token suele enviarse en el header como "Bearer [TOKEN]"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 1. Obtener el token del header
      token = req.headers.authorization.split(" ")[1];

      // 2. Verificar el token usnado tu JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Buscar el usuario en la DB y añadirlo a la petición (req)
      // .select('-password') hace que no carguemos la contraseña por seguridad
      req.user = await User.findById(decoded.id).select("-password");

      next(); // "Pase, usted tiene permiso sjkda"
    } catch (error) {
      res.status(401).json({ message: "No autorizado, token fallido " });
    }
  }

  if (!token) {
    res.status(401).json({ message: "No hay token, acceso denegado" });
  }
};
