import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoginRequest } from '../types';

interface LoginPageProps {
  onModeChange: (mode: 'login' | 'register' | 'join') => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onModeChange }) => {
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4">
            <span className="text-2xl font-bold text-primary-600">CM</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-primary-100">Sign in to continue to ChoreMe</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <button
            onClick={() => onModeChange('register')}
            className="text-white hover:text-primary-100 underline text-sm"
          >
            Don't have an account? Create one
          </button>
          
          <div className="text-primary-100 text-sm">or</div>
          
          <button
            onClick={() => onModeChange('join')}
            className="text-white hover:text-primary-100 underline text-sm"
          >
            Join an existing household
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;