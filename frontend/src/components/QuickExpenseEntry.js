import React, { useState } from 'react';
import axios from 'axios';
import { useToast } from '../hooks/use-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Checkbox } from './ui/checkbox';

const QuickExpenseEntry = ({ isOpen, onClose, onExpenseAdded }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isRecurringBill, setIsRecurringBill] = useState(false);
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

      // If it's a recurring bill with due date, create a bill first
      if (isRecurringBill && dueDate) {
        const dueDayNumber = parseInt(dueDate);
        if (dueDayNumber >= 1 && dueDayNumber <= 31) {
          // Create recurring bill
          await axios.post('/bills', {
            name: description.trim(),
            provider: 'User Added',
            category_id: expenseCategory.id,
            account_id: defaultAccount.id,
            recurrence: 'monthly',
            due_day: dueDayNumber,
            expected_amount: parseFloat(amount),
            autopay: false,
            is_active: true
          });
          
          toast({ 
            title: 'Recurring Bill Created!', 
            description: `${description} - €${parseFloat(amount).toLocaleString()} due on ${dueDate}th of every month`
          });
        } else {
          toast({ title: 'Please enter a valid due day (1-31)', variant: 'destructive' });
          return;
        }
      } else {
        // Create one-time expense transaction
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
      }

      // Reset form
      setDescription('');
      setAmount('');
      setDueDate('');
      setIsRecurringBill(false);
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
    setDueDate('');
    setIsRecurringBill(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <span className="mr-2">💰</span>
            Add Expense
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <Input
              type="text"
              placeholder="e.g., Electricity Bill, Coffee, Groceries..."
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

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="recurring-bill"
              checked={isRecurringBill}
              onCheckedChange={setIsRecurringBill}
              disabled={loading}
            />
            <label 
              htmlFor="recurring-bill" 
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              This is a recurring monthly bill
            </label>
          </div>

          {isRecurringBill && (
            <div>
              <label className="text-sm font-medium text-gray-700">Due Day (1-31)</label>
              <Input
                type="number"
                min="1"
                max="31"
                placeholder="e.g., 15 for 15th of every month"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={loading}
                className="mt-1"
              />
            </div>
          )}
          
          <div className="flex space-x-3 pt-4">
            <Button 
              onClick={handleAddExpense}
              disabled={loading}
              className="flex-1 bg-green-500 hover:bg-green-600"
            >
              {loading ? 'Adding...' : isRecurringBill ? 'Create Bill' : 'Add Expense'}
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