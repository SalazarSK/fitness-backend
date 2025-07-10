import { DataTypes, Sequelize } from "sequelize";
import { USER_ROLE } from "../utils/user_role_enums";

export default (sequelize: Sequelize, modelName: string) => {
  const User = sequelize.define(
    modelName,
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      surname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      nickName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [8, 100],
        },
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
          max: 100,
        },
      },
      role: {
        type: DataTypes.ENUM(...Object.values(USER_ROLE)),
        defaultValue: USER_ROLE.USER,
      },
    },
    {
      timestamps: true,
    }
  );

  (User as any).associate = (models: any) => {
    User.hasMany(models.CompletedExercise, {
      foreignKey: "userID",
      as: "completedExercises",
    });
  };

  return User;
};
