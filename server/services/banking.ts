/**
 * Servicio para integración bancaria mediante APIs de PSD2/Open Banking.
 * 
 * Este servicio proporciona funcionalidades para:
 * - Establecer consentimiento de acceso a cuentas bancarias
 * - Obtener información de cuentas
 * - Recuperar transacciones
 * - Realizar pagos
 */

import { log } from '../vite';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { db } from '../db';
import { 
  bankConnections, 
  bankAccounts, 
  bankTransactions, 
  BankConnection,
  BankAccount,
  BankTransaction,
  InsertBankConnection,
  InsertBankAccount,
  InsertBankTransaction
} from '@shared/schema';
import { eq, and } from 'drizzle-orm';

// Tipos para la API de PSD2

export interface PSD2Config {
  apiUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  certificatePath?: string;
  keyPath?: string;
}

export interface ConsentRequest {
  validUntil: Date;
  recurringIndicator: boolean;
  frequencyPerDay: number;
  combinedServiceIndicator?: boolean;
  access: {
    accounts?: string[];
    balances?: string[];
    transactions?: string[];
    availableAccounts?: 'allAccounts' | 'allAccountsWithOwnerName';
  };
}

export interface PSD2ConsentResponse {
  consentId: string;
  consentStatus: 'received' | 'valid' | 'rejected' | 'revoked' | 'expired';
  _links: {
    scaRedirect?: { href: string };
    scaStatus?: { href: string };
    self?: { href: string };
    status?: { href: string };
  };
}

export interface PSD2AccountResponse {
  account: {
    iban: string;
    currency: string;
    name?: string;
    cashAccountType?: string;
    status?: string;
    bic?: string;
    linkedAccounts?: string;
    usage?: 'PRIV' | 'ORGA';
    details?: string;
  };
  resourceId: string;
}

export interface PSD2AccountsResponse {
  accounts: PSD2AccountResponse[];
}

export interface PSD2Balance {
  balanceType: 'closingBooked' | 'expected' | 'openingBooked' | 'interimAvailable' | 'forwardAvailable' | 'nonInvoiced';
  balanceAmount: {
    currency: string;
    amount: string;
  };
  creditLimitIncluded?: boolean;
  lastChangeDateTime?: string;
  referenceDate?: string;
  lastCommittedTransaction?: string;
}

export interface PSD2BalancesResponse {
  account: { iban: string };
  balances: PSD2Balance[];
}

export interface PSD2TransactionResponse {
  transactionId?: string;
  entryReference?: string;
  endToEndId?: string;
  mandateId?: string;
  checkId?: string;
  creditorId?: string;
  bookingDate?: string;
  valueDate?: string;
  transactionAmount: {
    currency: string;
    amount: string;
  };
  creditorName?: string;
  creditorAccount?: {
    iban: string;
  };
  ultimateCreditor?: string;
  debtorName?: string;
  debtorAccount?: {
    iban: string;
  };
  ultimateDebtor?: string;
  remittanceInformationUnstructured?: string;
  remittanceInformationStructured?: string;
  purposeCode?: string;
  bankTransactionCode?: string;
  proprietaryBankTransactionCode?: string;
}

export interface PSD2TransactionsResponse {
  account: { iban: string };
  transactions: {
    booked?: PSD2TransactionResponse[];
    pending?: PSD2TransactionResponse[];
  };
}

/**
 * Servicio para interactuar con APIs bancarias PSD2/Open Banking
 */
export class BankingService {
  private apiUrl: string = '';
  private clientId: string = '';
  private clientSecret: string = '';
  private redirectUri: string = '';
  private apiClient: AxiosInstance | null = null;
  private initialized: boolean = false;

