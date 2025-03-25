import { Express, Request, Response } from 'express';
import { analyzeAPPCCControl, APPCCAnalysisRequest, APPCCAnalysisResponse } from '../services/openai';
import { storage } from '../storage';
import { log } from '../vite';
import { verifyAuth } from './auth-middleware';

/**
 * Registra las rutas para el análisis de datos usando IA
 */
export function registerAIAnalysisRoutes(app: Express) {
  /**
   * Endpoint para analizar un control APPCC específico
   */
  app.post('/api/analyze/appcc/:controlId', verifyAuth, async (req: Request, res: Response) => {
    try {
      const controlId = parseInt(req.params.controlId);
      const { requestType, language } = req.body;
      
      if (!controlId || isNaN(controlId)) {
        return res.status(400).json({ error: 'ID de control inválido' });
      }
      
      // Obtener datos del control desde la base de datos
      const controlRecord = await storage.getControlRecord(controlId);
      
      if (!controlRecord) {
        return res.status(404).json({ error: 'Control no encontrado' });
      }
      
      // Obtener datos adicionales necesarios
      const template = await storage.getControlTemplate(controlRecord.templateId);
      const location = await storage.getLocation(controlRecord.locationId);
      
      if (!template || !location) {
        return res.status(404).json({ error: 'Datos del control incompletos' });
      }
      
      // Preparar los datos para el análisis
      const formData = controlRecord.formData ? JSON.parse(controlRecord.formData) : {};
      
      // Transformar los datos al formato esperado por la IA
      const sections = [];
      
      if (formData.sections) {
        for (const section of formData.sections) {
          const items = [];
          
          for (const field of section.fields || []) {
            items.push({
              question: field.label,
              answer: field.value,
              status: field.status,
              notes: field.notes
            });
          }
          
          sections.push({
            title: section.title,
            items
          });
        }
      }
      
      // Construir la solicitud de análisis
      const analysisRequest: APPCCAnalysisRequest = {
        controlData: {
          id: controlRecord.id,
          name: template.name,
          type: template.type,
          status: controlRecord.status,
          location: location.name,
          date: controlRecord.completedAt || controlRecord.scheduledFor,
          responsible: 'Responsable', // Deberíamos obtener el nombre del usuario responsable
          sections,
          summary: {
            score: formData.summary?.score,
            issues: formData.summary?.issues,
            correctiveActions: formData.summary?.correctiveActions
          }
        },
        requestType: requestType || 'summary',
        language: language || 'es'
      };
      
      // Realizar el análisis
      log(`Solicitando análisis de IA para control ${controlId}`, 'ai-analysis');
      const analysisResult = await analyzeAPPCCControl(analysisRequest);
      
      // Devolver los resultados
      res.status(200).json(analysisResult);
      
    } catch (error) {
      log(`Error en análisis de IA: ${error}`, 'ai-analysis');
      res.status(500).json({ 
        error: 'Error al analizar el control', 
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  /**
   * Endpoint para analizar tendencias de controles APPCC para una ubicación
   */
  app.post('/api/analyze/appcc/trends/:locationId', verifyAuth, async (req: Request, res: Response) => {
    try {
      const locationId = parseInt(req.params.locationId);
      const { timeframe, language } = req.body;
      
      if (!locationId || isNaN(locationId)) {
        return res.status(400).json({ error: 'ID de ubicación inválido' });
      }
      
      // Obtener registros de control para esta ubicación
      const controlRecords = await storage.getControlRecords(locationId);
      
      if (!controlRecords || controlRecords.length === 0) {
        return res.status(404).json({ error: 'No se encontraron controles para esta ubicación' });
      }
      
      // Filtrar registros completados según el marco temporal (si se especifica)
      const filteredRecords = controlRecords.filter(record => 
        record.status === 'completed' && 
        (!timeframe || isWithinTimeframe(record.completedAt, timeframe))
      );
      
      if (filteredRecords.length === 0) {
        return res.status(404).json({ error: 'No se encontraron controles completados para el periodo solicitado' });
      }
      
      // Obtener la ubicación
      const location = await storage.getLocation(locationId);
      
      if (!location) {
        return res.status(404).json({ error: 'Ubicación no encontrada' });
      }
      
      // Preparar un resumen de los datos de control para el análisis
      const controlsSummary = {
        locationName: location.name,
        totalControls: filteredRecords.length,
        controlsByType: countControlsByType(filteredRecords),
        controlsByStatus: countControlsByStatus(filteredRecords),
        timeframe,
        records: filteredRecords.map(record => ({
          id: record.id,
          templateId: record.templateId,
          type: record.type,
          status: record.status,
          scheduledFor: record.scheduledFor,
          completedAt: record.completedAt,
          // Incluir datos más detallados si es necesario
        }))
      };
      
      // Construir la solicitud de análisis
      const analysisRequest: APPCCAnalysisRequest = {
        controlData: {
          id: 0, // No es un control específico
          name: `Análisis de tendencias - ${location.name}`,
          type: 'trends',
          status: 'completed',
          location: location.name,
          date: new Date().toISOString(),
          responsible: 'Sistema',
          sections: [
            {
              title: 'Resumen de controles',
              items: [
                {
                  question: 'Controles totales',
                  answer: controlsSummary.totalControls.toString()
                },
                {
                  question: 'Periodo analizado',
                  answer: timeframe || 'Todo el historial'
                }
              ]
            }
          ],
          summary: {
            // Aquí podríamos incluir estadísticas generales
          }
        },
        requestType: 'trends',
        language: language || 'es'
      };
      
      // Realizar el análisis
      log(`Solicitando análisis de tendencias para ubicación ${locationId}`, 'ai-analysis');
      const analysisResult = await analyzeAPPCCControl(analysisRequest);
      
      // Devolver los resultados junto con los datos de resumen
      res.status(200).json({
        summary: controlsSummary,
        analysis: analysisResult
      });
      
    } catch (error) {
      log(`Error en análisis de tendencias: ${error}`, 'ai-analysis');
      res.status(500).json({ 
        error: 'Error al analizar tendencias', 
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
}

/**
 * Verifica si una fecha está dentro de un marco temporal especificado
 */
function isWithinTimeframe(dateStr: string | undefined, timeframe: string): boolean {
  if (!dateStr) return false;
  
  const date = new Date(dateStr);
  const now = new Date();
  
  switch (timeframe) {
    case 'week':
      // Dentro de la última semana
      return (now.getTime() - date.getTime()) <= 7 * 24 * 60 * 60 * 1000;
    case 'month':
      // Dentro del último mes
      return (now.getTime() - date.getTime()) <= 30 * 24 * 60 * 60 * 1000;
    case 'quarter':
      // Dentro del último trimestre
      return (now.getTime() - date.getTime()) <= 90 * 24 * 60 * 60 * 1000;
    case 'year':
      // Dentro del último año
      return (now.getTime() - date.getTime()) <= 365 * 24 * 60 * 60 * 1000;
    default:
      // Si no se especifica, considerar todos
      return true;
  }
}

/**
 * Cuenta controles por tipo
 */
function countControlsByType(records: any[]): Record<string, number> {
  const counts: Record<string, number> = {};
  
  for (const record of records) {
    const type = record.type || 'unknown';
    counts[type] = (counts[type] || 0) + 1;
  }
  
  return counts;
}

/**
 * Cuenta controles por estado
 */
function countControlsByStatus(records: any[]): Record<string, number> {
  const counts: Record<string, number> = {};
  
  for (const record of records) {
    const status = record.status || 'unknown';
    counts[status] = (counts[status] || 0) + 1;
  }
  
  return counts;
}