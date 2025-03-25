import { apiRequest } from "./queryClient";

/**
 * Cliente API para servicios bancarios PSD2/Open Banking
 */

// Tipos para el servicio bancario
export interface PSD2Config {
  bankName: string;
  apiUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  sandbox?: boolean;
  certificatePath?: string;
  keyPath?: string;
}

export interface ConsentRequest {
  companyId: number;
  validUntil?: string;
  recurringIndicator?: boolean;
  frequencyPerDay?: number;
  access?: {
    accounts?: string[];
    balances?: string[];
    transactions?: string[];
    availableAccounts?: 'allAccounts' | 'allAccountsWithOwnerName';
  };
}

export interface BankConnection {
  id: number;
  companyId: number;
  name: string;
  provider: string;
  status: "pending" | "active" | "expired" | "revoked";
  consentId: string;
  lastUpdated: string;
  validUntil: string;
  createdAt: string;
  redirectUrl?: string;
}

export interface BankAccount {
  id: number;
  connectionId: number;
  accountNumber: string;
  iban: string;
  name: string;
  type: "checking" | "savings" | "credit";
  balance: number;
  availableBalance: number;
  currency: string;
  lastUpdated: string;
  bankName: string;
  status: string;
}

export interface Transaction {
  id: number;
  accountId: number;
  amount: number;
  currency: string;
  date: string;
  valueDate: string;
  description: string;
  type: "payment" | "charge" | "transfer" | "deposit" | "withdrawal" | "fee";
  categoryId?: number;
  reference?: string;
  counterparty?: string;
  status: string;
}

export interface MonthlyBalance {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface Category {
  id: number;
  companyId: number;
  name: string;
  color?: string;
  icon?: string;
  description?: string;
}

export interface CategoryRule {
  id: number;
  companyId: number;
  pattern: string;
  categoryId: number;
  field: "description" | "reference" | "counterparty";
  isRegex: boolean;
  priority: number;
}

/**
 * Configura la conexión con la API bancaria
 */
export async function configureBankingAPI(config: PSD2Config): Promise<{ success: boolean, message: string }> {
  try {
    const res = await apiRequest("POST", "/api/banking/config", config);
    return await res.json();
  } catch (error) {
    console.error("Error configurando API bancaria:", error);
    throw new Error(`Error al configurar API bancaria: ${(error as Error).message}`);
  }
}

/**
 * Crea un nuevo consentimiento bancario
 */
export async function createConsent(request: ConsentRequest): Promise<BankConnection> {
  try {
    const res = await apiRequest("POST", "/api/banking/consents", request);
    return await res.json();
  } catch (error) {
    console.error("Error creando consentimiento:", error);
    throw new Error(`Error al crear consentimiento: ${(error as Error).message}`);
  }
}

/**
 * Obtiene conexiones bancarias para una compañía
 */
export async function getCompanyConnections(companyId: number): Promise<BankConnection[]> {
  try {
    const res = await apiRequest("GET", `/api/banking/connections/${companyId}`);
    return await res.json();
  } catch (error) {
    console.error("Error obteniendo conexiones:", error);
    throw new Error(`Error al obtener conexiones: ${(error as Error).message}`);
  }
}

/**
 * Actualiza el estado de una conexión bancaria
 */
export async function updateConnectionStatus(connectionId: number): Promise<BankConnection> {
  try {
    const res = await apiRequest("PUT", `/api/banking/connections/${connectionId}/status`);
    return await res.json();
  } catch (error) {
    console.error("Error actualizando estado de conexión:", error);
    throw new Error(`Error al actualizar estado: ${(error as Error).message}`);
  }
}

/**
 * Obtiene cuentas bancarias para todas las conexiones
 */
export async function getAllBankAccounts(): Promise<BankAccount[]> {
  try {
    const res = await apiRequest("GET", `/api/banking/accounts`);
    return await res.json();
  } catch (error) {
    console.error("Error obteniendo cuentas:", error);
    throw new Error(`Error al obtener cuentas: ${(error as Error).message}`);
  }
}

/**
 * Obtiene cuentas bancarias para una conexión
 */
export async function getConnectionAccounts(connectionId: number): Promise<BankAccount[]> {
  try {
    const res = await apiRequest("GET", `/api/banking/connections/${connectionId}/accounts`);
    return await res.json();
  } catch (error) {
    console.error("Error obteniendo cuentas:", error);
    throw new Error(`Error al obtener cuentas: ${(error as Error).message}`);
  }
}

/**
 * Obtiene saldos de una cuenta bancaria
 */
export async function getAccountBalances(accountId: number): Promise<BankAccount> {
  try {
    const res = await apiRequest("GET", `/api/banking/accounts/${accountId}/balances`);
    return await res.json();
  } catch (error) {
    console.error("Error obteniendo saldos:", error);
    throw new Error(`Error al obtener saldos: ${(error as Error).message}`);
  }
}

/**
 * Obtiene transacciones de una cuenta bancaria
 */
export async function getAccountTransactions(
  accountId: number, 
  dateFrom?: string, 
  dateTo?: string
): Promise<Transaction[]> {
  try {
    let url = `/api/banking/accounts/${accountId}/transactions`;
    
    if (dateFrom || dateTo) {
      const params = new URLSearchParams();
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);
      url += `?${params.toString()}`;
    }
    
    const res = await apiRequest("GET", url);
    return await res.json();
  } catch (error) {
    console.error("Error obteniendo transacciones:", error);
    throw new Error(`Error al obtener transacciones: ${(error as Error).message}`);
  }
}

