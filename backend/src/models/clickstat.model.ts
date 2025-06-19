import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Default,
  ForeignKey,
  CreatedAt,
  BelongsTo,
} from "sequelize-typescript";
import { Optional } from "sequelize";
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
interface ClickStatCreationAttrs
  extends Optional<ClickStatAttributes, "id" | "timestamp"> {}

@Table({ tableName: "ClickStats", timestamps: false })
export class ClickStat
  extends Model<ClickStatAttributes, ClickStatCreationAttrs>
  implements ClickStatAttributes
{
  @PrimaryKey @AutoIncrement @Column(DataType.INTEGER) id!: number;

  @ForeignKey(() => Link)
  @Column({ type: DataType.INTEGER, allowNull: false })
  linkId!: number;

  @CreatedAt
  @Default(DataType.NOW)
  @Column({ field: "timestamp", type: DataType.DATE })
  timestamp!: Date;

  @Column({ type: DataType.STRING(39), allowNull: false }) ip!: string;
  @Column({ type: DataType.STRING(255), allowNull: false }) region!: string;
  @Column({ type: DataType.STRING(100), allowNull: false }) browser!: string;
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: "browserVersion",
  })
  browserVersion!: string;
  @Column({ type: DataType.STRING(100), allowNull: false }) os!: string;

  @BelongsTo(() => Link, "linkId") link?: Link;
}
