import http from "http";
import express from "express";

import { sequelize } from "./db";
import ProgramRouter from "./routes/programs";
import ExerciseRouter from "./routes/exercises";
import AuthRouter from "./routes/auth";
import UserRouter from "./routes/users";
import CompletedExerciseRouter from "./routes/completedExercise";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/programs", ProgramRouter());
app.use("/exercises", ExerciseRouter());
app.use("/auth", AuthRouter);
app.use("/users", UserRouter);
app.use("/completedExercise", CompletedExerciseRouter);

const httpServer = http.createServer(app);
const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("Database is connected!!!");
    httpServer.listen(8000, () =>
      console.log(`Server started at port ${8000}`)
    );
  } catch (error) {
    console.log("Sequelize sync error:", error);
  }
};

startServer();
//httpServer.listen(8000).on('listening', () => console.log(`Server started at port ${8000}`))

export default httpServer;
