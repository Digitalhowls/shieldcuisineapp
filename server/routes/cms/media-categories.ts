import { Request, Response, Router } from "express";
import { db } from "../../db";
import {
  cmsMediaCategories,
  cmsMediaToCategories,
  cmsMedia,
  type InsertCmsMediaCategory
} from "@shared/schema";
import { and, eq } from "drizzle-orm";

const router = Router();

// GET /api/cms/media/categories - Obtener todas las categorías
router.get("/", async (req: Request, res: Response) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: "Se requiere companyId" });
    }

    const categories = await db.query.cmsMediaCategories.findMany({
      where: eq(cmsMediaCategories.companyId, parseInt(companyId as string)),
      orderBy: (cat) => [cat.name],
    });

    return res.status(200).json(categories);
  } catch (error) {
    console.error("Error al obtener categorías de medios:", error);
    return res.status(500).json({ error: "Error al obtener categorías de medios" });
  }
});

// GET /api/cms/media/categories/:id - Obtener una categoría por ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await db.query.cmsMediaCategories.findFirst({
      where: eq(cmsMediaCategories.id, parseInt(id)),
    });

    if (!category) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    return res.status(200).json(category);
  } catch (error) {
    console.error("Error al obtener categoría de medios:", error);
    return res.status(500).json({ error: "Error al obtener categoría de medios" });
  }
});

// POST /api/cms/media/categories - Crear nueva categoría
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, slug, description, parentId, companyId } = req.body;

    if (!name || !slug || !companyId) {
      return res.status(400).json({ error: "Faltan campos requeridos (name, slug, companyId)" });
    }

    // Verificar si ya existe una categoría con el mismo slug
    const existingCategory = await db.query.cmsMediaCategories.findFirst({
      where: and(
        eq(cmsMediaCategories.slug, slug),
        eq(cmsMediaCategories.companyId, companyId)
      ),
    });

    if (existingCategory) {
      return res.status(400).json({ error: "Ya existe una categoría con ese slug" });
    }

    const newCategory: InsertCmsMediaCategory = {
      name,
      slug,
      description,
      parentId: parentId || null,
      companyId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [created] = await db.insert(cmsMediaCategories).values(newCategory).returning();

    return res.status(201).json(created);
  } catch (error) {
    console.error("Error al crear categoría de medios:", error);
    return res.status(500).json({ error: "Error al crear categoría de medios" });
  }
});

// PUT /api/cms/media/categories/:id - Actualizar categoría
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, description, parentId } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: "Faltan campos requeridos (name, slug)" });
    }

    // Verificar que la categoría existe
    const category = await db.query.cmsMediaCategories.findFirst({
      where: eq(cmsMediaCategories.id, parseInt(id)),
    });

    if (!category) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    // Verificar si el nuevo slug ya existe en otra categoría
    if (slug !== category.slug) {
      const existingCategory = await db.query.cmsMediaCategories.findFirst({
        where: and(
          eq(cmsMediaCategories.slug, slug),
          eq(cmsMediaCategories.companyId, category.companyId)
        ),
      });

      if (existingCategory && existingCategory.id !== parseInt(id)) {
        return res.status(400).json({ error: "Ya existe otra categoría con ese slug" });
      }
    }

    // Verificar que no se esté asignando como padre a sí misma
    if (parentId && parseInt(id) === parentId) {
      return res.status(400).json({ error: "Una categoría no puede ser su propio padre" });
    }

    // Actualizar categoría
    const [updated] = await db
      .update(cmsMediaCategories)
      .set({
        name,
        slug,
        description,
        parentId: parentId || null,
        updatedAt: new Date(),
      })
      .where(eq(cmsMediaCategories.id, parseInt(id)))
      .returning();

    return res.status(200).json(updated);
  } catch (error) {
    console.error("Error al actualizar categoría de medios:", error);
    return res.status(500).json({ error: "Error al actualizar categoría de medios" });
  }
});

// DELETE /api/cms/media/categories/:id - Eliminar categoría
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const categoryId = parseInt(id);

    // Verificar que la categoría existe
    const category = await db.query.cmsMediaCategories.findFirst({
      where: eq(cmsMediaCategories.id, categoryId),
    });

    if (!category) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    // Iniciar una transacción para garantizar la integridad
    await db.transaction(async (tx) => {
      // 1. Actualizar categorías hijas para quitar referencia al padre
      await tx
        .update(cmsMediaCategories)
        .set({ parentId: category.parentId })
        .where(eq(cmsMediaCategories.parentId, categoryId));

      // 2. Eliminar relaciones de medios con esta categoría
      await tx
        .delete(cmsMediaToCategories)
        .where(eq(cmsMediaToCategories.categoryId, categoryId));

      // 3. Eliminar la categoría
      await tx
        .delete(cmsMediaCategories)
        .where(eq(cmsMediaCategories.id, categoryId));
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error al eliminar categoría de medios:", error);
    return res.status(500).json({ error: "Error al eliminar categoría de medios" });
  }
});

// POST /api/cms/media/categories/:categoryId/media/:mediaId - Asociar medio a categoría
router.post("/:categoryId/media/:mediaId", async (req: Request, res: Response) => {
  try {
    const { categoryId, mediaId } = req.params;

    // Verificar que la categoría existe
    const category = await db.query.cmsMediaCategories.findFirst({
      where: eq(cmsMediaCategories.id, parseInt(categoryId)),
    });

    if (!category) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    // Verificar que el medio existe
    const media = await db.query.cmsMedia.findFirst({
      where: eq(cmsMedia.id, parseInt(mediaId)),
    });

    if (!media) {
      return res.status(404).json({ error: "Medio no encontrado" });
    }

    // Verificar si ya existe la relación
    const existingRelation = await db.query.cmsMediaToCategories.findFirst({
      where: and(
        eq(cmsMediaToCategories.mediaId, parseInt(mediaId)),
        eq(cmsMediaToCategories.categoryId, parseInt(categoryId))
      ),
    });

    if (existingRelation) {
      return res.status(400).json({ error: "El medio ya está asociado a esta categoría" });
    }

    // Crear la relación
    const [relation] = await db
      .insert(cmsMediaToCategories)
      .values({
        mediaId: parseInt(mediaId),
        categoryId: parseInt(categoryId),
        createdAt: new Date(),
      })
      .returning();

    return res.status(201).json(relation);
  } catch (error) {
    console.error("Error al asociar medio a categoría:", error);
    return res.status(500).json({ error: "Error al asociar medio a categoría" });
  }
});

// DELETE /api/cms/media/categories/:categoryId/media/:mediaId - Desasociar medio de categoría
router.delete("/:categoryId/media/:mediaId", async (req: Request, res: Response) => {
  try {
    const { categoryId, mediaId } = req.params;

    await db
      .delete(cmsMediaToCategories)
      .where(
        and(
          eq(cmsMediaToCategories.mediaId, parseInt(mediaId)),
          eq(cmsMediaToCategories.categoryId, parseInt(categoryId))
        )
      );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error al desasociar medio de categoría:", error);
    return res.status(500).json({ error: "Error al desasociar medio de categoría" });
  }
});

export default router;