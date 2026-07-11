import dotenv from "dotenv";
dotenv.config();

import app from "./src/app";
import { connectDB, sequelize } from "./src/config/db";
import "./src/models"; // register all models + associations

// Let Render dynamically assign the port, or default to 5000 locally
const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    // 1. Establish the database connection
    await connectDB();

    // 2. Sync models to create tables
    // We leave this running in production (alter: true) because 
    // we are using the Render Free Tier without a CLI migration setup.
    await sequelize.sync({ alter: true });
    console.log("✅ Database tables synced successfully!");

    // 3. Start the server (Executed strictly ONCE)
    app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

  } catch (error) {
    // If anything fails during startup, log it and shut down gracefully
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Execute the startup function
startServer();

// Safety nets for unexpected background crashes
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});