import { 
  APIResponse, 
  AuthResponse, 
  RegisterRequest, 
  LoginRequest, 
  JoinHouseholdRequest,
  User,
  Assignment,
  Chore,
  LedgerEntry,
  Reward,
  Redemption
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<APIResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.success && response.data) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async login(data: LoginRequest): Promise<APIResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.success && response.data) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async joinHousehold(data: JoinHouseholdRequest): Promise<APIResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/households/join', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.success && response.data) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  // User endpoints
  async getCurrentUser(): Promise<APIResponse<User>> {
    return this.request<User>('/users/me');
  }

  async updateCurrentUser(data: Partial<User>): Promise<APIResponse<User>> {
    return this.request<User>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Assignment endpoints
  async getAssignments(): Promise<APIResponse<Assignment[]>> {
    return this.request<Assignment[]>('/assignments');
  }

  async getAssignment(id: string): Promise<APIResponse<Assignment>> {
    return this.request<Assignment>(`/assignments/${id}`);
  }

  async updateProgress(id: string, percentage: number): Promise<APIResponse<Assignment>> {
    return this.request<Assignment>(`/assignments/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ progress_percentage: percentage }),
    });
  }

  async completeChore(id: string, proofPhotoUrl?: string): Promise<APIResponse<Assignment>> {
    return this.request<Assignment>(`/assignments/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ proof_photo_url: proofPhotoUrl }),
    });
  }

  // Chore endpoints
  async getChores(): Promise<APIResponse<Chore[]>> {
    return this.request<Chore[]>('/chores');
  }

  // Ledger endpoints
  async getLedger(): Promise<APIResponse<LedgerEntry[]>> {
    return this.request<LedgerEntry[]>('/ledger');
  }

  async getBalance(): Promise<APIResponse<{ balance: string }>> {
    return this.request<{ balance: string }>('/ledger/balance');
  }

  // Reward endpoints
  async getRewards(): Promise<APIResponse<Reward[]>> {
    return this.request<Reward[]>('/rewards');
  }

  async redeemReward(id: string): Promise<APIResponse<Redemption>> {
    return this.request<Redemption>(`/rewards/${id}/redeem`, {
      method: 'POST',
    });
  }

  async getRedemptions(): Promise<APIResponse<Redemption[]>> {
    return this.request<Redemption[]>('/redemptions');
  }

  // Photo upload
  async uploadPhoto(file: File): Promise<APIResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await fetch(`${API_BASE_URL}/upload/photo`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });

    return response.json();
  }
}

export const apiService = new ApiService();
export default apiService;