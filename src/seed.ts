import { models, sequelize } from "./db/index";
import { EXERCISE_DIFFICULTY } from "./utils/enums";
import bcrypt from "bcrypt";
import { USER_ROLE } from "./utils/user_role_enums";

const { Exercise, Program, User, CompletedExercise } = models;

const seedDB = async () => {
  await sequelize.sync({ force: true });

  const password = await bcrypt.hash("test123", 10);

  await User.bulkCreate([
    {
      name: "Admin",
      surname: "Master",
      nickName: "admin1",
      email: "admin@example.com",
      password,
      age: 35,
      role: USER_ROLE.ADMIN,
    },
    {
      name: "Test 1",
      surname: "Surname 1",
      nickName: "test1",
      email: "test1@example.com",
      password,
      age: 28,
      role: USER_ROLE.USER,
    },
    {
      name: "Test 2",
      surname: "Surname 2",
      nickName: "test2",
      email: "test2@example.com",
      password,
      age: 24,
      role: USER_ROLE.USER,
    },
    {
      name: "Test 3",
      surname: "Surname 3",
      nickName: "test3",
      email: "test3@example.com",
      password,
      age: 40,
      role: USER_ROLE.USER,
    },
    {
      name: "Test 4",
      surname: "Surname 4",
      nickName: "test4",
      email: "test4@example.com",
      password,
      age: 30,
      role: USER_ROLE.USER,
    },
  ]);

  await Program.bulkCreate([
    {
      name: "Program 1",
    },
    {
      name: "Program 2",
    },
    {
      name: "Program 3",
    },
  ]);

  await Exercise.bulkCreate([
    {
      name: "Exercise 1",
      difficulty: EXERCISE_DIFFICULTY.EASY,
      programID: 1,
    },
    {
      name: "Exercise 2",
      difficulty: EXERCISE_DIFFICULTY.EASY,
      programID: 2,
    },
    {
      name: "Exercise 3",
      difficulty: EXERCISE_DIFFICULTY.MEDIUM,
      programID: 1,
    },
    {
      name: "Exercise 4",
      difficulty: EXERCISE_DIFFICULTY.MEDIUM,
      programID: 2,
    },
    {
      name: "Exercise 5",
      difficulty: EXERCISE_DIFFICULTY.HARD,
      programID: 1,
    },
    {
      name: "Exercise 6",
      difficulty: EXERCISE_DIFFICULTY.HARD,
      programID: 2,
    },
  ]);

  await CompletedExercise.bulkCreate([
    {
      userID: 2, // Test 1
      exerciseID: 1,
      completedAt: new Date(),
      duration: 180,
    },
    {
      userID: 2,
      exerciseID: 2,
      completedAt: new Date(),
      duration: 240,
    },
    {
      userID: 3, // Test 2
      exerciseID: 3,
      completedAt: new Date(),
      duration: 300,
    },
    {
      userID: 4, // Test 3
      exerciseID: 1,
      completedAt: new Date(),
      duration: 150,
    },
    {
      userID: 5, // Test 4
      exerciseID: 4,
      completedAt: new Date(),
      duration: 200,
    },
  ]);
};

seedDB()
  .then(() => {
    console.log("DB seed done");
    process.exit(0);
  })
  .catch((err) => {
    console.error("error in seed, check your data and model \n \n", err);
    process.exit(1);
  });
