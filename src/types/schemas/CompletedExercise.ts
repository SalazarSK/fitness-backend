import { Model } from "sequelize";

export interface CompletedExerciseModel extends Model {
  id: number;
  userID: number;
  exerciseID: number;
  completedAt: Date;
  duration: number;
}
