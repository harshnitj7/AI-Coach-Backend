import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../config/db";
import { InterviewType, InterviewDifficulty, InterviewStatus } from "../types";

class Interview extends Model<InferAttributes<Interview>, InferCreationAttributes<Interview>> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare role: string;
  declare type: CreationOptional<InterviewType>;
  declare difficulty: CreationOptional<InterviewDifficulty>;
  declare status: CreationOptional<InterviewStatus>;
  declare overallScore: CreationOptional<number | null>;
  declare overallFeedback: CreationOptional<string | null>;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

Interview.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("technical", "hr", "behavioral", "system-design"),
      defaultValue: "technical",
    },
    difficulty: {
      type: DataTypes.ENUM("easy", "medium", "hard"),
      defaultValue: "medium",
    },
    status: {
      type: DataTypes.ENUM("in-progress", "completed"),
      defaultValue: "in-progress",
    },
    overallScore: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    overallFeedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "interviews",
    timestamps: true,
  }
);

export default Interview;
