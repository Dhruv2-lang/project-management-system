import { Router } from 'express';
import * as ctrl from '../controllers/task.controller';
import { validate, validateIdParam } from '../middleware/validate';
import { createTaskSchema, listTasksQuerySchema, updateTaskSchema } from '../validators/task';

// `authenticate` is applied to the whole router in routes/index.ts.
const router = Router();
router.get('/', validate('query', listTasksQuerySchema), ctrl.list);
router.post('/', validate('body', createTaskSchema), ctrl.create);
router.get('/:id', validateIdParam, ctrl.getById);
router.put('/:id', validateIdParam, validate('body', updateTaskSchema), ctrl.update);
router.delete('/:id', validateIdParam, ctrl.remove);

export default router;