/**
 * Obtiene transacciones recientes para todas las cuentas
 */
export async function getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
  try {
    const res = await apiRequest("GET", `/api/banking/transactions/recent?limit=${limit}`);
    return await res.json();
  } catch (error) {
    console.error("Error obteniendo transacciones recientes:", error);
    throw new Error(`Error al obtener transacciones recientes: ${(error as Error).message}`);
  }
}

/**
 * Obtiene los balances mensuales para análisis
 */
export async function getMonthlyBalances(months: number = 6): Promise<MonthlyBalance[]> {
  try {
    const res = await apiRequest("GET", `/api/banking/balances/monthly?months=${months}`);
    return await res.json();
  } catch (error) {
    console.error("Error obteniendo balances mensuales:", error);
    throw new Error(`Error al obtener balances mensuales: ${(error as Error).message}`);
  }
}

/**
 * Obtiene las categorías de transacciones
 */
export async function getCategories(companyId: number): Promise<Category[]> {
  try {
    const res = await apiRequest("GET", `/api/banking/companies/${companyId}/categories`);
    return await res.json();
  } catch (error) {
    console.error("Error obteniendo categorías:", error);
    throw new Error(`Error al obtener categorías: ${(error as Error).message}`);
  }
}

/**
 * Crea una categoría para transacciones
 */
export async function createCategory(companyId: number, data: Omit<Category, "id" | "companyId">): Promise<Category> {
  try {
    const res = await apiRequest("POST", `/api/banking/companies/${companyId}/categories`, data);
    return await res.json();
  } catch (error) {
    console.error("Error creando categoría:", error);
    throw new Error(`Error al crear categoría: ${(error as Error).message}`);
  }
}

/**
 * Obtiene las reglas de categorización
 */
export async function getCategoryRules(companyId: number): Promise<CategoryRule[]> {
  try {
    const res = await apiRequest("GET", `/api/banking/companies/${companyId}/category-rules`);
    return await res.json();
  } catch (error) {
    console.error("Error obteniendo reglas:", error);
    throw new Error(`Error al obtener reglas: ${(error as Error).message}`);
  }
}

/**
 * Crea una regla de categorización
 */
export async function createCategoryRule(
  companyId: number, 
  data: Omit<CategoryRule, "id" | "companyId">
): Promise<CategoryRule> {
  try {
    const res = await apiRequest("POST", `/api/banking/companies/${companyId}/category-rules`, data);
    return await res.json();
  } catch (error) {
    console.error("Error creando regla:", error);
    throw new Error(`Error al crear regla: ${(error as Error).message}`);
  }
}

/**
 * Actualiza la categoría de una transacción
 */
export async function categorizeTransaction(
  transactionId: number, 
  categoryId: number
): Promise<Transaction> {
  try {
    const res = await apiRequest("PUT", `/api/banking/transactions/${transactionId}/categorize`, { categoryId });
    return await res.json();
  } catch (error) {
    console.error("Error categorizando transacción:", error);
    throw new Error(`Error al categorizar transacción: ${(error as Error).message}`);
  }
}

/**
 * Obtiene el resumen del dashboard bancario
 */
export async function getBankingDashboard(companyId: number): Promise<any> {
  try {
    const res = await apiRequest("GET", `/api/banking/companies/${companyId}/dashboard`);
    return await res.json();
  } catch (error) {
    console.error("Error obteniendo dashboard:", error);
    throw new Error(`Error al obtener dashboard: ${(error as Error).message}`);
  }
}