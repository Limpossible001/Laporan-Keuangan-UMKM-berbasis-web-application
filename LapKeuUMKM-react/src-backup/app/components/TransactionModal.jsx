import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { useFinance, Transaction } from '../contexts/FinanceContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction;
  defaultType?: 'income' | 'expense';
}

export function TransactionModal({ isOpen, onClose, transaction, defaultType }: TransactionModalProps) {
  const { categories, addTransaction, updateTransaction } = useFinance();
  const [formData, setFormData] = useState({
    type: defaultType || 'income' as 'income' | 'expense',
    date: format(new Date(), 'yyyy-MM-dd'),
    name: '',
    category: '',
    amount: '',
    description: '',
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        date: format(transaction.date, 'yyyy-MM-dd'),
        name: transaction.name,
        category: transaction.category,
        amount: transaction.amount.toString(),
        description: transaction.description || '',
      });
    } else if (defaultType) {
      setFormData(prev => ({ ...prev, type: defaultType }));
    }
  }, [transaction, defaultType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const transactionData = {
      type: formData.type,
      date: new Date(formData.date),
      name: formData.name,
      category: formData.category,
      amount: parseFloat(formData.amount),
      description: formData.description,
    };

    if (transaction) {
      updateTransaction(transaction.id, transactionData);
      toast.success('Transaction updated successfully');
    } else {
      addTransaction(transactionData);
      toast.success('Transaction added successfully');
    }

    handleClose();
  };

  const handleClose = () => {
    setFormData({
      type: defaultType || 'income',
      date: format(new Date(), 'yyyy-MM-dd'),
      name: '',
      category: '',
      amount: '',
      description: '',
    });
    onClose();
  };

  const filteredCategories = categories.filter(
    cat => cat.type === formData.type || cat.type === 'both'
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Edit Transaction' : 'Add New Transaction'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label>Transaction Type *</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.type === 'income' ? 'default' : 'outline'}
                className={`flex-1 ${
                  formData.type === 'income'
                    ? 'bg-green-600 hover:bg-green-700'
                    : ''
                }`}
                onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
              >
                Income
              </Button>
              <Button
                type="button"
                variant={formData.type === 'expense' ? 'default' : 'outline'}
                className={`flex-1 ${
                  formData.type === 'expense'
                    ? 'bg-red-600 hover:bg-red-700'
                    : ''
                }`}
                onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
              >
                Expense
              </Button>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          {/* Transaction Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Transaction Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Product Sales"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (IDR) *</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              min="0"
              step="1000"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Additional notes (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              {transaction ? 'Update' : 'Add'} Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
