import { Router } from 'express';
import openaiRouter from './openai';
import perplexityRouter from './perplexity';

const router = Router();

// Registrar las rutas
router.use('/openai', openaiRouter);
router.use('/perplexity', perplexityRouter);

export default router;