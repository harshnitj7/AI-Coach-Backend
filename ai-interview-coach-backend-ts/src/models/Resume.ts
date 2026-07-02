import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../config/db";

class Resume extends Model<InferAttributes<Resume>, InferCreationAttributes<Resume>> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare fileName: string;
  declare filePath: string;
  declare targetRole: CreationOptional<string | null>;
  declare atsScore: CreationOptional<number | null>;
  declare strengths: CreationOptional<string[] | null>;
  declare weaknesses: CreationOptional<string[] | null>;
  declare missingKeywords: CreationOptional<string[] | null>;
  declare suggestions: CreationOptional<string[] | null>;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

Resume.init(
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
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    targetRole: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    atsScore: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    strengths: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    weaknesses: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    missingKeywords: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    suggestions: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "resumes",
    timestamps: true,
  }
);

export default Resume;
