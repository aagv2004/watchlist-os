import mongoose from "mongoose";
import "dotenv/config";
import Item from "./models/Items.js";
import connectDB from "./config/db.js";

// Configurar strictQuery para evitar warnings si es necesario
mongoose.set("strictQuery", true);

const checkHealth = async () => {
  try {
    console.log("🔍 Conectando a la base de datos...");
    await connectDB();
    console.log("✅ Conexión exitosa.");

    console.log("📊 Analizando colección 'items'...");

    // Contar total
    const total = await Item.countDocuments();
    console.log(`\n📦 Total de Items encontrados: ${total}`);

    // Agrupar por tipo (usando agregación simple)
    const breakdown = await Item.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    console.log("\n📈 Desglose por tipo:");
    if (breakdown.length === 0) {
      console.log("   (No hay items todavía)");
    } else {
      breakdown.forEach((g) => {
        console.log(`   - ${g._id}: ${g.count}`);
      });
    }

    console.log(
      "\n✅ El modelo actual responde correctamente. Es seguro proceder.",
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Error verificando la base de datos:", error);
    process.exit(1);
  }
};

checkHealth();
