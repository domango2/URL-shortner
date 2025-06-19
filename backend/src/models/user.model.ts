import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  HasMany,
} from "sequelize-typescript";
import { Optional } from "sequelize";
import { Link } from "./link.model";

interface UserAttributes {
  id: number;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserCreationAttrs
  extends Optional<UserAttributes, "id" | "createdAt" | "updatedAt"> {}

@Table({ tableName: "Users", timestamps: true })
export class User
  extends Model<UserAttributes, UserCreationAttrs>
  implements UserAttributes
{
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id!: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  })
  email!: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  password!: string;

  @CreatedAt @Column({ field: "createdAt" }) createdAt!: Date;
  @UpdatedAt @Column({ field: "updatedAt" }) updatedAt!: Date;

  @HasMany(() => Link, "userId")
  links?: Link[];
}
