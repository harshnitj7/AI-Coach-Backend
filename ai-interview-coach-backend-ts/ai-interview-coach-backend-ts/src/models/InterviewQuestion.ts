import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../config/db";

class InterviewQuestion extends Model<
  InferAttributes<InterviewQuestion>,
  InferCreationAttributes<InterviewQuestion>
> {
  declare id: CreationOptional<string>;
  declare interviewId: string;
  declare order: number;
  declare question: string;
  declare userAnswer: CreationOptional<string | null>;
  declare aiFeedback: CreationOptional<string | null>;
  declare score: CreationOptional<number | null>;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

InterviewQuestion.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    interviewId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    userAnswer: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    aiFeedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    score: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "interview_questions",
    timestamps: true,
  }
);

export default InterviewQuestion;
