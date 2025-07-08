import { Model } from "sequelize";

export interface UserInstance extends Model {
  id: number;
  name: string;
  surname: string;
  nickName: string;
  email: string;
  password: string;
  age: number;
  role: "ADMIN" | "USER";
}
