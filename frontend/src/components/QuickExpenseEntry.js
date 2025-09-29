import React, { useState } from 'react';
import axios from 'axios';
import { useToast } from '../hooks/use-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

const QuickExpenseEntry = ({ isOpen, onClose, onExpenseAdded }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAddExpense = async () => {
    if (!description.trim() || !amount || parseFloat(amount) <= 0) {
      toast({ title: 'Please enter description and valid amount', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Get default account and expense category
      const [accountsResponse, categoriesResponse] = await Promise.all([
        axios.get('/accounts'),
        axios.get('/categories')
      ]);

      const defaultAccount = accountsResponse.data.find(acc => acc.is_active) || accountsResponse.data[0];
      const expenseCategory = categoriesResponse.data.find(cat => 
        cat.type === 'expense' && cat.name.toLowerCase().includes('miscellaneous')
      ) || categoriesResponse.data.find(cat => cat.type === 'expense');

      if (!defaultAccount || !expenseCategory) {
        toast({ title: 'Error: No account or category found', variant: 'destructive' });
        return;
      }

      // Create expense transaction
      await axios.post('/transactions', {
        type: 'expense',
        account_id: defaultAccount.id,
        category_id: expenseCategory.id,
        amount: parseFloat(amount),
        description: description.trim(),
        date: new Date().toISOString().split('T')[0] // Today's date
      });

      toast({ 
        title: 'Expense Added!', 
        description: `€${parseFloat(amount).toLocaleString()} - ${description}`
      });

      // Reset form
      setDescription('');
      setAmount('');
      onExpenseAdded(); // Refresh dashboard
      onClose();
    } catch (error) {
      toast({
        title: 'Error adding expense',
        description: error.response?.data?.detail || 'Failed to add expense',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setDescription('');
    setAmount('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <span className="mr-2">💰</span>
            Add Quick Expense
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <Input
              type="text"
              placeholder="e.g., Coffee, Gas, Groceries..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              className="mt-1"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Amount (€)</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
              className="mt-1"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button 
              onClick={handleAddExpense}
              disabled={loading}
              className="flex-1 bg-green-500 hover:bg-green-600"
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickExpenseEntry;