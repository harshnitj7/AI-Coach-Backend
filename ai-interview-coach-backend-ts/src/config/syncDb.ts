// Run with: npm run db:migrate
import { sequelize } from "./db";
import "../models"; // load all models + associations

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ All tables synced successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error syncing tables:", error);
    process.exit(1);
  }
})();
