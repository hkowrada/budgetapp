import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../hooks/use-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const CategoriesManagement = ({ user }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const { toast } = useToast();

  // Form states
  const [createForm, setCreateForm] = useState({
    name: '',
    type: 'expense',
    is_recurring: false,
    icon: '',
    color: '#10B981'
  });

  const [editForm, setEditForm] = useState({
    name: '',
    type: 'expense',
    is_recurring: false,
    icon: '',
    color: '#10B981'
  });

  const [mergeForm, setMergeForm] = useState({
    source_category_id: '',
    target_category_id: ''
  });

  const categoryColors = [
    '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#06B6D4',
    '#EC4899', '#6366F1', '#84CC16', '#F97316', '#6B7280'
  ];

  const categoryIcons = [
    '💰', '🏠', '🛒', '🚗', '🏥', '🎓', '🍽️', '🎬', '💳', '📱',
    '✈️', '🎁', '🔧', '👕', '⚡', '💡', '🌐', '📺', '🎵', '🏋️'
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/categories');
      setCategories(response.data);
    } catch (error) {
      toast({
        title: 'Error loading categories',
        description: 'Failed to fetch categories',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    try {
      await axios.post('/categories', createForm);
      toast({ title: 'Category created successfully!' });
      setShowCreateDialog(false);
      resetCreateForm();
      loadCategories();
    } catch (error) {
      toast({
        title: 'Error creating category',
        description: error.response?.data?.detail || 'Failed to create category',
        variant: 'destructive'
      });
    }
  };

  const handleEditCategory = async () => {
    try {
      await axios.patch(`/categories/${editingCategory.id}`, editForm);
      toast({ title: 'Category updated successfully!' });
      setShowEditDialog(false);
      setEditingCategory(null);
      resetEditForm();
      loadCategories();
    } catch (error) {
      toast({
        title: 'Error updating category',
        description: error.response?.data?.detail || 'Failed to update category',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (window.confirm(`Are you sure you want to delete "${categoryName}"? This will hide it from future transactions but preserve historical data.`)) {
      try {
        await axios.delete(`/categories/${categoryId}`);
        toast({ title: 'Category deleted successfully!' });
        loadCategories();
      } catch (error) {
        toast({
          title: 'Error deleting category',
          description: error.response?.data?.detail || 'Failed to delete category',
          variant: 'destructive'
        });
      }
    }
  };

  const handleMergeCategories = async () => {
    const sourceCategory = categories.find(c => c.id === mergeForm.source_category_id);
    const targetCategory = categories.find(c => c.id === mergeForm.target_category_id);
    
    if (window.confirm(`Merge "${sourceCategory?.name}" into "${targetCategory?.name}"? All transactions and budgets will be moved to the target category. This cannot be undone.`)) {
      try {
        await axios.post('/categories/merge', mergeForm);
        toast({ title: 'Categories merged successfully!' });
        setShowMergeDialog(false);
        resetMergeForm();
        loadCategories();
      } catch (error) {
        toast({
          title: 'Error merging categories',
          description: error.response?.data?.detail || 'Failed to merge categories',
          variant: 'destructive'
        });
      }
    }
  };

  const openEditDialog = (category) => {
    setEditingCategory(category);
    setEditForm({
      name: category.name,
      type: category.type,
      is_recurring: category.is_recurring || false,
      icon: category.icon || '',
      color: category.color || '#10B981'
    });
    setShowEditDialog(true);
  };

  const resetCreateForm = () => {
    setCreateForm({
      name: '',
      type: 'expense',
      is_recurring: false,
      icon: '',
      color: '#10B981'
    });
  };

  const resetEditForm = () => {
    setEditForm({
      name: '',
      type: 'expense',
      is_recurring: false,
      icon: '',
      color: '#10B981'
    });
  };

  const resetMergeForm = () => {
    setMergeForm({
      source_category_id: '',
      target_category_id: ''
    });
  };

  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <span className="mr-3">🏷️</span>
          Categories Management
        </h1>
        
        {user.role !== 'guest' && (
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setShowMergeDialog(true)}
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <span className="mr-2">🔄</span>
              Merge Categories
            </Button>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              <span className="mr-2">➕</span>
              Add Category
            </Button>
          </div>
        )}
      </div>

      {user.role === 'guest' && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center text-amber-800">
            <span className="text-xl mr-2">👁️</span>
            <span className="font-medium">Read-only access: You can view categories but cannot create, edit, or delete them.</span>
          </div>
        </div>
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Categories</TabsTrigger>
          <TabsTrigger value="income">💰 Income ({incomeCategories.length})</TabsTrigger>
          <TabsTrigger value="expense">💳 Expense ({expenseCategories.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(category => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                        style={{ backgroundColor: category.color || '#10B981' }}
                      >
                        {category.icon || '🏷️'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{category.name}</h3>
                        <Badge 
                          className={category.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                        >
                          {category.type}
                        </Badge>
                      </div>
                    </div>
                    
                    {user.role !== 'guest' && (
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(category)}
                          className="hover:bg-blue-50"
                        >
                          ✏️
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCategory(category.id, category.name)}
                          className="hover:bg-red-50 text-red-600"
                        >
                          🗑️
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {category.is_recurring && (
                    <Badge variant="outline" className="text-xs">
                      Recurring
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="income" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {incomeCategories.map(category => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow duration-200 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                        style={{ backgroundColor: category.color || '#10B981' }}
                      >
                        {category.icon || '💰'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{category.name}</h3>
                      </div>
                    </div>
                    
                    {user.role !== 'guest' && (
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(category)}
                        >
                          ✏️
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCategory(category.id, category.name)}
                          className="text-red-600"
                        >
                          🗑️
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="expense" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expenseCategories.map(category => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow duration-200 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                        style={{ backgroundColor: category.color || '#EF4444' }}
                      >
                        {category.icon || '💳'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{category.name}</h3>
                      </div>
                    </div>
                    
                    {user.role !== 'guest' && (
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(category)}
                        >
                          ✏️
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCategory(category.id, category.name)}
                          className="text-red-600"
                        >
                          🗑️
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Category Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
              <Input
                value={createForm.name}
                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Dining Out"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <Select value={createForm.type} onValueChange={(value) => setCreateForm(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">💰 Income</SelectItem>
                  <SelectItem value="expense">💳 Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
              <div className="grid grid-cols-10 gap-2">
                {categoryIcons.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setCreateForm(prev => ({ ...prev, icon }))}
                    className={`p-2 rounded text-lg hover:bg-gray-100 ${createForm.icon === icon ? 'bg-blue-100' : ''}`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <div className="grid grid-cols-5 gap-2">
                {categoryColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setCreateForm(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full ${createForm.color === color ? 'ring-2 ring-gray-400' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={createForm.is_recurring}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, is_recurring: e.target.checked }))}
                />
                <span className="text-sm text-gray-700">This is typically recurring</span>
              </label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateCategory}
                disabled={!createForm.name}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                Create Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <Select value={editForm.type} onValueChange={(value) => setEditForm(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">💰 Income</SelectItem>
                  <SelectItem value="expense">💳 Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
              <div className="grid grid-cols-10 gap-2">
                {categoryIcons.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setEditForm(prev => ({ ...prev, icon }))}
                    className={`p-2 rounded text-lg hover:bg-gray-100 ${editForm.icon === icon ? 'bg-blue-100' : ''}`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <div className="grid grid-cols-5 gap-2">
                {categoryColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setEditForm(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full ${editForm.color === color ? 'ring-2 ring-gray-400' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editForm.is_recurring}
                  onChange={(e) => setEditForm(prev => ({ ...prev, is_recurring: e.target.checked }))}
                />
                <span className="text-sm text-gray-700">This is typically recurring</span>
              </label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleEditCategory}
                disabled={!editForm.name}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Update Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Merge Categories Dialog */}
      <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Merge Categories</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Warning:</strong> This will move all transactions and budgets from the source category to the target category. This action cannot be undone.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Source Category (will be deleted)</label>
              <Select value={mergeForm.source_category_id} onValueChange={(value) => setMergeForm(prev => ({ ...prev, source_category_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category to merge from" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Category (will receive all data)</label>
              <Select value={mergeForm.target_category_id} onValueChange={(value) => setMergeForm(prev => ({ ...prev, target_category_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category to merge into" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c.id !== mergeForm.source_category_id).map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowMergeDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleMergeCategories}
                disabled={!mergeForm.source_category_id || !mergeForm.target_category_id}
                className="bg-red-500 hover:bg-red-600"
              >
                Merge Categories
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoriesManagement;