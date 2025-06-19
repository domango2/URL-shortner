import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
  HasMany,
} from "sequelize-typescript";
import { Optional } from "sequelize";
import { User } from "./user.model";
import { ClickStat } from "./clickstat.model";

interface LinkAttributes {
  id: number;
  userId: number;
  originalUrl: string;
  shortCode: string;
  createdAt: Date;
  updatedAt: Date;
}
interface LinkCreationAttrs
  extends Optional<LinkAttributes, "id" | "createdAt" | "updatedAt"> {}

@Table({ tableName: "Links", timestamps: true })
export class Link
  extends Model<LinkAttributes, LinkCreationAttrs>
  implements LinkAttributes
{
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id!: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId!: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  originalUrl!: string;

  @Column({ type: DataType.STRING(10), allowNull: false, unique: true })
  shortCode!: string;

  @CreatedAt @Column({ field: "createdAt" }) createdAt!: Date;
  @UpdatedAt @Column({ field: "updatedAt" }) updatedAt!: Date;

  @BelongsTo(() => User, "userId") user?: User;
  @HasMany(() => ClickStat, "linkId") clicks?: ClickStat[];
}
