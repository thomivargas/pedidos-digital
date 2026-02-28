import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { loginSchema, refreshSchema } from './auth.schema';
import { loginHandler, refreshHandler } from './auth.controller';

const router = Router();

router.post('/login', validate(loginSchema), loginHandler);
router.post('/refresh', validate(refreshSchema), refreshHandler);

export default router;
