/**
 * Rutas de API para integración bancaria PSD2/Open Banking
 */

import { Request, Response, Express, NextFunction } from 'express';
import { bankingService, PSD2Config, ConsentRequest } from '../services/banking';
import { bankConnections, bankAccounts, bankTransactions, bankCategoriesRules } from '@shared/schema';
import { db } from '../db';
import { eq, desc, and, isNull, or } from 'drizzle-orm';
import { verifyAuth } from './auth-middleware';

// Middleware para verificar que el usuario tiene rol adecuado para acciones bancarias
const verifyBankingAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  
  // Verificar que el usuario tiene rol de admin o company_admin
  const allowedRoles = ['admin', 'company_admin'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'No autorizado para acceder a información bancaria' });
  }
  
  next();
};

/**
 * Registra las rutas para la integración bancaria
 */
export function registerBankingRoutes(app: Express) {
  /**
   * Configura la conexión con la API bancaria
   */
  app.post('/api/banking/config', verifyBankingAccess, async (req: Request, res: Response) => {
    try {
      const config: PSD2Config = req.body;
      
      if (!config.apiUrl || !config.clientId || !config.clientSecret) {
        return res.status(400).json({ error: 'Configuración incompleta' });
      }
      
      const initialized = bankingService.initialize(config);
      if (!initialized) {
        return res.status(500).json({ error: 'Error al inicializar servicio bancario' });
      }
      
      res.status(200).json({ success: true, message: 'Configuración bancaria guardada' });
    } catch (error) {
      res.status(500).json({ error: `Error al configurar API bancaria: ${(error as Error).message}` });
    }
  });

  /**
   * Crea un nuevo consentimiento bancario
   */
  app.post('/api/banking/consents', verifyBankingAccess, async (req: Request, res: Response) => {
    try {
      const { companyId, validUntil, recurringIndicator, frequencyPerDay, access } = req.body;
      
      if (!companyId) {
        return res.status(400).json({ error: 'ID de compañía requerido' });
      }
      
      const consentRequest: ConsentRequest = {
        validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 días por defecto
        recurringIndicator: recurringIndicator !== undefined ? recurringIndicator : true,
        frequencyPerDay: frequencyPerDay || 4,
        access: access || {
          availableAccounts: 'allAccounts'
        }
      };
      
      const connection = await bankingService.createConsent(companyId, consentRequest);
      
      if (!connection) {
        return res.status(500).json({ error: 'Error al crear consentimiento bancario' });
      }
      
      res.status(201).json(connection);
    } catch (error) {
      res.status(500).json({ error: `Error al crear consentimiento: ${(error as Error).message}` });
    }
  });

  /**
   * Obtiene conexiones bancarias para una compañía
   */
  app.get('/api/banking/connections/:companyId', verifyBankingAccess, async (req: Request, res: Response) => {
    try {
      const companyId = parseInt(req.params.companyId);
      
      if (isNaN(companyId)) {
        return res.status(400).json({ error: 'ID de compañía inválido' });
      }
      
      const connections = await db
        .select()
        .from(bankConnections)
        .where(eq(bankConnections.companyId, companyId))
        .orderBy(desc(bankConnections.createdAt));
      
      res.status(200).json(connections);
    } catch (error) {
      res.status(500).json({ error: `Error al obtener conexiones bancarias: ${(error as Error).message}` });
    }
  });

  /**
   * Actualiza el estado de una conexión bancaria
   */
  app.put('/api/banking/connections/:connectionId/status', verifyBankingAccess, async (req: Request, res: Response) => {
    try {
      const connectionId = parseInt(req.params.connectionId);
      
      if (isNaN(connectionId)) {
        return res.status(400).json({ error: 'ID de conexión inválido' });
      }
      
      const updatedConnection = await bankingService.updateConsentStatus(connectionId);
      
      if (!updatedConnection) {
        return res.status(500).json({ error: 'Error al actualizar estado de conexión' });
      }
      
      res.status(200).json(updatedConnection);
    } catch (error) {
      res.status(500).json({ error: `Error al actualizar estado: ${(error as Error).message}` });
    }
  });

  /**
   * Obtiene cuentas bancarias para una conexión
   */
  app.get('/api/banking/connections/:connectionId/accounts', verifyBankingAccess, async (req: Request, res: Response) => {
    try {
      const connectionId = parseInt(req.params.connectionId);
      
      if (isNaN(connectionId)) {
        return res.status(400).json({ error: 'ID de conexión inválido' });
      }
      
      // Primero verificar si ya tenemos cuentas para esta conexión
      const existingAccounts = await db
        .select()
        .from(bankAccounts)
        .where(eq(bankAccounts.connectionId, connectionId));
        
      if (existingAccounts.length > 0) {
        return res.status(200).json(existingAccounts);
      }
      
      // Si no hay cuentas, obtenerlas del banco
      const accounts = await bankingService.getAccounts(connectionId);
      
      res.status(200).json(accounts);
    } catch (error) {
      res.status(500).json({ error: `Error al obtener cuentas bancarias: ${(error as Error).message}` });
    }
  });

  /**
   * Obtiene saldos de una cuenta bancaria
   */
  app.get('/api/banking/accounts/:accountId/balances', verifyBankingAccess, async (req: Request, res: Response) => {
    try {
      const accountId = parseInt(req.params.accountId);
      
      if (isNaN(accountId)) {
        return res.status(400).json({ error: 'ID de cuenta inválido' });
      }
      
      const account = await bankingService.getAccountBalances(accountId);
      
      if (!account) {
        return res.status(500).json({ error: 'Error al obtener saldos de cuenta' });
      }
      
      res.status(200).json(account);
    } catch (error) {
      res.status(500).json({ error: `Error al obtener saldos: ${(error as Error).message}` });
    }
  });

  /**
   * Obtiene transacciones de una cuenta bancaria
   */
  app.get('/api/banking/accounts/:accountId/transactions', verifyBankingAccess, async (req: Request, res: Response) => {
    try {
      const accountId = parseInt(req.params.accountId);
      
      if (isNaN(accountId)) {
        return res.status(400).json({ error: 'ID de cuenta inválido' });
      }
      
      // Extraer fechas de consulta si existen
      const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
      const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;
      
      // Si no hay parámetros de fecha, verificar si existen transacciones previas
      if (!dateFrom && !dateTo) {
        const existingTransactions = await db
          .select()
          .from(bankTransactions)
          .where(eq(bankTransactions.accountId, accountId))
          .orderBy(desc(bankTransactions.transactionDate))
          .limit(100);
          
        if (existingTransactions.length > 0) {
          return res.status(200).json(existingTransactions);
        }
      }
      
      // Obtener transacciones del banco
      const transactions = await bankingService.getAccountTransactions(accountId, dateFrom, dateTo);
      
      res.status(200).json(transactions);
    } catch (error) {
      res.status(500).json({ error: `Error al obtener transacciones: ${(error as Error).message}` });
    }
  });

  /**
   * Inicia un pago desde una cuenta bancaria
   */
  app.post('/api/banking/accounts/:accountId/payments', verifyBankingAccess, async (req: Request, res: Response) => {
    try {
      const accountId = parseInt(req.params.accountId);
      
      if (isNaN(accountId)) {
        return res.status(400).json({ error: 'ID de cuenta inválido' });
      }
      
      const { creditorName, creditorIban, amount, currency, description } = req.body;
      
      if (!creditorName || !creditorIban || !amount || !currency) {
        return res.status(400).json({ error: 'Datos de pago incompletos' });
      }
      
      const paymentResult = await bankingService.initiatePayment(
        accountId,
        creditorName,
        creditorIban,
        parseFloat(amount),
        currency,
        description || 'Pago'
      );
      
      res.status(201).json({
        success: true,
        message: 'Pago iniciado correctamente',
        data: paymentResult
      });
    } catch (error) {
      res.status(500).json({ error: `Error al iniciar pago: ${(error as Error).message}` });
    }
  });

  /**
   * Gestiona reglas de categorización de transacciones
   */
  app.get('/api/banking/companies/:companyId/category-rules', verifyBankingAccess, async (req: Request, res: Response) => {
    try {
      const companyId = parseInt(req.params.companyId);
      
      if (isNaN(companyId)) {
        return res.status(400).json({ error: 'ID de compañía inválido' });
      }
      
      const rules = await db
        .select()
        .from(bankCategoriesRules)
        .where(eq(bankCategoriesRules.companyId, companyId))
        .orderBy(bankCategoriesRules.priority);
      
      res.status(200).json(rules);
    } catch (error) {
      res.status(500).json({ error: `Error al obtener reglas de categorización: ${(error as Error).message}` });
    }
  });

  app.post('/api/banking/companies/:companyId/category-rules', verifyBankingAccess, async (req: Request, res: Response) => {
    try {
      const companyId = parseInt(req.params.companyId);
      
      if (isNaN(companyId)) {
        return res.status(400).json({ error: 'ID de compañía inválido' });
      }
      
      const { name, pattern, category, priority } = req.body;
      
      if (!name || !pattern || !category) {
        return res.status(400).json({ error: 'Datos de regla incompletos' });
      }
      
      const [rule] = await db
        .insert(bankCategoriesRules)
        .values({
          companyId,
          name,
          pattern,
          category,
          priority: priority || 1,
          active: true
        })
        .returning();
      
      res.status(201).json(rule);
    } catch (error) {
      res.status(500).json({ error: `Error al crear regla de categorización: ${(error as Error).message}` });
    }
  });

  /**
   * Dashboard bancario con resumen de cuentas y transacciones recientes
   */
  app.get('/api/banking/companies/:companyId/dashboard', verifyBankingAccess, async (req: Request, res: Response) => {
    try {
      const companyId = parseInt(req.params.companyId);
      
      if (isNaN(companyId)) {
        return res.status(400).json({ error: 'ID de compañía inválido' });
      }
      
      // Obtener cuentas de la empresa
      const accounts = await db
        .select()
        .from(bankAccounts)
        .where(and(
          eq(bankAccounts.companyId, companyId),
          eq(bankAccounts.active, true)
        ));
      
      // Obtener balance total
      let totalBalance = 0;
      let totalAvailableBalance = 0;
      
      accounts.forEach(account => {
        totalBalance += account.balance;
        totalAvailableBalance += account.availableBalance || account.balance;
      });
      
      // Obtener las últimas transacciones
      const accountIds = accounts.map(a => a.id);
      let recentTransactions: typeof bankTransactions.$inferSelect[] = [];
      
      if (accountIds.length > 0) {
        // Construir una consulta con OR para cada ID de cuenta
        const whereConditions = accountIds.map(id => 
          eq(bankTransactions.accountId, id)
        );
        
        recentTransactions = await db
          .select()
          .from(bankTransactions)
          .where(whereConditions.length === 1 ? whereConditions[0] : or(...whereConditions))
          .orderBy(desc(bankTransactions.transactionDate))
          .limit(10);
      }
      
      // Agrupar transacciones por categoría para el gráfico
      const categoryGroups: Record<string, number> = {};
      
      recentTransactions.forEach(tx => {
        const category = tx.category || 'Sin categorizar';
        if (!categoryGroups[category]) {
          categoryGroups[category] = 0;
        }
        categoryGroups[category] += tx.amount;
      });
      
      const categoryData = Object.entries(categoryGroups).map(([name, amount]) => ({
        name,
        amount
      }));
      
      res.status(200).json({
        summary: {
          totalAccounts: accounts.length,
          totalBalance,
          totalAvailableBalance,
          lastSyncDate: Math.max(...accounts.map(a => a.lastSyncAt ? new Date(a.lastSyncAt).getTime() : 0))
        },
        accounts,
        recentTransactions,
        categoryData
      });
    } catch (error) {
      res.status(500).json({ error: `Error al obtener dashboard bancario: ${(error as Error).message}` });
    }
  });

  // Ruta para asociar una transacción bancaria con una factura
  app.put('/api/banking/transactions/:transactionId/link', verifyBankingAccess, async (req: Request, res: Response) => {
    try {
      const transactionId = parseInt(req.params.transactionId);
      const { invoiceId } = req.body;
      
      if (isNaN(transactionId) || !invoiceId) {
        return res.status(400).json({ error: 'IDs inválidos' });
      }
      
      const [updatedTransaction] = await db
        .update(bankTransactions)
        .set({ invoiceId })
        .where(eq(bankTransactions.id, transactionId))
        .returning();
      
      if (!updatedTransaction) {
        return res.status(404).json({ error: 'Transacción no encontrada' });
      }
      
      res.status(200).json(updatedTransaction);
    } catch (error) {
      res.status(500).json({ error: `Error al vincular transacción: ${(error as Error).message}` });
    }
  });

  // Ruta para actualizar la categoría de una transacción
  app.put('/api/banking/transactions/:transactionId/categorize', verifyBankingAccess, async (req: Request, res: Response) => {
    try {
      const transactionId = parseInt(req.params.transactionId);
      const { category } = req.body;
      
      if (isNaN(transactionId) || !category) {
        return res.status(400).json({ error: 'Datos inválidos' });
      }
      
      const [updatedTransaction] = await db
        .update(bankTransactions)
        .set({ category })
        .where(eq(bankTransactions.id, transactionId))
        .returning();
      
      if (!updatedTransaction) {
        return res.status(404).json({ error: 'Transacción no encontrada' });
      }
      
      res.status(200).json(updatedTransaction);
    } catch (error) {
      res.status(500).json({ error: `Error al categorizar transacción: ${(error as Error).message}` });
    }
  });
}