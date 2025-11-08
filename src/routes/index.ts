import { Router } from 'express';

import authRouter from './auth.route';
import noteRouter from './note.route';
import notebookRouter from './notebook.route';
import userRouter from './user.route';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/notebooks', notebookRouter);
router.use('/notes', noteRouter);

export default router;
