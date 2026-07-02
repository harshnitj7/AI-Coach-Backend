import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../config/db";
import { AIRoadmapResponse } from "../types";

class Roadmap extends Model<InferAttributes<Roadmap>, InferCreationAttributes<Roadmap>> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare targetRole: string;
  declare currentSkills: CreationOptional<string[] | null>;
  declare durationWeeks: CreationOptional<number>;
  declare roadmapData: AIRoadmapResponse;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

Roadmap.init(
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
    targetRole: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    currentSkills: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    durationWeeks: {
      type: DataTypes.INTEGER,
      defaultValue: 12,
    },
    roadmapData: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "roadmaps",
    timestamps: true,
  }
);

export default Roadmap;
