import { Router } from 'express';
import * as ctrl from '../controllers/project.controller';
import { validate, validateIdParam } from '../middleware/validate';
import { createProjectSchema, listProjectsQuerySchema, updateProjectSchema } from '../validators/project';

// `authenticate` is applied to the whole router in routes/index.ts.
const router = Router();
router.get('/', validate('query', listProjectsQuerySchema), ctrl.list);
router.post('/', validate('body', createProjectSchema), ctrl.create);
router.get('/:id', validateIdParam, ctrl.getById);
router.put('/:id', validateIdParam, validate('body', updateProjectSchema), ctrl.update);
router.delete('/:id', validateIdParam, ctrl.remove);

export default router;
