import React, { useState, useEffect } from 'react';
import { Assignment, Chore } from '../types';
import { apiService } from '../services/api';

const ChoresPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [selectedChore, setSelectedChore] = useState<Assignment | null>(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  useEffect(() => {
    filterAssignments();
  }, [assignments, activeFilter]);

  const loadAssignments = async () => {
    try {
      const response = await apiService.getAssignments();
      if (response.success && response.data) {
        setAssignments(response.data);
      }
    } catch (error) {
      console.error('Failed to load assignments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAssignments = () => {
    if (activeFilter === 'all') {
      setFilteredAssignments(assignments);
    } else if (activeFilter === 'pending') {
      setFilteredAssignments(assignments.filter(a => a.status === 'assigned'));
    } else {
      setFilteredAssignments(assignments.filter(a => a.status === activeFilter));
    }
  };

  const updateProgress = async (assignmentId: string, progress: number) => {
    try {
      const response = await apiService.updateProgress(assignmentId, progress);
      if (response.success) {
        setAssignments(prev => prev.map(a => 
          a.id === assignmentId ? { ...a, progress_percentage: progress, status: 'in_progress' } : a
        ));
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const completeChore = async (assignmentId: string) => {
    try {
      const response = await apiService.completeChore(assignmentId);
      if (response.success) {
        setAssignments(prev => prev.map(a => 
          a.id === assignmentId ? { ...a, status: 'pending_approval', progress_percentage: 100 } : a
        ));
      }
    } catch (error) {
      console.error('Failed to complete chore:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending_approval': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your chores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">My Chores</h1>
          
          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { key: 'all', label: 'All' },
              { key: 'pending', label: 'To Do' },
              { key: 'in_progress', label: 'In Progress' },
              { key: 'completed', label: 'Done' }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key as any)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeFilter === filter.key
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chores List */}
      <div className="px-4 py-6">
        {filteredAssignments.length === 0 ? (
          <div className="card text-center py-12">
            <span className="text-4xl mb-4 block">
              {activeFilter === 'all' ? '📋' : 
               activeFilter === 'pending' ? '⏳' :
               activeFilter === 'in_progress' ? '🔄' : '✅'}
            </span>
            <p className="text-gray-600 text-lg">
              {activeFilter === 'all' ? 'No chores assigned yet' : 
               activeFilter === 'pending' ? 'No pending chores' :
               activeFilter === 'in_progress' ? 'No chores in progress' : 'No completed chores'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {activeFilter === 'all' ? 'Check back later for new tasks' :
               activeFilter === 'completed' ? 'Complete some chores to see them here' :
               'Start working on your assigned chores'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => (
              <div 
                key={assignment.id}
                className={`card ${isOverdue(assignment.due_date) && assignment.status !== 'completed' ? 'border-red-200 bg-red-50' : ''}`}
                onClick={() => setSelectedChore(assignment)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{assignment.chore?.name}</h3>
                      {isOverdue(assignment.due_date) && assignment.status !== 'completed' && (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                          Overdue
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{assignment.chore?.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                          {assignment.status.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-medium text-green-600">
                          {formatCurrency(assignment.chore?.value || 0)}
                        </span>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          Due {new Date(assignment.due_date).toLocaleDateString()}
                        </div>
                        {assignment.chore?.estimated_duration_minutes && (
                          <div className="text-xs text-gray-400">
                            ~{assignment.chore.estimated_duration_minutes} min
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    {assignment.status === 'in_progress' && (
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="text-gray-900">{assignment.progress_percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${assignment.progress_percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {assignment.status === 'assigned' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateProgress(assignment.id, 25);
                      }}
                      className="w-full btn-primary"
                    >
                      Start Chore
                    </button>
                  </div>
                )}

                {assignment.status === 'in_progress' && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateProgress(assignment.id, Math.min(100, assignment.progress_percentage + 25));
                        }}
                        className="flex-1 btn-secondary text-sm py-2"
                      >
                        +25% Progress
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          completeChore(assignment.id);
                        }}
                        className="flex-1 btn-primary text-sm py-2"
                        disabled={assignment.progress_percentage < 100}
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChoresPage;