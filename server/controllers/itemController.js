import Item from "../models/Items.js";

// 1. Crear un nuevo item
export const createItem = async (req, res) => {
  try {
    // Creamos una nueva instancia del modelo Item
    const newItem = new Item({
      ...req.body,
      userId: req.user._id,
    });

    if (req.body.type === "music" && req.body.tracks) {
      const tracks = req.body.tracks;

      req.body.progress = {
        total: tracks.length,
        current: tracks.filter((t) => t.completed).length,
      };
    }

    if (
      req.body.progress.current === req.body.progress.total &&
      req.body.progress.total > 0
    ) {
      req.body.status = "completed";
    }

    // Guardamos en la base de datos.
    const savedItem = await newItem.save();

    //respondemos al frontend con el item creado
    res.status(201).json(savedItem);
  } catch (error) {
    // Si algo sale mal, enviamos un error
    res
      .status(500)
      .json({ message: "Error al crear el ítem", error: error.message });
  }
};

// 2. Obtener todos los items (la Watchlist completa)
export const getItems = async (req, res) => {
  try {
    // 1. Buscar Items
    const query = Item.find({ userId: req.user._id });

    // 2. Aplicar el sort como un objeto explícito (1 = ascendente, -1 = descendente)
    query.sort({ createdAt: -1 });

    // 3. Ejecutar la consulta
    const items = await query.exec();

    res.status(200).json(items);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener los ítems", error: error.message });
  }
};

// 3. Actualizar
export const updateItem = async (req, res) => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!item) {
      return res
        .status(404)
        .json({ message: "Ítem no encontrado o no autorizado" });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }, // Devuelve el item ya actualizado, no el viejo.
    );
    res.status(200).json(updatedItem);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error al actualizar", error: error.message });
  }
};

// 4. Eliminar
export const deleteItem = async (req, res) => {
  try {
    const result = await Item.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!result) {
      return res.status(404).json({ message: "Ítem no encontrado" });
    }

    res.status(200).json({ message: "ítem eliminado correctamente." });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error al eliminar", error: error.message });
  }
};
