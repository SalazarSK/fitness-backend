import { Router, Request, Response } from "express";
import { models } from "../db";
import {
  authenticateToken,
  authorizeAdmin,
} from "../middleware/authMiddleware";

const router = Router();
const { User } = models;

//INFO: Authorization require
router.get(
  "/",
  authenticateToken,
  authorizeAdmin,
  async (_req: Request, res: Response) => {
    const users = await User.findAll();
    res.json({ data: users, message: "List of users" });
  }
);

router.get(
  "/:id",
  authenticateToken,
  async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;

    if (req.user.role !== "ADMIN" && req.user.id !== Number(id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ data: user, message: "User details" });
  }
);

router.put(
  "/:id",
  authenticateToken,
  async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    const { name, surname, nickName, age, role } = req.body;

    if (req.user.role !== "ADMIN" && req.user.id !== Number(id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    try {
      const [updated] = await User.update(
        { name, surname, nickName, age, role },
        { where: { id } }
      );

      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await User.findByPk(id);
      res.json({ data: updatedUser, message: "User updated" });
    } catch (error) {
      res.status(500).json({ message: "Error updating user", error });
    }
  }

  //INFO: Without authorization
);

export default router;
