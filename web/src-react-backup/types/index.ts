export interface User {
  id: string;
  name: string;
  email: string;
  role: 'system_admin' | 'admin' | 'manager' | 'worker' | 'observer';
  household_id: string;
  notification_pref_email: boolean;
  notification_pref_push: boolean;
  created_at: string;
  updated_at: string;
}

export interface Household {
  id: string;
  name: string;
  invite_code?: string;
  created_at: string;
  updated_at: string;
}

export interface Chore {
  id: string;
  household_id: string;
  name: string;
  description: string;
  value: number;
  difficulty_level: number;
  estimated_duration_minutes: number;
  category: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  auto_approve: boolean;
  late_penalty_percentage: number;
  expires_after_hours?: number;
  proof_required: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  chore_id: string;
  user_id: string;
  household_id: string;
  due_date: string;
  assigned_date: string;
  status: 'assigned' | 'in_progress' | 'pending_approval' | 'completed' | 'rejected' | 'expired';
  progress_percentage: number;
  completion_date?: string;
  approval_date?: string;
  approved_by?: string;
  rejection_reason?: string;
  proof_photo_url?: string;
  created_at: string;
  updated_at: string;
  chore?: Chore;
}

export interface LedgerEntry {
  id: string;
  user_id: string;
  household_id: string;
  type: 'chore_completion' | 'reward_redemption' | 'manual_adjustment';
  amount: number;
  description: string;
  reference_id?: string;
  created_by: string;
  created_at: string;
}

export interface Reward {
  id: string;
  household_id: string;
  name: string;
  description: string;
  cost: number;
  is_active: boolean;
  quantity_limit?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Redemption {
  id: string;
  user_id: string;
  reward_id: string;
  household_id: string;
  status: 'pending' | 'approved' | 'rejected';
  cost: number;
  requested_date: string;
  approval_date?: string;
  approved_by?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  reward?: Reward;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  household_name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface JoinHouseholdRequest {
  name: string;
  email: string;
  password: string;
  invite_code: string;
}