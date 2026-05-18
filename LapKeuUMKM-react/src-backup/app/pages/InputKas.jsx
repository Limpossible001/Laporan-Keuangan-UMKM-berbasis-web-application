import { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { format } from 'date-fns';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, Download, FileSpreadsheet } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export function InputKas() {
  const { cashFlows, addCashFlow, deleteCashFlow, categories, userSettings } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'in' as 'in' | 'out',
    description: '',
    amount: '',
    category: '',
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Cash Flow Report', 14, 20);
    
    doc.setFontSize(10);
    doc.text(userSettings.businessName, 14, 30);
    doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, 14, 36);
    
    doc.setFontSize(12);
    doc.text('Summary:', 14, 46);
    doc.setFontSize(10);
    doc.text(`Cash In: ${formatCurrency(getCashIn())}`, 14, 52);
    doc.text(`Cash Out: ${formatCurrency(getCashOut())}`, 14, 58);
    doc.text(`Net Cash Flow: ${formatCurrency(getNetCash())}`, 14, 64);
    
    const tableData = cashFlows.map(c => [
      format(c.date, 'dd/MM/yyyy'),
      c.type === 'in' ? 'Cash In' : 'Cash Out',
      c.description,
      c.category,
      formatCurrency(c.amount),
    ]);
    
    autoTable(doc, {
      startY: 72,
      head: [['Date', 'Type', 'Description', 'Category', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [91, 62, 255] },
    });
    
    doc.save(`cashflow-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const handleDownloadExcel = () => {
    const worksheetData = [
      ['Cash Flow Report'],
      [userSettings.businessName],
      [`Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`],
      [],
      ['Summary:'],
      [`Cash In: ${formatCurrency(getCashIn())}`],
      [`Cash Out: ${formatCurrency(getCashOut())}`],
      [`Net Cash Flow: ${formatCurrency(getNetCash())}`],
      [],
      ['Date', 'Type', 'Description', 'Category', 'Amount'],
      ...cashFlows.map(c => [
        format(c.date, 'dd/MM/yyyy'),
        c.type === 'in' ? 'Cash In' : 'Cash Out',
        c.description,
        c.category,
        c.amount,
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cash Flow');
    XLSX.writeFile(workbook, `cashflow-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addCashFlow({
      date: new Date(formData.date),
      type: formData.type,
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
    });

    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      type: 'in',
      description: '',
      amount: '',
      category: '',
    });
    setIsModalOpen(false);
  };

  const getCashIn = () => {
    return cashFlows.filter(c => c.type === 'in').reduce((sum, c) => sum + c.amount, 0);
  };

  const getCashOut = () => {
    return cashFlows.filter(c => c.type === 'out').reduce((sum, c) => sum + c.amount, 0);
  };

  const getNetCash = () => {
    return getCashIn() - getCashOut();
  };

  return (
    <>
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        {/* Header Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Cash In
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(getCashIn())}
              </div>
              <p className="text-xs text-muted-foreground">Total cash received</p>
            </CardContent>
          </Card>

          <Card className="border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Cash Out
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(getCashOut())}
              </div>
              <p className="text-xs text-muted-foreground">Total cash paid</p>
            </CardContent>
          </Card>

          <Card className="border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-primary to-secondary text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-white/80 uppercase tracking-wide">
                Net Cash Flow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-2xl font-bold text-white">
                {formatCurrency(getNetCash())}
              </div>
              <p className="text-xs text-white/70">Cash in - Cash out</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            onClick={() => {
              setFormData({ ...formData, type: 'in' });
              setIsModalOpen(true);
            }}
            className="bg-green-600 hover:bg-green-700 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Cash In
          </Button>
          <Button
            onClick={() => {
              setFormData({ ...formData, type: 'out' });
              setIsModalOpen(true);
            }}
            className="bg-red-600 hover:bg-red-700 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Cash Out
          </Button>
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            className="shadow-sm hover:shadow-md transition-all duration-200 rounded-xl"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button
            onClick={handleDownloadExcel}
            variant="outline"
            className="shadow-sm hover:shadow-md transition-all duration-200 rounded-xl"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Download Excel
          </Button>
        </div>

        {/* Cash Flow Table */}
        <Card className="border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-foreground">
              Cash Flow Records
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">All cash in and cash out transactions</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
              <table className="w-full min-w-[750px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cashFlows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground text-sm">
                        No cash flow records yet. Click "Add Cash In" or "Add Cash Out" to create one.
                      </td>
                    </tr>
                  ) : (
                    cashFlows.map((cashFlow) => (
                      <tr key={cashFlow.id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                        <td className="py-3.5 px-4 text-sm text-muted-foreground">
                          {format(cashFlow.date, 'dd MMM yyyy')}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                            cashFlow.type === 'in'
                              ? 'bg-green-50 text-green-700 border border-green-100'
                              : 'bg-red-50 text-red-700 border border-red-100'
                          }`}>
                            {cashFlow.type === 'in' ? 'Cash In' : 'Cash Out'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-sm font-medium text-foreground">
                          {cashFlow.description}
                        </td>
                        <td className="py-3.5 px-4 text-sm text-muted-foreground">
                          {cashFlow.category}
                        </td>
                        <td className={`py-3.5 px-4 text-sm text-right font-semibold ${
                          cashFlow.type === 'in' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {cashFlow.type === 'in' ? '+' : '-'}{formatCurrency(cashFlow.amount)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => deleteCashFlow(cashFlow.id)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Add Cash Flow Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {formData.type === 'in' ? 'Add Cash In' : 'Add Cash Out'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Transaction Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Transaction Type</Label>
                <Select value={formData.type} onValueChange={(value: 'in' | 'out') => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Cash In</SelectItem>
                    <SelectItem value="out">Cash Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter(cat => formData.type === 'in' ? cat.type === 'income' || cat.type === 'both' : cat.type === 'expense' || cat.type === 'both')
                      .map(category => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className={formData.type === 'in' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {formData.type === 'in' ? 'Add Cash In' : 'Add Cash Out'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}