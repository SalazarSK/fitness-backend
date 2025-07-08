import { ModelStatic, Sequelize, DataTypes } from "sequelize";
import { CompletedExerciseModel } from "../types/schemas/CompletedExercise";

type CompletedExerciseStatic = ModelStatic<CompletedExerciseModel> & {
  associate?: (models: any) => void;
};

export default (
  sequelize: Sequelize,
  modelName: string
): CompletedExerciseStatic => {
  const CompletedExerciseCtor = sequelize.define<CompletedExerciseModel>(
    modelName,
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      exerciseID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      tableName: "completed_exercises",
    }
  ) as CompletedExerciseStatic;

  CompletedExerciseCtor.associate = (models: any) => {
    CompletedExerciseCtor.belongsTo(models.User, {
      foreignKey: "userID",
      onDelete: "CASCADE",
    });
    CompletedExerciseCtor.belongsTo(models.Exercise, {
      foreignKey: "exerciseID",
      onDelete: "CASCADE",
    });
  };

  return CompletedExerciseCtor;
};
