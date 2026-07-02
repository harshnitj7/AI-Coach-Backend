import User from "./User";
import RefreshToken from "./RefreshToken";
import Interview from "./Interview";
import InterviewQuestion from "./InterviewQuestion";
import Resume from "./Resume";
import Roadmap from "./Roadmap";

// ---- Associations ----

User.hasMany(RefreshToken, { foreignKey: "userId", onDelete: "CASCADE" });
RefreshToken.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Interview, { foreignKey: "userId", onDelete: "CASCADE" });
Interview.belongsTo(User, { foreignKey: "userId" });

Interview.hasMany(InterviewQuestion, {
  foreignKey: "interviewId",
  onDelete: "CASCADE",
  as: "questions",
});
InterviewQuestion.belongsTo(Interview, { foreignKey: "interviewId" });

User.hasMany(Resume, { foreignKey: "userId", onDelete: "CASCADE" });
Resume.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Roadmap, { foreignKey: "userId", onDelete: "CASCADE" });
Roadmap.belongsTo(User, { foreignKey: "userId" });

export { User, RefreshToken, Interview, InterviewQuestion, Resume, Roadmap };
