import { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { format } from 'date-fns';
import { Plus, Trash2, Edit, Download, FileSpreadsheet } from 'lucide-react';
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export function InputPembelian() {
  const { purchases, addPurchase, deletePurchase, userSettings } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    supplierName: '',
    itemName: '',
    quantity: '',
    unitPrice: '',
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
    
    // Title
    doc.setFontSize(18);
    doc.text('Purchase Records Report', 14, 20);
    
    // Business info
    doc.setFontSize(10);
    doc.text(userSettings.businessName, 14, 30);
    doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, 14, 36);
    
    // Summary
    doc.setFontSize(12);
    doc.text('Summary:', 14, 46);
    doc.setFontSize(10);
    doc.text(`Total Purchases: ${purchases.length}`, 14, 52);
    doc.text(`Total Amount: ${formatCurrency(getTotalPurchases())}`, 14, 58);
    
    // Table
    const tableData = purchases.map(p => [
      format(p.date, 'dd/MM/yyyy'),
      p.supplierName,
      p.itemName,
      p.quantity.toString(),
      formatCurrency(p.unitPrice),
      formatCurrency(p.totalAmount),
    ]);
    
    autoTable(doc, {
      startY: 65,
      head: [['Date', 'Supplier', 'Item', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [91, 62, 255] },
    });
    
    doc.save(`purchase-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const handleDownloadExcel = () => {
    const worksheetData = [
      ['Purchase Records Report'],
      [userSettings.businessName],
      [`Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`],
      [],
      ['Summary:'],
      [`Total Purchases: ${purchases.length}`],
      [`Total Amount: ${formatCurrency(getTotalPurchases())}`],
      [],
      ['Date', 'Supplier', 'Item', 'Quantity', 'Unit Price', 'Total Amount'],
      ...purchases.map(p => [
        format(p.date, 'dd/MM/yyyy'),
        p.supplierName,
        p.itemName,
        p.quantity,
        p.unitPrice,
        p.totalAmount,
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Purchase Records');
    XLSX.writeFile(workbook, `purchase-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const quantity = parseFloat(formData.quantity);
    const unitPrice = parseFloat(formData.unitPrice);
    const totalAmount = quantity * unitPrice;

    addPurchase({
      date: new Date(formData.date),
      supplierName: formData.supplierName,
      itemName: formData.itemName,
      quantity,
      unitPrice,
      totalAmount,
    });

    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      supplierName: '',
      itemName: '',
      quantity: '',
      unitPrice: '',
    });
    setIsModalOpen(false);
  };

  const getTotalPurchases = () => {
    return purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  };

  return (
    <>
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        {/* Header Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Total Purchases
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-xl lg:text-2xl font-bold text-foreground">
                {purchases.length}
              </div>
              <p className="text-xs text-muted-foreground">Total records</p>
            </CardContent>
          </Card>

          <Card className="border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Total Amount
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-xl lg:text-2xl font-bold text-foreground">
                {formatCurrency(getTotalPurchases())}
              </div>
              <p className="text-xs text-muted-foreground">All time purchases</p>
            </CardContent>
          </Card>

          <Card className="border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-primary to-secondary text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-white/80 uppercase tracking-wide">
                Average Purchase
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-xl lg:text-2xl font-bold text-white">
                {formatCurrency(purchases.length > 0 ? getTotalPurchases() / purchases.length : 0)}
              </div>
              <p className="text-xs text-white/70">Per transaction</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Button */}
        <div className="mb-6 flex flex-wrap gap-3">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Purchase
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

        {/* Purchases Table */}
        <Card className="border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-foreground">
              Purchase Records
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">All purchase transactions</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Supplier</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Item</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quantity</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unit Price</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground text-sm">
                        No purchase records yet. Click "Add Purchase" to create one.
                      </td>
                    </tr>
                  ) : (
                    purchases.map((purchase) => (
                      <tr key={purchase.id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                        <td className="py-3.5 px-4 text-sm text-muted-foreground">
                          {format(purchase.date, 'dd MMM yyyy')}
                        </td>
                        <td className="py-3.5 px-4 text-sm font-medium text-foreground">
                          {purchase.supplierName}
                        </td>
                        <td className="py-3.5 px-4 text-sm text-foreground">
                          {purchase.itemName}
                        </td>
                        <td className="py-3.5 px-4 text-sm text-right text-muted-foreground">
                          {purchase.quantity}
                        </td>
                        <td className="py-3.5 px-4 text-sm text-right text-muted-foreground">
                          {formatCurrency(purchase.unitPrice)}
                        </td>
                        <td className="py-3.5 px-4 text-sm text-right font-semibold text-foreground">
                          {formatCurrency(purchase.totalAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => deletePurchase(purchase.id)}
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

      {/* Add Purchase Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Purchase</DialogTitle>
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
                <Label htmlFor="supplierName">Supplier Name</Label>
                <Input
                  id="supplierName"
                  value={formData.supplierName}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  placeholder="Enter supplier name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  placeholder="Enter item name"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unitPrice">Unit Price</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>
              </div>
              {formData.quantity && formData.unitPrice && (
                <div className="p-3 bg-accent/50 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Total Amount:</span>
                    <span className="text-base font-bold text-foreground">
                      {formatCurrency(parseFloat(formData.quantity) * parseFloat(formData.unitPrice))}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Purchase</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}