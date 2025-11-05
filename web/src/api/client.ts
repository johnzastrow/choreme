import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import type {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  LedgerEntry,
  DepositRequest,
  WithdrawalRequest,
  TransferRequest,
  CreateTransferRequest,
  SpendingLimit,
  SetSpendingLimitsRequest,
  SpendingCheckResult,
  Chore,
  Assignment,
  Reward,
  Redemption,
  APIResponse,
} from '@/types'

class APIClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: '/api/v1',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('auth_token')
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<APIResponse>) => {
        if (error.response?.status === 401) {
          // Clear auth and redirect to login
          localStorage.removeItem('auth_token')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Authentication
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', data)
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token)
    }
    return response.data
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/register', data)
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token)
    }
    return response.data
  }

  logout() {
    localStorage.removeItem('auth_token')
  }

  // Users
  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/users/me')
    return response.data
  }

  async getUsers(): Promise<User[]> {
    const response = await this.client.get<User[]>('/users')
    return response.data
  }

  async updateCurrentUser(data: Partial<User>): Promise<User> {
    const response = await this.client.put<User>('/users/me', data)
    return response.data
  }

  // Ledger
  async getLedgerEntries(userId?: number): Promise<LedgerEntry[]> {
    const params = userId ? { user_id: userId } : {}
    const response = await this.client.get<LedgerEntry[]>('/ledger', { params })
    return response.data
  }

  async getUserBalance(userId?: number): Promise<string> {
    const params = userId ? { user_id: userId } : {}
    const response = await this.client.get<{ balance: string }>('/ledger/balance', { params })
    return response.data.balance
  }

  // Account Management
  async deposit(data: DepositRequest): Promise<void> {
    await this.client.post('/accounts/deposit', data)
  }

  async withdraw(data: WithdrawalRequest): Promise<void> {
    await this.client.post('/accounts/withdraw', data)
  }

  async checkSpendingLimit(amount: string): Promise<SpendingCheckResult> {
    const response = await this.client.get<SpendingCheckResult>('/accounts/spending-limit/check', {
      params: { amount }
    })
    return response.data
  }

  // Transfers
  async createTransfer(data: CreateTransferRequest): Promise<TransferRequest> {
    const response = await this.client.post<{ transfer: TransferRequest }>('/accounts/transfer', data)
    return response.data.transfer
  }

  async getTransfers(): Promise<TransferRequest[]> {
    const response = await this.client.get<{ transfers: TransferRequest[] }>('/accounts/transfers')
    return response.data.transfers
  }

  async getPendingTransfers(): Promise<TransferRequest[]> {
    const response = await this.client.get<{ transfers: TransferRequest[] }>('/accounts/transfers/pending')
    return response.data.transfers
  }

  async approveTransfer(transferId: number, approved: boolean, rejectionReason?: string): Promise<void> {
    await this.client.post(`/accounts/transfers/${transferId}/approve`, {
      approved,
      rejection_reason: rejectionReason
    })
  }

  // Spending Limits
  async getSpendingLimits(userId: number): Promise<SpendingLimit> {
    const response = await this.client.get<{ limit: SpendingLimit }>(`/accounts/spending-limits/${userId}`)
    return response.data.limit
  }

  async setSpendingLimits(data: SetSpendingLimitsRequest): Promise<void> {
    await this.client.post('/accounts/spending-limits', data)
  }

  async resetSpendingLimits(userId: number): Promise<void> {
    await this.client.post(`/accounts/spending-limits/${userId}/reset`)
  }

  // Interest
  async setInterestRate(userId: number, annualRate: string): Promise<void> {
    await this.client.post('/accounts/interest-rate', {
      user_id: userId,
      interest_rate_annual: annualRate
    })
  }

  // Chores
  async getChores(): Promise<Chore[]> {
    const response = await this.client.get<Chore[]>('/chores')
    return response.data
  }

  async getChore(id: number): Promise<Chore> {
    const response = await this.client.get<Chore>(`/chores/${id}`)
    return response.data
  }

  async createChore(data: Partial<Chore>): Promise<Chore> {
    const response = await this.client.post<Chore>('/chores', data)
    return response.data
  }

  async updateChore(id: number, data: Partial<Chore>): Promise<Chore> {
    const response = await this.client.put<Chore>(`/chores/${id}`, data)
    return response.data
  }

  async deleteChore(id: number): Promise<void> {
    await this.client.delete(`/chores/${id}`)
  }

  // Assignments
  async getAssignments(): Promise<Assignment[]> {
    const response = await this.client.get<Assignment[]>('/assignments')
    return response.data
  }

  async updateProgress(id: number, percentComplete: string): Promise<void> {
    await this.client.patch(`/assignments/${id}/progress`, {
      percent_complete: percentComplete
    })
  }

  async completeChore(id: number, percentComplete: string, proofImage?: string): Promise<void> {
    await this.client.patch(`/assignments/${id}/complete`, {
      percent_complete: percentComplete,
      proof_image: proofImage
    })
  }

  async approveChore(id: number, notes?: string): Promise<void> {
    await this.client.patch(`/assignments/${id}/approve`, {
      approval_notes: notes
    })
  }

  async rejectChore(id: number, notes?: string): Promise<void> {
    await this.client.patch(`/assignments/${id}/reject`, {
      approval_notes: notes
    })
  }

  // Rewards
  async getRewards(): Promise<Reward[]> {
    const response = await this.client.get<Reward[]>('/rewards')
    return response.data
  }

  async createReward(data: Partial<Reward>): Promise<Reward> {
    const response = await this.client.post<Reward>('/rewards', data)
    return response.data
  }

  async redeemReward(id: number): Promise<void> {
    await this.client.post(`/rewards/${id}/redeem`)
  }

  // Redemptions
  async getRedemptions(): Promise<Redemption[]> {
    const response = await this.client.get<Redemption[]>('/redemptions')
    return response.data
  }

  async approveRedemption(id: number): Promise<void> {
    await this.client.patch(`/redemptions/${id}/approve`)
  }

  async rejectRedemption(id: number): Promise<void> {
    await this.client.patch(`/redemptions/${id}/reject`)
  }
}

export const api = new APIClient()
export default api
