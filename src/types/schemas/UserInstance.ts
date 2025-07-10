import { Model } from "sequelize";
import { USER_ROLE } from "../../utils/user_role_enums";

export interface UserInstance extends Model {
  id: number;
  name: string;
  surname: string;
  nickName: string;
  email: string;
  password: string;
  age: number;
  role: USER_ROLE;
}
