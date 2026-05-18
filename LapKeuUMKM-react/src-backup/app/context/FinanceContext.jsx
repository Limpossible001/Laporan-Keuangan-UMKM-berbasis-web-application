import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface UserSettings {
  userName: string;
  businessName: string;
  email: string;
  profilePicture?: string;
}

export interface Purchase {
  id: string;
  date: Date;
  supplierName: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  description?: string;
}

export interface Sale {
  id: string;
  date: Date;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalRevenue: number;
  customerNotes?: string;
}

export interface CashFlow {
  id: string;
  date: Date;
  type: 'in' | 'out';
  description: string;
  amount: number;
  category: string;
}

export interface InventoryItem {
  id: string;
  productName: string;
  category?: string;
  unitPrice: number;
  quantity: number;
  lastUpdated: Date;
  notes?: string;
}

const FinanceContext = createContext(undefined);

// Default categories
const defaultCategories: Category[] = [
  { id: '1', name: 'Sales', type: 'income' },
  { id: '2', name: 'Services', type: 'income' },
  { id: '3', name: 'Other Income', type: 'income' },
  { id: '4', name: 'Food & Beverages', type: 'expense' },
  { id: '5', name: 'Operational', type: 'expense' },
  { id: '6', name: 'Marketing', type: 'expense' },
  { id: '7', name: 'Salary', type: 'expense' },
  { id: '8', name: 'Utilities', type: 'expense' },
  { id: '9', name: 'Transportation', type: 'expense' },
  { id: '10', name: 'Equipment', type: 'expense' },
];

// Sample transactions for demo
const sampleTransactions: Transaction[] = [
  {
    id: '1',
    date: new Date('2026-02-20'),
    name: 'Product Sales - Store A',
    category: 'Sales',
    type: 'income',
    amount: 15000000,
    description: 'Monthly sales from Store A'
  },
  {
    id: '2',
    date: new Date('2026-02-19'),
    name: 'Consulting Services',
    category: 'Services',
    type: 'income',
    amount: 8500000,
    description: 'Business consulting project'
  },
  {
    id: '3',
    date: new Date('2026-02-18'),
    name: 'Office Rent',
    category: 'Operational',
    type: 'expense',
    amount: 5000000,
    description: 'Monthly office rental payment'
  },
  {
    id: '4',
    date: new Date('2026-02-17'),
    name: 'Employee Salaries',
    category: 'Salary',
    type: 'expense',
    amount: 12000000,
    description: 'Monthly payroll'
  },
  {
    id: '5',
    date: new Date('2026-02-15'),
    name: 'Marketing Campaign',
    category: 'Marketing',
    type: 'expense',
    amount: 3500000,
    description: 'Social media advertising'
  },
  {
    id: '6',
    date: new Date('2026-02-10'),
    name: 'Product Sales - Store B',
    category: 'Sales',
    type: 'income',
    amount: 12000000,
    description: 'Sales from Store B'
  },
  {
    id: '7',
    date: new Date('2026-02-08'),
    name: 'Office Supplies',
    category: 'Operational',
    type: 'expense',
    amount: 1500000,
    description: 'Stationery and supplies'
  },
  {
    id: '8',
    date: new Date('2026-02-05'),
    name: 'Electricity Bill',
    category: 'Utilities',
    type: 'expense',
    amount: 2000000,
    description: 'Monthly electricity'
  },
];

