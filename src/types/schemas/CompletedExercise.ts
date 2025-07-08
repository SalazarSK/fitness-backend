import { Model } from "sequelize";

export interface CompletedExerciseModel extends Model {
  userID: number;
  exerciseID: number;
  completedAt: Date;
  duration: number;
}
