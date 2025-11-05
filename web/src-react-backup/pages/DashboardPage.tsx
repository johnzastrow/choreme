import React, { useState, useEffect } from 'react';
import { Assignment, LedgerEntry } from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const DashboardPage: React.FC = () => {
  const [todaysChores, setTodaysChores] = useState<Assignment[]>([]);
  const [balance, setBalance] = useState('0.00');
  const [recentEarnings, setRecentEarnings] = useState<LedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [assignmentsRes, balanceRes, ledgerRes] = await Promise.all([
        apiService.getAssignments(),
        apiService.getBalance(),
        apiService.getLedger()
      ]);

      if (assignmentsRes.success) {
        const today = new Date().toDateString();
        const todaysAssignments = assignmentsRes.data?.filter(assignment => 
          new Date(assignment.due_date).toDateString() === today
        ) || [];
        setTodaysChores(todaysAssignments);
      }

      if (balanceRes.success) {
        setBalance(balanceRes.data?.balance || '0.00');
      }

      if (ledgerRes.success) {
        setRecentEarnings(ledgerRes.data?.slice(0, 3) || []);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending_approval': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-600">Here's what's happening today</p>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Balance Card */}
        <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm">Current Balance</p>
              <p className="text-3xl font-bold">{formatCurrency(parseFloat(balance))}</p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-xl">💰</span>
            </div>
          </div>
        </div>

        {/* Today's Chores */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Today's Chores</h2>
            <span className="text-sm text-gray-500">{todaysChores.length} tasks</span>
          </div>

          {todaysChores.length === 0 ? (
            <div className="card text-center py-8">
              <span className="text-4xl mb-4 block">🎉</span>
              <p className="text-gray-600">No chores due today!</p>
              <p className="text-sm text-gray-500 mt-1">Enjoy your free time</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysChores.map((chore) => (
                <div key={chore.id} className="card">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{chore.chore?.name}</h3>
                      <p className="text-sm text-gray-600">{chore.chore?.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(chore.status)}`}>
                          {chore.status.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-gray-500">
                          Worth {formatCurrency(chore.chore?.value || 0)}
                        </span>
                      </div>
                    </div>
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary-600">
                          {chore.progress_percentage}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        {recentEarnings.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <div className="space-y-3">
              {recentEarnings.map((entry) => (
                <div key={entry.id} className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{entry.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`font-semibold ${entry.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {entry.amount >= 0 ? '+' : ''}{formatCurrency(entry.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="card text-center py-6 hover:bg-gray-50 transition-colors">
              <span className="text-2xl mb-2 block">📋</span>
              <span className="text-sm font-medium text-gray-900">View All Chores</span>
            </button>
            <button className="card text-center py-6 hover:bg-gray-50 transition-colors">
              <span className="text-2xl mb-2 block">🛍️</span>
              <span className="text-sm font-medium text-gray-900">Reward Store</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;