import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';

const QuickAddMenu = ({ user, isOpen, onClose, onSuccess }) => {
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [activeTab, setActiveTab] = useState('income');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Form states for different transaction types
  const [incomeForm, setIncomeForm] = useState({
    account_id: '',
    category_id: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    notes: ''
  });

  const [expenseForm, setExpenseForm] = useState({
    account_id: '',
    category_id: '',
    amount: '',
    description: '',
    merchant: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [transferForm, setTransferForm] = useState({
    account_id: '',
    to_account_id: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [plannedPurchaseForm, setPlannedPurchaseForm] = useState({
    title: '',
    estimated_cost: '',
    target_date: '',
    account_to_pay_from: '',
    category_id: '',
    installments: [],
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      loadAccounts();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      const response = await axios.get('/categories');
      setCategories(response.data);
    } catch (error) {
      toast({ title: 'Error loading categories', variant: 'destructive' });
    }
  };

  const loadAccounts = async () => {
    try {
      const response = await axios.get('/accounts');
      setAccounts(response.data);
    } catch (error) {
      toast({ title: 'Error loading accounts', variant: 'destructive' });
    }
  };

  const handleSubmitIncome = async () => {
    setLoading(true);
    try {
      const data = {
        type: 'income',
        ...incomeForm,
        amount: parseFloat(incomeForm.amount)
      };
      
      await axios.post('/transactions', data);
      toast({ title: 'Income added successfully!' });
      onSuccess();
      onClose();
      resetForms();
    } catch (error) {
      toast({
        title: 'Error adding income',
        description: error.response?.data?.detail || 'Failed to add income',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitExpense = async () => {
    setLoading(true);
    try {
      const data = {
        type: 'expense',
        ...expenseForm,
        amount: parseFloat(expenseForm.amount)
      };
      
      await axios.post('/transactions', data);
      toast({ title: 'Expense added successfully!' });
      onSuccess();
      onClose();
      resetForms();
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

  const handleSubmitTransfer = async () => {
    setLoading(true);
    try {
      const data = {
        type: 'transfer',
        ...transferForm,
        amount: parseFloat(transferForm.amount)
      };
      
      await axios.post('/transactions', data);
      toast({ title: 'Transfer completed successfully!' });
      onSuccess();
      onClose();
      resetForms();
    } catch (error) {
      toast({
        title: 'Error processing transfer',
        description: error.response?.data?.detail || 'Failed to process transfer',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPlannedPurchase = async () => {
    setLoading(true);
    try {
      const data = {
        ...plannedPurchaseForm,
        estimated_cost: parseFloat(plannedPurchaseForm.estimated_cost),
        installments: plannedPurchaseForm.installments.map(inst => ({
          amount: parseFloat(inst.amount),
          due_date: inst.due_date
        }))
      };
      
      await axios.post('/planned-purchases', data);
      toast({ title: 'Planned purchase created successfully!' });
      onSuccess();
      onClose();
      resetForms();
    } catch (error) {
      toast({
        title: 'Error creating planned purchase',
        description: error.response?.data?.detail || 'Failed to create planned purchase',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForms = () => {
    setIncomeForm({
      account_id: '',
      category_id: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      is_recurring: false,
      notes: ''
    });
    setExpenseForm({
      account_id: '',
      category_id: '',
      amount: '',
      description: '',
      merchant: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setTransferForm({
      account_id: '',
      to_account_id: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setPlannedPurchaseForm({
      title: '',
      estimated_cost: '',
      target_date: '',
      account_to_pay_from: '',
      category_id: '',
      installments: [],
      notes: ''
    });
  };

  const addInstallment = () => {
    setPlannedPurchaseForm(prev => ({
      ...prev,
      installments: [
        ...prev.installments,
        { amount: '', due_date: '' }
      ]
    }));
  };

  const updateInstallment = (index, field, value) => {
    setPlannedPurchaseForm(prev => ({
      ...prev,
      installments: prev.installments.map((inst, i) => 
        i === index ? { ...inst, [field]: value } : inst
      )
    }));
  };

  const removeInstallment = (index) => {
    setPlannedPurchaseForm(prev => ({
      ...prev,
      installments: prev.installments.filter((_, i) => i !== index)
    }));
  };

  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <span className="mr-3">💰</span>
            Quick Add Transaction
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="income">💵 Income</TabsTrigger>
            <TabsTrigger value="expense">💳 Expense</TabsTrigger>
            <TabsTrigger value="transfer">🔄 Transfer</TabsTrigger>
            <TabsTrigger value="planned">🛒 Planned Purchase</TabsTrigger>
          </TabsList>

          {/* Income Tab */}
          <TabsContent value="income" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account</label>
                <Select value={incomeForm.account_id} onValueChange={(value) => setIncomeForm(prev => ({ ...prev, account_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <Select value={incomeForm.category_id} onValueChange={(value) => setIncomeForm(prev => ({ ...prev, category_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {incomeCategories.map(category => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (€)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={incomeForm.amount}
                  onChange={(e) => setIncomeForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <Input
                  type="date"
                  value={incomeForm.date}
                  onChange={(e) => setIncomeForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <Input
                value={incomeForm.description}
                onChange={(e) => setIncomeForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., September salary"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={incomeForm.is_recurring}
                  onChange={(e) => setIncomeForm(prev => ({ ...prev, is_recurring: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">This is recurring income</span>
              </label>
            </div>

            <Button 
              onClick={handleSubmitIncome} 
              disabled={loading || !incomeForm.account_id || !incomeForm.category_id || !incomeForm.amount}
              className="w-full bg-emerald-500 hover:bg-emerald-600"
            >
              {loading ? 'Adding...' : 'Add Income'}
            </Button>
          </TabsContent>

          {/* Expense Tab */}
          <TabsContent value="expense" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account</label>
                <Select value={expenseForm.account_id} onValueChange={(value) => setExpenseForm(prev => ({ ...prev, account_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <Select value={expenseForm.category_id} onValueChange={(value) => setExpenseForm(prev => ({ ...prev, category_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(category => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (€)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <Input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <Input
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g., Weekly groceries"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Merchant</label>
                <Input
                  value={expenseForm.merchant}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, merchant: e.target.value }))}
                  placeholder="e.g., Carrefour"
                />
              </div>
            </div>

            <Button 
              onClick={handleSubmitExpense} 
              disabled={loading || !expenseForm.account_id || !expenseForm.category_id || !expenseForm.amount}
              className="w-full bg-red-500 hover:bg-red-600"
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </Button>
          </TabsContent>

          {/* Transfer Tab */}
          <TabsContent value="transfer" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Account</label>
                <Select value={transferForm.account_id} onValueChange={(value) => setTransferForm(prev => ({ ...prev, account_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Account</label>
                <Select value={transferForm.to_account_id} onValueChange={(value) => setTransferForm(prev => ({ ...prev, to_account_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.filter(acc => acc.id !== transferForm.account_id).map(account => (
                      <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (€)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={transferForm.amount}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <Input
                  type="date"
                  value={transferForm.date}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <Input
                value={transferForm.description}
                onChange={(e) => setTransferForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., Monthly savings transfer"
              />
            </div>

            <Button 
              onClick={handleSubmitTransfer} 
              disabled={loading || !transferForm.account_id || !transferForm.to_account_id || !transferForm.amount || transferForm.account_id === transferForm.to_account_id}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              {loading ? 'Processing...' : 'Process Transfer'}
            </Button>
          </TabsContent>

          {/* Planned Purchase Tab */}
          <TabsContent value="planned" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Title</label>
              <Input
                value={plannedPurchaseForm.title}
                onChange={(e) => setPlannedPurchaseForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., New Refrigerator"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Cost (€)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={plannedPurchaseForm.estimated_cost}
                  onChange={(e) => setPlannedPurchaseForm(prev => ({ ...prev, estimated_cost: e.target.value }))}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Date</label>
                <Input
                  type="date"
                  value={plannedPurchaseForm.target_date}
                  onChange={(e) => setPlannedPurchaseForm(prev => ({ ...prev, target_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Account</label>
                <Select value={plannedPurchaseForm.account_to_pay_from} onValueChange={(value) => setPlannedPurchaseForm(prev => ({ ...prev, account_to_pay_from: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <Select value={plannedPurchaseForm.category_id} onValueChange={(value) => setPlannedPurchaseForm(prev => ({ ...prev, category_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(category => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Installments */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">Installments (Optional)</label>
                <Button type="button" onClick={addInstallment} size="sm" variant="outline">
                  Add Installment
                </Button>
              </div>

              {plannedPurchaseForm.installments.map((installment, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2 p-3 bg-gray-50 rounded-lg">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    value={installment.amount}
                    onChange={(e) => updateInstallment(index, 'amount', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="date"
                    value={installment.due_date}
                    onChange={(e) => updateInstallment(index, 'due_date', e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" onClick={() => removeInstallment(index)} size="sm" variant="destructive">
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            <Button 
              onClick={handleSubmitPlannedPurchase} 
              disabled={loading || !plannedPurchaseForm.title || !plannedPurchaseForm.estimated_cost || !plannedPurchaseForm.account_to_pay_from || !plannedPurchaseForm.category_id}
              className="w-full bg-purple-500 hover:bg-purple-600"
            >
              {loading ? 'Creating...' : 'Create Planned Purchase'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default QuickAddMenu;