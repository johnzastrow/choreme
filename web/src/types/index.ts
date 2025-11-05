// User and Authentication Types
export type Role = 'system_admin' | 'admin' | 'manager' | 'worker' | 'observer'

export interface User {
  id: number
  household_id: number
  name: string
  email: string
  role: Role
  notification_pref_email: boolean
  notification_pref_push: boolean
  interest_rate_annual: string
  last_interest_date?: string
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  household_name: string
  name: string
  email: string
  password: string
}

// Ledger and Account Types
export type LedgerType = 'earn' | 'spend' | 'adjust' | 'deposit' | 'withdrawal' | 'transfer' | 'interest'

export interface LedgerEntry {
  id: number
  user_id: number
  type: LedgerType
  amount: string
  description?: string
  chore_assignment_id?: number
  redemption_id?: number
  transfer_request_id?: number
  running_balance: string
  created_at: string
}

export interface DepositRequest {
  user_id: number
  amount: string
  description: string
}

export interface WithdrawalRequest {
  amount: string
  description: string
}

// Transfer Types
export type TransferStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface TransferRequest {
  id: number
  from_user_id: number
  to_user_id: number
  amount: string
  description: string
  status: TransferStatus
  requested_at: string
  approved_at?: string
  approved_by?: number
  rejection_reason?: string
  created_at: string
  updated_at: string
  from_user?: User
  to_user?: User
  approved_by_user?: User
}

export interface CreateTransferRequest {
  to_user_id: number
  amount: string
  description: string
}

// Spending Limits
export interface SpendingLimit {
  id: number
  user_id: number
  daily_limit?: string
  weekly_limit?: string
  monthly_limit?: string
  daily_spent: string
  weekly_spent: string
  monthly_spent: string
  daily_reset_at: string
  weekly_reset_at: string
  monthly_reset_at: string
  is_daily_blocked: boolean
  is_weekly_blocked: boolean
  is_monthly_blocked: boolean
  created_at: string
  updated_at: string
}

export interface SetSpendingLimitsRequest {
  user_id: number
  daily_limit?: string
  weekly_limit?: string
  monthly_limit?: string
}

export interface SpendingCheckResult {
  allowed: boolean
  amount: string
  daily_remaining?: string
  weekly_remaining?: string
  monthly_remaining?: string
  limit_type?: string
  suggested_amount?: string
  message: string
}

// Chore Types
export type Priority = 'low' | 'medium' | 'high'
export type AssignmentStatus = 'pending' | 'in_progress' | 'completed' | 'approved' | 'rejected' | 'late'

export interface Chore {
  id: number
  household_id: number
  title: string
  description?: string
  value: string
  frequency?: string
  category?: string
  priority: Priority
  auto_approve: boolean
  proof_required: boolean
  late_penalty_pct: string
  expire_days?: number
  created_by: number
  created_at: string
  updated_at: string
}

export interface Assignment {
  id: number
  chore_id: number
  assigned_to: number
  due_date: string
  percent_complete: string
  status: AssignmentStatus
  approval_notes?: string
  completed_at?: string
  approved_at?: string
  created_at: string
  updated_at: string
  chore?: Chore
  user?: User
}

// Reward Types
export interface Reward {
  id: number
  household_id: number
  title: string
  description?: string
  cost: string
  is_active: boolean
  created_at: string
}

export type RedemptionStatus = 'pending' | 'approved' | 'rejected'

export interface Redemption {
  id: number
  reward_id: number
  user_id: number
  status: RedemptionStatus
  redeemed_at: string
  approved_at?: string
  reward?: Reward
  user?: User
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  per_page: number
  total: number
  total_pages: number
}

// Household Types
export interface Household {
  id: number
  name: string
  invite_code?: string
  created_at: string
}

// Audit Log Types
export interface AuditLog {
  id: number
  household_id: number
  user_id: number
  action: string
  details?: Record<string, any>
  created_at: string
  user?: User
}
