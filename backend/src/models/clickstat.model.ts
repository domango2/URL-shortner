import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { Link } from "./link.model";

interface ClickStatAttributes {
  id: number;
  linkId: number;
  timestamp: Date;
  ip: string;
  region: string;
  browser: string;
  browserVersion: string;
  os: string;
}

interface ClickStatCreationAttributes
  extends Optional<ClickStatAttributes, "id" | "timestamp"> {}

export class ClickStat
  extends Model<ClickStatAttributes, ClickStatCreationAttributes>
  implements ClickStatAttributes
{
  public id!: number;
  public linkId!: number;
  public timestamp!: Date;
  public ip!: string;
  public region!: string;
  public browser!: string;
  public browserVersion!: string;
  public os!: string;
}

ClickStat.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    linkId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Link,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    ip: {
      type: DataTypes.STRING(39),
      allowNull: false,
    },
    region: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    browser: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    browserVersion: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    os: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "ClickStats",
    timestamps: false,
  }
);

Link.hasMany(ClickStat, { foreignKey: "linkId", as: "clicks" });
ClickStat.belongsTo(Link, { foreignKey: "linkId", as: "link" });
