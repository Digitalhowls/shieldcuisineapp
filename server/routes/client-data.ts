import { Express, Request, Response } from "express";
import { verifyClientToken } from "./client-auth";
import { storage } from "../storage";
import { db } from "../db";
import { eq, and, desc, sql } from "drizzle-orm";
import { controlRecords, controlTemplates } from "@shared/schema";

// Función para registrar las rutas de datos del cliente
export function registerClientDataRoutes(app: Express) {
  // Ruta para obtener estadísticas del dashboard
  app.get('/api/client/dashboard', verifyClientToken, async (req: Request, res: Response) => {
    try {
      const { companyId, locationId } = req.clientPortal;
      
      // Obtener estadísticas
      // En una implementación real, estas estadísticas serían calculadas desde la base de datos
      const estadisticas = {
        totalControles: 24,
        controlesCompletados: 21,
        controlesUltimos30Dias: 8,
        tasaCumplimiento: 87.5,
        problemasCriticos: 2
      };
      
      // Obtener últimos controles (simulado)
      const ultimosControles = [
        {
          id: 123,
          tipo: "checklist",
          nombre: "Control de temperaturas cámaras",
          estado: "completed",
          fecha: "2023-12-01T14:30:00Z",
          responsable: "Carmen García",
          puntuacion: 92,
          problemas: []
        },
        {
          id: 124,
          tipo: "form",
          nombre: "Verificación limpieza cocina",
          estado: "completed",
          fecha: "2023-11-28T09:15:00Z",
          responsable: "Juan Pérez",
          puntuacion: 85,
          problemas: ["Zona de preparación con residuos"]
        },
        {
          id: 125,
          tipo: "checklist",
          nombre: "Control recepción mercancía",
          estado: "completed",
          fecha: "2023-11-25T11:00:00Z",
          responsable: "María López",
          puntuacion: 100,
          problemas: []
        }
      ];
      
      // Obtener próximos controles programados (simulado)
      const proximosControles = [
        {
          id: 126,
          tipo: "checklist",
          nombre: "Control de temperaturas cámaras",
          estado: "scheduled",
          fecha: "2023-12-08T14:30:00Z",
          responsable: "Carmen García"
        },
        {
          id: 127,
          tipo: "form",
          nombre: "Verificación limpieza cocina",
          estado: "scheduled",
          fecha: "2023-12-05T09:15:00Z",
          responsable: "Juan Pérez"
        }
      ];
      
      // Historial de temperaturas para restaurantes (simulado)
      const historialTemperaturas = [
        { fecha: "2023-12-01", valor: 4.2 },
        { fecha: "2023-11-30", valor: 3.9 },
        { fecha: "2023-11-29", valor: 5.1 },
        { fecha: "2023-11-28", valor: 4.8 },
        { fecha: "2023-11-27", valor: 4.5 },
        { fecha: "2023-11-26", valor: 3.7 },
        { fecha: "2023-11-25", valor: 4.0 }
      ];
      
      return res.status(200).json({
        estadisticas,
        ultimosControles,
        proximosControles,
        historialTemperaturas
      });
    } catch (error) {
      return res.status(500).json({ error: 'Error al obtener datos del dashboard' });
    }
  });
  
  // Ruta para obtener listado de controles
  app.get('/api/client/controls', verifyClientToken, async (req: Request, res: Response) => {
    try {
      const { companyId, locationId } = req.clientPortal;
      
      // Filtros opcionales por query params
      const { tipo, estado, desde, hasta } = req.query;
      
      // En una implementación real, estos controles serían filtrados desde la base de datos
      const controles = [
        {
          id: 101,
          tipo: "checklist",
          nombre: "Control diario de temperaturas",
          estado: "completed",
          fecha: "2023-12-01T09:00:00Z",
          responsable: "Juan Pérez",
          puntuacion: 95,
          problemas: [],
          acciones: []
        },
        {
          id: 102,
          tipo: "form",
          nombre: "Limpieza superficies contacto alimentos",
          estado: "completed",
          fecha: "2023-11-30T14:30:00Z",
          responsable: "María López",
          puntuacion: 87,
          problemas: ["Residuos en esquinas"],
          acciones: ["Reforzar limpieza en esquinas y uniones"]
        },
        {
          id: 103,
          tipo: "checklist",
          nombre: "Control recepción mercancía",
          estado: "completed",
          fecha: "2023-11-29T11:15:00Z",
          responsable: "Ana Gómez",
          puntuacion: 100,
          problemas: [],
          acciones: []
        },
        {
          id: 104,
          tipo: "form",
          nombre: "Control desinfección equipos",
          estado: "completed",
          fecha: "2023-11-28T16:00:00Z",
          responsable: "Carlos Martínez",
          puntuacion: 92,
          problemas: ["Registro incompleto"],
          acciones: ["Actualizar formato registro"]
        },
        {
          id: 105,
          tipo: "checklist",
          nombre: "Verificación etiquetado alimentos",
          estado: "pending",
          fecha: "2023-12-02T10:00:00Z",
          responsable: "Laura Sánchez"
        }
      ];
      
      return res.status(200).json(controles);
    } catch (error) {
      return res.status(500).json({ error: 'Error al obtener listado de controles' });
    }
  });
  
  // Ruta para obtener detalles de un control específico
  app.get('/api/client/controls/:controlId', verifyClientToken, async (req: Request, res: Response) => {
    try {
      const { companyId, locationId } = req.clientPortal;
      const controlId = parseInt(req.params.controlId);
      
      if (isNaN(controlId)) {
        return res.status(400).json({ error: 'ID de control inválido' });
      }
      
      // En una implementación real, buscaríamos el control en la base de datos
      // y verificaríamos que pertenece a la empresa/ubicación del token
      
      // Ejemplo de respuesta para un control de temperatura
      if (controlId === 101) {
        return res.status(200).json({
          id: 101,
          tipo: "checklist",
          nombre: "Control diario de temperaturas",
          estado: "completed",
          fecha: "2023-12-01T09:00:00Z",
          responsable: "Juan Pérez",
          puntuacion: 95,
          resumen: "Control diario de temperaturas en cámaras y equipos de refrigeración",
          secciones: [
            {
              id: "temps",
              titulo: "Temperaturas de cámaras frigoríficas",
              campos: [
                {
                  id: "temp_camara_1",
                  tipo: "temperature",
                  etiqueta: "Cámara 1 - Carnes",
                  valor: 2.7,
                  estado: "ok"
                },
                {
                  id: "temp_camara_2",
                  tipo: "temperature",
                  etiqueta: "Cámara 2 - Pescados",
                  valor: 1.2,
                  estado: "ok"
                },
                {
                  id: "temp_camara_3",
                  tipo: "temperature",
                  etiqueta: "Cámara 3 - Lácteos",
                  valor: 4.1,
                  estado: "ok"
                },
                {
                  id: "temp_camara_4",
                  tipo: "temperature",
                  etiqueta: "Abatidor",
                  valor: -18.5,
                  estado: "ok"
                }
              ]
            },
            {
              id: "observaciones",
              titulo: "Observaciones generales",
              campos: [
                {
                  id: "obs_general",
                  tipo: "textarea",
                  etiqueta: "Observaciones",
                  valor: "Todas las cámaras funcionan correctamente. Se han calibrado los termómetros según procedimiento PG-07"
                }
              ]
            }
          ],
          firma: {
            nombre: "Juan Pérez",
            cargo: "Jefe de Cocina",
            fecha: "2023-12-01T09:15:00Z"
          }
        });
      }
      
      // Ejemplo para un control de limpieza
      if (controlId === 102) {
        return res.status(200).json({
          id: 102,
          tipo: "form",
          nombre: "Limpieza superficies contacto alimentos",
          estado: "completed",
          fecha: "2023-11-30T14:30:00Z",
          responsable: "María López",
          puntuacion: 87,
          resumen: "Verificación visual y mediante luminómetro de la limpieza de superficies en contacto con alimentos",
          secciones: [
            {
              id: "verificacion_visual",
              titulo: "Verificación visual",
              campos: [
                {
                  id: "check_mesas",
                  tipo: "checkbox",
                  etiqueta: "Mesas de trabajo",
                  valor: true,
                  estado: "ok"
                },
                {
                  id: "check_tablas",
                  tipo: "checkbox",
                  etiqueta: "Tablas de corte",
                  valor: true,
                  estado: "ok"
                },
                {
                  id: "check_utensilios",
                  tipo: "checkbox",
                  etiqueta: "Utensilios y menaje",
                  valor: true,
                  estado: "ok"
                },
                {
                  id: "check_maquinaria",
                  tipo: "checkbox",
                  etiqueta: "Maquinaria",
                  valor: false,
                  estado: "error",
                  notas: "Residuos en esquinas de la cortadora"
                }
              ]
            },
            {
              id: "verificacion_luminometro",
              titulo: "Verificación con luminómetro",
              campos: [
                {
                  id: "medicion_1",
                  tipo: "number",
                  etiqueta: "Mesa 1 (URL)",
                  valor: 32,
                  estado: "ok"
                },
                {
                  id: "medicion_2",
                  tipo: "number",
                  etiqueta: "Mesa 2 (URL)",
                  valor: 48,
                  estado: "ok"
                },
                {
                  id: "medicion_3",
                  tipo: "number",
                  etiqueta: "Cortadora (URL)",
                  valor: 147,
                  estado: "warning",
                  notas: "Valor cercano al límite"
                }
              ]
            }
          ],
          problemas: ["Residuos en esquinas de la cortadora", "Valor de luminometría elevado en cortadora"],
          acciones: ["Reforzar limpieza en esquinas y uniones", "Revisar procedimiento de limpieza de maquinaria"],
          firma: {
            nombre: "María López",
            cargo: "Responsable Calidad",
            fecha: "2023-11-30T14:45:00Z"
          }
        });
      }
      
      return res.status(404).json({ error: 'Control no encontrado' });
    } catch (error) {
      return res.status(500).json({ error: 'Error al obtener detalles del control' });
    }
  });
  
  // Otras rutas para datos del cliente pueden añadirse aquí
}