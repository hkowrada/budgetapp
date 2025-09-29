import React, { useState } from 'react';
import axios from 'axios';
import { useToast } from '../hooks/use-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

const EditableSalaryCard = ({ user, currentSalary, onSalaryUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newSalary, setNewSalary] = useState(currentSalary || '');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpdateSalary = async () => {
    if (!newSalary || parseFloat(newSalary) <= 0) {
      toast({ title: 'Please enter a valid salary amount', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      await axios.patch('/salary/update', null, {
        params: { new_salary: parseFloat(newSalary) }
      });
      
      toast({ 
        title: 'Salary Updated!', 
        description: `Your salary has been updated to €${parseFloat(newSalary).toLocaleString()}`
      });
      
      setIsEditing(false);
      onSalaryUpdated(); // Refresh dashboard data
    } catch (error) {
      toast({
        title: 'Error updating salary',
        description: error.response?.data?.detail || 'Failed to update salary',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setNewSalary(currentSalary || '');
    setIsEditing(false);
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-emerald-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-600 flex items-center">
            <span className="mr-2">💰</span>
            {user.name}'s Salary
          </p>
          {isEditing ? (
            <div className="flex items-center space-x-2 mt-2">
              <Input
                type="number"
                step="0.01"
                value={newSalary}
                onChange={(e) => setNewSalary(e.target.value)}
                placeholder="Enter new salary"
                className="w-32"
                disabled={loading}
              />
              <Button 
                size="sm" 
                onClick={handleUpdateSalary}
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                {loading ? 'Saving...' : 'Save'}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-3 mt-1">
              <p className="text-3xl font-bold text-emerald-600">
                €{currentSalary ? parseFloat(currentSalary).toLocaleString() : '0'}
              </p>
              {user.role !== 'guest' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                >
                  ✏️ Edit
                </Button>
              )}
            </div>
          )}
        </div>
        <div className="text-3xl text-emerald-500">💵</div>
      </div>
    </div>
  );
};

export default EditableSalaryCard;