  /**
   * Inicializa el servicio con la configuración PSD2
   */
  initialize(config: PSD2Config): boolean {
    try {
      this.apiUrl = config.apiUrl;
      this.clientId = config.clientId;
      this.clientSecret = config.clientSecret;
      this.redirectUri = config.redirectUri;

      // Crear cliente Axios para las solicitudes
      const axiosConfig: AxiosRequestConfig = {
        baseURL: this.apiUrl,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Request-ID': this.generateRequestId()
        }
      };

      this.apiClient = axios.create(axiosConfig);
      this.initialized = true;
      log('Servicio bancario PSD2 inicializado correctamente', 'banking');
      return true;
    } catch (error) {
      log(`Error al inicializar servicio bancario PSD2: ${error}`, 'banking');
      this.initialized = false;
      return false;
    }
  }

  /**
   * Crea una solicitud de consentimiento para acceder a cuentas bancarias
   */
  async createConsent(companyId: number, request: ConsentRequest): Promise<BankConnection | null> {
    this.checkInitialized();

    try {
      // Autenticarse primero (OAuth2)
      const token = await this.getAccessToken();
      
      const response = await this.apiClient!.post('/v1/consents', request, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Request-ID': this.generateRequestId()
        }
      });

      const consentResponse: PSD2ConsentResponse = response.data;
      
      // Guardar los datos del consentimiento en la base de datos
      const connectionData: InsertBankConnection = {
        companyId,
        provider: 'psd2',
        consentId: consentResponse.consentId,
        status: consentResponse.consentStatus,
        accessToken: token,
        expiresAt: this.calculateExpiryDate(request.validUntil),
        metadata: consentResponse
      };
      
      const [newConnection] = await db
        .insert(bankConnections)
        .values(connectionData)
        .returning();
      
      return newConnection;
    } catch (error) {
      log(`Error al crear consentimiento bancario: ${error}`, 'banking');
      return null;
    }
  }

  /**
   * Actualiza el estado de un consentimiento existente
   */
  async updateConsentStatus(connectionId: number): Promise<BankConnection | null> {
    this.checkInitialized();

    try {
      // Obtener conexión existente
      const [connection] = await db
        .select()
        .from(bankConnections)
        .where(eq(bankConnections.id, connectionId));

      if (!connection || !connection.consentId) {
        throw new Error('Conexión bancaria no encontrada o sin consentimiento válido');
      }

      // Autenticarse
      const token = await this.getAccessToken();
      
      // Obtener estado actual del consentimiento
      const response = await this.apiClient!.get(`/v1/consents/${connection.consentId}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Request-ID': this.generateRequestId()
        }
      });

      // Actualizar estado en la base de datos
      const [updatedConnection] = await db
        .update(bankConnections)
        .set({
          status: response.data.consentStatus,
          updatedAt: new Date()
        })
        .where(eq(bankConnections.id, connectionId))
        .returning();
      
      return updatedConnection;
    } catch (error) {
      log(`Error al actualizar estado de consentimiento: ${error}`, 'banking');
      return null;
    }
  }

  /**
   * Obtiene la lista de cuentas disponibles para un consentimiento
   */
  async getAccounts(connectionId: number): Promise<BankAccount[]> {
    this.checkInitialized();

    try {
      // Obtener conexión existente
      const [connection] = await db
        .select()
        .from(bankConnections)
        .where(eq(bankConnections.id, connectionId));

      if (!connection || !connection.consentId || connection.status !== 'valid') {
        throw new Error('Conexión bancaria no encontrada o sin consentimiento válido');
      }

      // Autenticarse
      const token = connection.accessToken || await this.getAccessToken();
      
      // Obtener cuentas
      const response = await this.apiClient!.get('/v1/accounts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Consent-ID': connection.consentId,
          'X-Request-ID': this.generateRequestId()
        }
      });

      const accountsResponse: PSD2AccountsResponse = response.data;
      const companyId = connection.companyId;
      const results: BankAccount[] = [];

      // Guardar cada cuenta en la base de datos
      for (const acc of accountsResponse.accounts) {
        // Verificar si la cuenta ya existe
        const [existingAccount] = await db
          .select()
          .from(bankAccounts)
          .where(
            and(
              eq(bankAccounts.connectionId, connectionId),
              eq(bankAccounts.accountId, acc.resourceId)
            )
          );

        if (existingAccount) {
          // Actualizar cuenta existente
          const [updatedAccount] = await db
            .update(bankAccounts)
            .set({
              accountName: acc.account.name || `Account ${acc.resourceId}`,
              accountNumber: acc.account.iban,
              updatedAt: new Date()
            })
            .where(eq(bankAccounts.id, existingAccount.id))
            .returning();
          
          results.push(updatedAccount);
        } else {
          // Crear nueva cuenta
          const accountData: InsertBankAccount = {
            companyId,
            connectionId,
            accountId: acc.resourceId,
            accountNumber: acc.account.iban,
            accountName: acc.account.name || `Account ${acc.resourceId}`,
            bankName: 'Bank', // Este dato no viene en la respuesta PSD2
            type: 'checking', // Por defecto, habría que determinar el tipo basado en cashAccountType
            currency: acc.account.currency,
            balance: 0,
            availableBalance: 0,
            active: true,
            metadata: acc
          };
          
          const [newAccount] = await db
            .insert(bankAccounts)
            .values(accountData)
            .returning();
          
          results.push(newAccount);
        }
      }

      return results;
    } catch (error) {
      log(`Error al obtener cuentas bancarias: ${error}`, 'banking');
      return [];
    }
  }

  /**
   * Obtiene los saldos de una cuenta específica
   */
  async getAccountBalances(accountId: number): Promise<BankAccount | null> {
    this.checkInitialized();

    try {
      // Obtener cuenta existente con su conexión
      const [account] = await db
        .select()
        .from(bankAccounts)
        .where(eq(bankAccounts.id, accountId));

      if (!account) {
        throw new Error('Cuenta bancaria no encontrada');
      }

      // Obtener conexión
      const [connection] = await db
        .select()
        .from(bankConnections)
        .where(eq(bankConnections.id, account.connectionId));

      if (!connection || !connection.consentId || connection.status !== 'valid') {
        throw new Error('Conexión bancaria no encontrada o sin consentimiento válido');
      }

      // Autenticarse
      const token = connection.accessToken || await this.getAccessToken();
      
      // Obtener saldos
      const response = await this.apiClient!.get(`/v1/accounts/${account.accountId}/balances`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Consent-ID': connection.consentId,
          'X-Request-ID': this.generateRequestId()
        }
      });

      const balancesResponse: PSD2BalancesResponse = response.data;
      
      // Encontrar el saldo disponible y el saldo contable
      let balance = 0;
      let availableBalance = 0;
      
      for (const bal of balancesResponse.balances) {
        if (bal.balanceType === 'closingBooked') {
          balance = parseFloat(bal.balanceAmount.amount);
        }
        if (bal.balanceType === 'interimAvailable') {
          availableBalance = parseFloat(bal.balanceAmount.amount);
        }
      }

      // Actualizar saldos en la base de datos
      const [updatedAccount] = await db
        .update(bankAccounts)
        .set({
          balance,
          availableBalance,
          lastSyncAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(bankAccounts.id, accountId))
        .returning();
      
      return updatedAccount;
    } catch (error) {
      log(`Error al obtener saldos de cuenta: ${error}`, 'banking');
      return null;
    }
  }

  /**
   * Obtiene las transacciones de una cuenta específica
   */
  async getAccountTransactions(accountId: number, dateFrom?: Date, dateTo?: Date): Promise<BankTransaction[]> {
    this.checkInitialized();

    try {
      // Obtener cuenta existente con su conexión
      const [account] = await db
        .select()
        .from(bankAccounts)
        .where(eq(bankAccounts.id, accountId));

      if (!account) {
        throw new Error('Cuenta bancaria no encontrada');
      }

      // Obtener conexión
      const [connection] = await db
        .select()
        .from(bankConnections)
        .where(eq(bankConnections.id, account.connectionId));

      if (!connection || !connection.consentId || connection.status !== 'valid') {
        throw new Error('Conexión bancaria no encontrada o sin consentimiento válido');
      }

      // Autenticarse
      const token = connection.accessToken || await this.getAccessToken();
      
      // Construir parámetros de consulta para fechas
      let queryParams = '';
      if (dateFrom) {
        queryParams += `?dateFrom=${dateFrom.toISOString().split('T')[0]}`;
        if (dateTo) {
          queryParams += `&dateTo=${dateTo.toISOString().split('T')[0]}`;
        }
      }
      
      // Obtener transacciones
      const response = await this.apiClient!.get(`/v1/accounts/${account.accountId}/transactions${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Consent-ID': connection.consentId,
          'X-Request-ID': this.generateRequestId()
        }
      });

      const transactionsResponse: PSD2TransactionsResponse = response.data;
      const results: BankTransaction[] = [];
      
      // Procesar transacciones contabilizadas
      if (transactionsResponse.transactions.booked) {
        for (const tx of transactionsResponse.transactions.booked) {
          // Verificar si la transacción ya existe
          if (!tx.transactionId) continue;
          
          const [existingTx] = await db
            .select()
            .from(bankTransactions)
            .where(
              and(
                eq(bankTransactions.accountId, accountId),
                eq(bankTransactions.externalId, tx.transactionId)
              )
            );

          if (!existingTx) {
            // Crear nueva transacción
            const amount = parseFloat(tx.transactionAmount.amount);
            
            // Determinar el tipo de transacción basado en el monto
            let type: 'payment' | 'charge' | 'transfer' | 'deposit' | 'withdrawal' | 'fee' = 'transfer';
            if (amount > 0) {
              type = 'deposit';
            } else if (amount < 0) {
              type = 'withdrawal';
              // Si tiene un acreedor, probablemente sea un pago
              if (tx.creditorName) {
                type = 'payment';
              }
            }

            const txData: InsertBankTransaction = {
              accountId,
              externalId: tx.transactionId,
              type,
              amount: Math.abs(amount), // Guardamos el valor absoluto
              currency: tx.transactionAmount.currency,
              description: tx.remittanceInformationUnstructured || '',
              counterpartyName: amount < 0 ? tx.creditorName : tx.debtorName,
              counterpartyAccount: amount < 0 ? tx.creditorAccount?.iban : tx.debtorAccount?.iban,
              reference: tx.endToEndId || tx.entryReference || '',
              transactionDate: tx.bookingDate ? new Date(tx.bookingDate) : new Date(),
              valueDate: tx.valueDate ? new Date(tx.valueDate) : undefined,
              status: 'booked',
              bookingDate: tx.bookingDate ? new Date(tx.bookingDate) : new Date(),
              metadata: tx
            };
            
            const [newTx] = await db
              .insert(bankTransactions)
              .values(txData)
              .returning();
            
            results.push(newTx);
          }
        }
      }
      
      // Procesar transacciones pendientes
      if (transactionsResponse.transactions.pending) {
        for (const tx of transactionsResponse.transactions.pending) {
          // Similar a las contabilizadas, pero con estado 'pending'
          if (!tx.transactionId) continue;
          
          const [existingTx] = await db
            .select()
            .from(bankTransactions)
            .where(
              and(
                eq(bankTransactions.accountId, accountId),
                eq(bankTransactions.externalId, tx.transactionId)
              )
            );

          if (!existingTx) {
            const amount = parseFloat(tx.transactionAmount.amount);
            
            let type: 'payment' | 'charge' | 'transfer' | 'deposit' | 'withdrawal' | 'fee' = 'transfer';
            if (amount > 0) {
              type = 'deposit';
            } else if (amount < 0) {
              type = 'withdrawal';
              if (tx.creditorName) {
                type = 'payment';
              }
            }

            const txData: InsertBankTransaction = {
              accountId,
              externalId: tx.transactionId,
              type,
              amount: Math.abs(amount),
              currency: tx.transactionAmount.currency,
              description: tx.remittanceInformationUnstructured || '',
              counterpartyName: amount < 0 ? tx.creditorName : tx.debtorName,
              counterpartyAccount: amount < 0 ? tx.creditorAccount?.iban : tx.debtorAccount?.iban,
              reference: tx.endToEndId || tx.entryReference || '',
              transactionDate: tx.valueDate ? new Date(tx.valueDate) : new Date(),
              status: 'pending',
              metadata: tx
            };
            
            const [newTx] = await db
              .insert(bankTransactions)
              .values(txData)
              .returning();
            
            results.push(newTx);
          }
        }
      }

      return results;
    } catch (error) {
      log(`Error al obtener transacciones: ${error}`, 'banking');
      return [];
    }
  }

  /**
   * Iniciar proceso de pago PSD2
   * Este es un método simplificado que solo muestra el concepto, 
   * los pagos reales necesitarían más pasos y validaciones
   */
  async initiatePayment(
    accountId: number, 
    creditorName: string, 
    creditorIban: string, 
    amount: number, 
    currency: string, 
    description: string
  ): Promise<any> {
    this.checkInitialized();

    try {
      // Obtener cuenta existente con su conexión
      const [account] = await db
        .select()
        .from(bankAccounts)
        .where(eq(bankAccounts.id, accountId));

      if (!account) {
        throw new Error('Cuenta bancaria no encontrada');
      }

      // Obtener conexión
      const [connection] = await db
        .select()
        .from(bankConnections)
        .where(eq(bankConnections.id, account.connectionId));

      if (!connection || !connection.consentId || connection.status !== 'valid') {
        throw new Error('Conexión bancaria no encontrada o sin consentimiento válido');
      }

      // Autenticarse
      const token = connection.accessToken || await this.getAccessToken();
      
      // Crear solicitud de pago
      const paymentRequest = {
        instructedAmount: {
          currency,
          amount: amount.toFixed(2)
        },
        debtorAccount: {
          iban: account.accountNumber
        },
        creditorName,
        creditorAccount: {
          iban: creditorIban
        },
        remittanceInformationUnstructured: description
      };
      
      // Iniciar el pago
      const response = await this.apiClient!.post('/v1/payments/sepa-credit-transfers', paymentRequest, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Consent-ID': connection.consentId,
          'X-Request-ID': this.generateRequestId()
        }
      });

      // El pago generalmente requiere autenticación adicional por parte del usuario (SCA)
      // La respuesta contendría un enlace para redirigir al usuario
      return response.data;
    } catch (error) {
      log(`Error al iniciar pago: ${error}`, 'banking');
      throw error;
    }
  }

  // Métodos de utilidad privados

  private generateRequestId(): string {
    // Genera un UUID v4 para identificar las peticiones
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private calculateExpiryDate(validUntil: Date): Date {
    // Si la fecha proporcionada es válida, la usamos; de lo contrario, 90 días a partir de ahora
    if (validUntil && validUntil.getTime() > Date.now()) {
      return validUntil;
    }
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 90);
    return expiryDate;
  }

  private async getAccessToken(): Promise<string> {
    // Implementación simplificada para obtener token OAuth2
    // En una implementación real, esto manejaría flujos de OAuth2 completos
    try {
      const response = await this.apiClient!.post('/oauth/token', {
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        scope: 'ais pis'
      });
      
      return response.data.access_token;
    } catch (error) {
      log(`Error al obtener token de acceso: ${error}`, 'banking');
      throw error;
    }
  }

  // Verificación de inicialización
  private checkInitialized(): void {
    if (!this.initialized || !this.apiClient) {
      throw new Error('Servicio bancario PSD2 no inicializado');
    }
  }
}

// Instancia única del servicio
export const bankingService = new BankingService();