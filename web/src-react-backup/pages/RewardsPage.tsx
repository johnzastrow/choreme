import React, { useState, useEffect } from 'react';
import { Reward, Redemption } from '../types';
import { apiService } from '../services/api';

const RewardsPage: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [balance, setBalance] = useState('0.00');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'store' | 'history'>('store');
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [rewardsRes, redemptionsRes, balanceRes] = await Promise.all([
        apiService.getRewards(),
        apiService.getRedemptions(),
        apiService.getBalance()
      ]);

      if (rewardsRes.success && rewardsRes.data) {
        setRewards(rewardsRes.data.filter(r => r.is_active));
      }

      if (redemptionsRes.success && redemptionsRes.data) {
        setRedemptions(redemptionsRes.data);
      }

      if (balanceRes.success && balanceRes.data) {
        setBalance(balanceRes.data.balance);
      }
    } catch (error) {
      console.error('Failed to load rewards data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const redeemReward = async (rewardId: string) => {
    setRedeemingId(rewardId);
    try {
      const response = await apiService.redeemReward(rewardId);
      if (response.success) {
        // Refresh data to show updated balance and redemption history
        loadData();
        // Show success message or navigate to a confirmation
        alert('Reward redeemed successfully! It will be available once approved.');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to redeem reward');
    } finally {
      setRedeemingId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canAfford = (cost: number) => {
    return parseFloat(balance) >= cost;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Rewards</h1>

          {/* Balance Display */}
          <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Available Balance</p>
                <p className="text-3xl font-bold">{formatCurrency(parseFloat(balance))}</p>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-xl">🛍️</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('store')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'store'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Reward Store
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Redemptions
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {activeTab === 'store' ? (
          // Reward Store
          <div>
            {rewards.length === 0 ? (
              <div className="card text-center py-12">
                <span className="text-4xl mb-4 block">🏪</span>
                <p className="text-gray-600 text-lg">No rewards available</p>
                <p className="text-sm text-gray-500 mt-2">
                  Ask your parents to add some rewards to the store!
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {rewards.map((reward) => (
                  <div key={reward.id} className="card">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{reward.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{reward.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(reward.cost)}
                        </div>
                        {reward.quantity_limit && (
                          <div className="text-xs text-gray-500 mt-1">
                            Limited quantity
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => redeemReward(reward.id)}
                      disabled={!canAfford(reward.cost) || redeemingId === reward.id}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        canAfford(reward.cost)
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {redeemingId === reward.id ? 'Redeeming...' :
                       !canAfford(reward.cost) ? 'Not enough balance' :
                       'Redeem Reward'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Redemption History
          <div>
            {redemptions.length === 0 ? (
              <div className="card text-center py-12">
                <span className="text-4xl mb-4 block">📦</span>
                <p className="text-gray-600 text-lg">No redemptions yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Redeem your first reward to see it here!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {redemptions.map((redemption) => (
                  <div key={redemption.id} className="card">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {redemption.reward?.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Requested on {formatDate(redemption.requested_date)}
                        </p>
                        {redemption.approval_date && (
                          <p className="text-sm text-gray-600">
                            {redemption.status === 'approved' ? 'Approved' : 'Rejected'} on{' '}
                            {formatDate(redemption.approval_date)}
                          </p>
                        )}
                        {redemption.rejection_reason && (
                          <p className="text-sm text-red-600 mt-1">
                            Reason: {redemption.rejection_reason}
                          </p>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900 mb-2">
                          {formatCurrency(redemption.cost)}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(redemption.status)}`}>
                          {redemption.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsPage;