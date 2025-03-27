import { Router } from "express";
import mediaCategoriesRouter from "./media-categories";

const router = Router();

// Registrar rutas para categorías de medios
router.use("/media/categories", mediaCategoriesRouter);

export default router;