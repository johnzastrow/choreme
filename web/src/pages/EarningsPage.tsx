import React, { useState, useEffect } from 'react';
import { LedgerEntry } from '../types';
import { apiService } from '../services/api';

const EarningsPage: React.FC = () => {
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [balance, setBalance] = useState('0.00');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'earnings' | 'spending'>('all');

  useEffect(() => {
    loadLedgerData();
  }, []);

  const loadLedgerData = async () => {
    try {
      const [ledgerRes, balanceRes] = await Promise.all([
        apiService.getLedger(),
        apiService.getBalance()
      ]);

      if (ledgerRes.success && ledgerRes.data) {
        setLedgerEntries(ledgerRes.data);
      }

      if (balanceRes.success && balanceRes.data) {
        setBalance(balanceRes.data.balance);
      }
    } catch (error) {
      console.error('Failed to load ledger data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEntries = ledgerEntries.filter(entry => {
    if (filter === 'earnings') return entry.amount > 0;
    if (filter === 'spending') return entry.amount < 0;
    return true;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getEntryIcon = (type: string, amount: number) => {
    if (type === 'chore_completion') return '✅';
    if (type === 'reward_redemption') return '🎁';
    if (type === 'manual_adjustment') return amount > 0 ? '➕' : '➖';
    return '💰';
  };

  const getEntryColor = (amount: number) => {
    return amount >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const totalEarnings = ledgerEntries
    .filter(entry => entry.amount > 0)
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalSpending = ledgerEntries
    .filter(entry => entry.amount < 0)
    .reduce((sum, entry) => sum + Math.abs(entry.amount), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your earnings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Earnings</h1>

          {/* Balance Card */}
          <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white mb-6">
            <div className="text-center">
              <p className="text-green-100 text-sm mb-1">Current Balance</p>
              <p className="text-4xl font-bold mb-4">{formatCurrency(parseFloat(balance))}</p>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <p className="text-green-100 text-xs">Total Earned</p>
                  <p className="text-lg font-semibold">{formatCurrency(totalEarnings)}</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <p className="text-green-100 text-xs">Total Spent</p>
                  <p className="text-lg font-semibold">{formatCurrency(totalSpending)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { key: 'all', label: 'All' },
              { key: 'earnings', label: 'Earnings' },
              { key: 'spending', label: 'Spending' }
            ].map(filterOption => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key as any)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  filter === filterOption.key
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="px-4 py-6">
        {filteredEntries.length === 0 ? (
          <div className="card text-center py-12">
            <span className="text-4xl mb-4 block">
              {filter === 'all' ? '💰' : 
               filter === 'earnings' ? '💸' : '🛍️'}
            </span>
            <p className="text-gray-600 text-lg">
              {filter === 'all' ? 'No transactions yet' : 
               filter === 'earnings' ? 'No earnings yet' : 'No spending yet'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {filter === 'all' ? 'Complete chores to start earning!' :
               filter === 'earnings' ? 'Complete some chores to earn money' :
               'Redeem rewards to see spending history'}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredEntries.map((entry, index) => (
              <div key={entry.id} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                      {getEntryIcon(entry.type, entry.amount)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{entry.description}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{formatDate(entry.created_at)}</span>
                        <span>•</span>
                        <span className="capitalize">
                          {entry.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`font-bold text-lg ${getEntryColor(entry.amount)}`}>
                      {entry.amount >= 0 ? '+' : ''}{formatCurrency(entry.amount)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EarningsPage;