export function FinanceProvider({ children }) {
  const [transactions, setTransactions] = useState(sampleTransactions);
  const [categories, setCategories] = useState(defaultCategories);
  const [userSettings, setUserSettings] = useState({
    userName: 'Jonatan Doe',
    businessName: 'UMKMs Business Solutions',
    email: 'john.doe@business.com',
  });
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [cashFlows, setCashFlows] = useState([]);
  const [inventory, setInventory] = useState([]);

  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransaction = (id: string, updatedData) => {
    setTransactions(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updatedData } : t))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addCategory = (category) => {
    const newCategory = {
      ...category,
      id: Date.now().toString(),
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (id: string, updatedData) => {
    setCategories(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updatedData } : c))
    );
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const updateUserSettings = (settings) => {
    setUserSettings(prev => ({ ...prev, ...settings }));
  };

  const getTotalIncome = (startDate?: Date, endDate?: Date) => {
    // Income = Sales + Cash Inflows
    const salesTotal = sales
      .filter(s => {
        if (startDate && s.date < startDate) return false;
        if (endDate && s.date > endDate) return false;
        return true;
      })
      .reduce((sum, s) => sum + s.totalRevenue, 0);

    const cashInflowsTotal = cashFlows
      .filter(c => {
        if (c.type !== 'in') return false;
        if (startDate && c.date < startDate) return false;
        if (endDate && c.date > endDate) return false;
        return true;
      })
      .reduce((sum, c) => sum + c.amount, 0);

    return salesTotal + cashInflowsTotal;
  };

  const getTotalExpenses = (startDate?: Date, endDate?: Date) => {
    // Expenses = Purchases + Cash Outflows
    const purchasesTotal = purchases
      .filter(p => {
        if (startDate && p.date < startDate) return false;
        if (endDate && p.date > endDate) return false;
        return true;
      })
      .reduce((sum, p) => sum + p.totalAmount, 0);

    const cashOutflowsTotal = cashFlows
      .filter(c => {
        if (c.type !== 'out') return false;
        if (startDate && c.date < startDate) return false;
        if (endDate && c.date > endDate) return false;
        return true;
      })
      .reduce((sum, c) => sum + c.amount, 0);

    return purchasesTotal + cashOutflowsTotal;
  };

  const getNetProfit = (startDate?: Date, endDate?: Date) => {
    return getTotalIncome(startDate, endDate) - getTotalExpenses(startDate, endDate);
  };

  const getCurrentBalance = () => {
    // Current Balance = Sum of all cash flows (in - out)
    return cashFlows.reduce((balance, c) => {
      return c.type === 'in' ? balance + c.amount : balance - c.amount;
    }, 0);
  };

  const addPurchase = (purchase) => {
    const newPurchase = {
      ...purchase,
      id: Date.now().toString(),
    };
    setPurchases(prev => [newPurchase, ...prev]);
  };

  const updatePurchase = (id: string, updatedData) => {
    setPurchases(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updatedData } : p))
    );
  };

  const deletePurchase = (id: string) => {
    setPurchases(prev => prev.filter(p => p.id !== id));
  };

  const addSale = (sale) => {
    const newSale = {
      ...sale,
      id: Date.now().toString(),
    };
    setSales(prev => [newSale, ...prev]);
  };

  const updateSale = (id: string, updatedData) => {
    setSales(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updatedData } : s))
    );
  };

  const deleteSale = (id: string) => {
    setSales(prev => prev.filter(s => s.id !== id));
  };

  const addCashFlow = (cashFlow) => {
    const newCashFlow = {
      ...cashFlow,
      id: Date.now().toString(),
    };
    setCashFlows(prev => [newCashFlow, ...prev]);
  };

  const updateCashFlow = (id: string, updatedData) => {
    setCashFlows(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updatedData } : c))
    );
  };

  const deleteCashFlow = (id: string) => {
    setCashFlows(prev => prev.filter(c => c.id !== id));
  };

  const addInventoryItem = (item) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
    };
    setInventory(prev => [newItem, ...prev]);
  };

  const updateInventoryItem = (id: string, updatedData) => {
    setInventory(prev =>
      prev.map(i => (i.id === id ? { ...i, ...updatedData } : i))
    );
  };

  const deleteInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(i => i.id !== id));
  };

  const reduceInventoryStock = (productName: string, quantity: number) => {
    const item = inventory.find(i => i.productName === productName);
    if (item && item.quantity >= quantity) {
      updateInventoryItem(item.id, { quantity: item.quantity - quantity });
      return true;
    }
    return false;
  };

  const getInventoryByProductName = (productName: string) => {
    return inventory.find(i => i.productName === productName);
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        categories,
        userSettings,
        purchases,
        sales,
        cashFlows,
        inventory,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        updateUserSettings,
        getTotalIncome,
        getTotalExpenses,
        getNetProfit,
        getCurrentBalance,
        addPurchase,
        updatePurchase,
        deletePurchase,
        addSale,
        updateSale,
        deleteSale,
        addCashFlow,
        updateCashFlow,
        deleteCashFlow,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        reduceInventoryStock,
        getInventoryByProductName,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within FinanceProvider');
  }
  return context;
}