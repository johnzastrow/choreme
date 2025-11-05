import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { RegisterRequest } from '../types';

interface RegisterPageProps {
  onModeChange: (mode: 'login' | 'register' | 'join') => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onModeChange }) => {
  const [formData, setFormData] = useState<RegisterRequest>({
    name: '',
    email: '',
    password: '',
    household_name: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(formData);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
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
    <div className="min-h-screen bg-gradient-to-br from-secondary-500 to-secondary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4">
            <span className="text-2xl font-bold text-secondary-600">CM</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Get Started</h1>
          <p className="text-secondary-100">Create your household on ChoreMe</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="name"
              placeholder="Your full name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              required
              autoComplete="name"
            />
          </div>

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
              placeholder="Create password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              required
              autoComplete="new-password"
              minLength={8}
            />
          </div>

          <div>
            <input
              type="text"
              name="household_name"
              placeholder="Household name (e.g., The Smith Family)"
              value={formData.household_name}
              onChange={handleChange}
              className="input-field"
              required
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
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <button
            onClick={() => onModeChange('login')}
            className="text-white hover:text-secondary-100 underline text-sm"
          >
            Already have an account? Sign in
          </button>
          
          <div className="text-secondary-100 text-sm">or</div>
          
          <button
            onClick={() => onModeChange('join')}
            className="text-white hover:text-secondary-100 underline text-sm"
          >
            Join an existing household
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;