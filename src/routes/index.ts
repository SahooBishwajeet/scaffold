import { Router } from "express";

import authRouter from "./auth.route";
import notebookRouter from "./notebook.route";
import userRouter from "./user.route";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/notebooks", notebookRouter);

export default router;
