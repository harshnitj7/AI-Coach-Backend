import dotenv from "dotenv";
dotenv.config();

import app from "./src/app";
import { connectDB, sequelize } from "./src/config/db";
import "./src/models"; // register all models + associations
// Note: src/types/express.d.ts is picked up automatically by the TS compiler
// (it's covered by tsconfig's "include") — it must NOT be imported here at
// runtime, since .d.ts files produce no JS output and `require` would fail.

const PORT = process.env.PORT || 5000;
sequelize.sync({ alter: true }) 
  .then(() => {
    console.log("✅ Database synced successfully!");
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Failed to sync database:", error);
  });
const startServer = async (): Promise<void> => {
  await connectDB();

  // In development, auto-sync models. In production, use proper migrations instead.
  if (process.env.NODE_ENV === "development") {
    await sequelize.sync({ alter: true });
    console.log("✅ Models synced");
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer();

// Safety nets
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});