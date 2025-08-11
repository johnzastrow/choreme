import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { JoinHouseholdRequest } from '../types';

interface JoinHouseholdPageProps {
  onModeChange: (mode: 'login' | 'register' | 'join') => void;
}

const JoinHouseholdPage: React.FC<JoinHouseholdPageProps> = ({ onModeChange }) => {
  const [formData, setFormData] = useState<JoinHouseholdRequest>({
    name: '',
    email: '',
    password: '',
    invite_code: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { joinHousehold } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await joinHousehold(formData);
    } catch (err: any) {
      setError(err.message || 'Failed to join household');
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
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4">
            <span className="text-2xl font-bold text-green-600">CM</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Join Family</h1>
          <p className="text-green-100">Join an existing household with an invite code</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="invite_code"
              placeholder="Invite code"
              value={formData.invite_code}
              onChange={handleChange}
              className="input-field text-center text-lg font-mono tracking-wider"
              required
              maxLength={8}
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div className="border-t border-green-400 pt-4 space-y-4">
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
            {isLoading ? 'Joining...' : 'Join Household'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <button
            onClick={() => onModeChange('login')}
            className="text-white hover:text-green-100 underline text-sm"
          >
            Already have an account? Sign in
          </button>
          
          <div className="text-green-100 text-sm">or</div>
          
          <button
            onClick={() => onModeChange('register')}
            className="text-white hover:text-green-100 underline text-sm"
          >
            Create a new household
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinHouseholdPage;