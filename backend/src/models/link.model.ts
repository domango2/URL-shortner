import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./user.model";

interface LinkAttributes {
  id: number;
  userId: number;
  originalUrl: string;
  shortCode: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LinkCreationAttributes
  extends Optional<LinkAttributes, "id" | "createdAt" | "updatedAt"> {}

export class Link
  extends Model<LinkAttributes, LinkCreationAttributes>
  implements LinkAttributes
{
  public id!: number;
  public userId!: number;
  public originalUrl!: string;
  public shortCode!: string;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;
}

Link.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    originalUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    shortCode: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "Links",
    timestamps: true,
  }
);

User.hasMany(Link, { foreignKey: "userId", as: "links" });
Link.belongsTo(User, { foreignKey: "userId", as: "user" });
