import React, { useState } from 'react';
import axios from 'axios';
import { useToast } from '../hooks/use-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';

const EditableBillCard = ({ bill, onBillUpdated, userRole }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newAmount, setNewAmount] = useState(bill.expected_amount || '');
  const [newDueDay, setNewDueDay] = useState(bill.due_day || '');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpdateBill = async () => {
    if (!newAmount || parseFloat(newAmount) <= 0) {
      toast({ title: 'Please enter a valid amount', variant: 'destructive' });
      return;
    }

    if (!newDueDay || parseInt(newDueDay) < 1 || parseInt(newDueDay) > 31) {
      toast({ title: 'Please enter a valid due day (1-31)', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      await axios.patch(`/bills/${bill.id}`, {
        expected_amount: parseFloat(newAmount),
        due_day: parseInt(newDueDay)
      });
      
      toast({ 
        title: 'Bill Updated!', 
        description: `${bill.name}: €${parseFloat(newAmount).toLocaleString()}, Due: ${newDueDay}th`
      });
      
      setIsEditing(false);
      onBillUpdated(); // Refresh dashboard data
    } catch (error) {
      toast({
        title: 'Error updating bill',
        description: error.response?.data?.detail || 'Failed to update bill',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setNewAmount(bill.expected_amount || '');
    setNewDueDay(bill.due_day || '');
    setIsEditing(false);
  };

  // Get bill icon
  const getBillIcon = (billName) => {
    const name = billName.toLowerCase();
    if (name.includes('electricity')) return '⚡';
    if (name.includes('water')) return '💧';
    if (name.includes('internet') || name.includes('wifi')) return '📶';
    if (name.includes('mobile') || name.includes('phone')) return '📱';
    if (name.includes('insurance')) return '🛡️';
    if (name.includes('loan') || name.includes('emi')) return '🏠';
    return '💵';
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-blue-100 hover:border-blue-200 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 flex items-center">
            <span className="mr-2 text-lg">{getBillIcon(bill.name)}</span>
            {bill.name}
          </p>
          <p className="text-xs text-gray-500 mb-2">Due: {bill.due_day} of every month</p>
          
          {isEditing ? (
            <div className="space-y-2 mt-2">
              <div className="flex items-center space-x-2">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">Amount (€)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="Amount"
                    className="w-24 h-8 text-sm"
                    disabled={loading}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">Due Day</label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={newDueDay}
                    onChange={(e) => setNewDueDay(e.target.value)}
                    placeholder="Day"
                    className="w-16 h-8 text-sm"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  size="sm" 
                  onClick={handleUpdateBill}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 h-8 text-xs px-2"
                >
                  {loading ? '...' : 'Save'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={loading}
                  className="h-8 text-xs px-2"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-lg font-bold text-blue-600">
                €{bill.expected_amount ? parseFloat(bill.expected_amount).toLocaleString() : '0'}
              </p>
              {userRole !== 'guest' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-6 px-2 text-xs"
                >
                  ✏️ Edit
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditableBillCard;