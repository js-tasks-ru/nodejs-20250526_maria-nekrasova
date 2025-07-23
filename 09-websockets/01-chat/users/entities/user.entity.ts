import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import * as bcrypt from "bcrypt";

export enum Role {
  User = "user",
  Admin = "admin",
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  password: string;

  @Column({ default: "user" })
  role: Role;

  validatePassword(password: string) {
    return bcrypt.compare(password, this.password);
  }
}
