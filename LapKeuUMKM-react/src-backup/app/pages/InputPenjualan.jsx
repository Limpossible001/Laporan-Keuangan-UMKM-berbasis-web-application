import { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { format } from 'date-fns';
import { Plus, Trash2, Download, FileSpreadsheet } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
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
import { toast } from 'sonner';

export function InputPenjualan() {
  const { sales, addSale, deleteSale, userSettings, inventory, getInventoryByProductName, reduceInventoryStock } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    productName: '',
    quantity: '',
    unitPrice: '',
    customerNotes: '',
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
    doc.text('Sales Records Report', 14, 20);
    
    doc.setFontSize(10);
    doc.text(userSettings.businessName, 14, 30);
    doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, 14, 36);
    
    doc.setFontSize(12);
    doc.text('Summary:', 14, 46);
    doc.setFontSize(10);
    doc.text(`Total Sales: ${sales.length}`, 14, 52);
    doc.text(`Total Revenue: ${formatCurrency(getTotalRevenue())}`, 14, 58);
    doc.text(`Total Items Sold: ${getTotalQuantity()}`, 14, 64);
    
    const tableData = sales.map(s => [
      format(s.date, 'dd/MM/yyyy'),
      s.productName,
      s.quantity.toString(),
      formatCurrency(s.unitPrice),
      formatCurrency(s.totalRevenue),
      s.customerNotes || '-',
    ]);
    
    autoTable(doc, {
      startY: 72,
      head: [['Date', 'Product', 'Qty', 'Unit Price', 'Revenue', 'Notes']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94] },
    });
    
    doc.save(`sales-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const handleDownloadExcel = () => {
    const worksheetData = [
      ['Sales Records Report'],
      [userSettings.businessName],
      [`Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`],
      [],
      ['Summary:'],
      [`Total Sales: ${sales.length}`],
      [`Total Revenue: ${formatCurrency(getTotalRevenue())}`],
      [`Total Items Sold: ${getTotalQuantity()}`],
      [],
      ['Date', 'Product', 'Quantity', 'Unit Price', 'Total Revenue', 'Customer Notes'],
      ...sales.map(s => [
        format(s.date, 'dd/MM/yyyy'),
        s.productName,
        s.quantity,
        s.unitPrice,
        s.totalRevenue,
        s.customerNotes || '-',
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Records');
    XLSX.writeFile(workbook, `sales-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const handleProductSelect = (productName: string) => {
    setSelectedProduct(productName);
    const product = getInventoryByProductName(productName);
    if (product) {
      setFormData({
        ...formData,
        productName: productName,
        unitPrice: product.unitPrice.toString(),
      });
    }
  };

  const getCurrentStock = () => {
    if (selectedProduct) {
      const product = getInventoryByProductName(selectedProduct);
      return product ? product.quantity : 0;
    }
    return 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const quantity = parseFloat(formData.quantity);
    const unitPrice = parseFloat(formData.unitPrice);
    
    // Validate stock availability
    const product = getInventoryByProductName(formData.productName);
    if (product && product.quantity < quantity) {
      toast.error(`Insufficient stock! Available: ${product.quantity} units`);
      return;
    }

    if (!product) {
      toast.error('Please select a product from inventory');
      return;
    }

    const totalRevenue = quantity * unitPrice;

    // Reduce inventory stock first
    const stockReduced = reduceInventoryStock(formData.productName, quantity);
    
    if (!stockReduced) {
      toast.error('Failed to update inventory stock');
      return;
    }

    addSale({
      date: new Date(formData.date),
      productName: formData.productName,
      quantity,
      unitPrice,
      totalRevenue,
      customerNotes: formData.customerNotes || undefined,
    });

    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      productName: '',
      quantity: '',
      unitPrice: '',
      customerNotes: '',
    });
    setSelectedProduct('');
    setIsModalOpen(false);
    toast.success('Sale added successfully! Inventory updated.');
  };

  const getTotalRevenue = () => {
    return sales.reduce((sum, s) => sum + s.totalRevenue, 0);
  };

  const getTotalQuantity = () => {
    return sales.reduce((sum, s) => sum + s.quantity, 0);
  };

  const handleOpenModal = () => {
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      productName: '',
      quantity: '',
      unitPrice: '',
      customerNotes: '',
    });
    setSelectedProduct('');
    setIsModalOpen(true);
  };

  return (
    <>
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        {/* Header Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Total Sales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-xl lg:text-2xl font-bold text-foreground">
                {sales.length}
              </div>
              <p className="text-xs text-muted-foreground">Total transactions</p>
            </CardContent>
          </Card>

          <Card className="border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-xl lg:text-2xl font-bold text-green-600">
                {formatCurrency(getTotalRevenue())}
              </div>
              <p className="text-xs text-muted-foreground">All time revenue</p>
            </CardContent>
          </Card>

          <Card className="border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-primary to-secondary text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-white/80 uppercase tracking-wide">
                Items Sold
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-xl lg:text-2xl font-bold text-white">
                {getTotalQuantity()}
              </div>
              <p className="text-xs text-white/70">Total units</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Button */}
        <div className="mb-6 flex flex-wrap gap-3">
          <Button
            onClick={handleOpenModal}
            className="bg-green-600 hover:bg-green-700 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Sale
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

        {/* Sales Table */}
        <Card className="border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-foreground">
              Sales Records
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">All sales transactions</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quantity</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unit Price</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Revenue</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground text-sm">
                        No sales records yet. Click "Add Sale" to create one.
                      </td>
                    </tr>
                  ) : (
                    sales.map((sale) => (
                      <tr key={sale.id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                        <td className="py-3.5 px-4 text-sm text-muted-foreground">
                          {format(sale.date, 'dd MMM yyyy')}
                        </td>
                        <td className="py-3.5 px-4 text-sm font-medium text-foreground">
                          {sale.productName}
                        </td>
                        <td className="py-3.5 px-4 text-sm text-right text-muted-foreground">
                          {sale.quantity}
                        </td>
                        <td className="py-3.5 px-4 text-sm text-right text-muted-foreground">
                          {formatCurrency(sale.unitPrice)}
                        </td>
                        <td className="py-3.5 px-4 text-sm text-right font-semibold text-green-600">
                          {formatCurrency(sale.totalRevenue)}
                        </td>
                        <td className="py-3.5 px-4 text-sm text-muted-foreground">
                          {sale.customerNotes || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => deleteSale(sale.id)}
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

      {/* Add Sale Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Sale</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Sale Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="productName">Product Name</Label>
                <Select
                  value={formData.productName}
                  onValueChange={handleProductSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product">
                      {formData.productName ? formData.productName : 'Select a product'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {inventory.length === 0 ? (
                      <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                        No products in inventory. Please add products first.
                      </div>
                    ) : (
                      inventory.map((item) => (
                        <SelectItem key={item.id} value={item.productName}>
                          {item.productName} - Stock: {item.quantity}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {selectedProduct && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-blue-700">Available Stock:</span>
                      <span className={`font-semibold ${getCurrentStock() < 10 ? 'text-red-600' : 'text-blue-600'}`}>
                        {getCurrentStock()} units
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity Sold</Label>
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
              <div className="grid gap-2">
                <Label htmlFor="customerNotes">Customer Notes (Optional)</Label>
                <Textarea
                  id="customerNotes"
                  value={formData.customerNotes}
                  onChange={(e) => setFormData({ ...formData, customerNotes: e.target.value })}
                  placeholder="Add any notes about this sale"
                  rows={3}
                />
              </div>
              {formData.quantity && formData.unitPrice && (
                <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-green-700">Total Revenue:</span>
                    <span className="text-base font-bold text-green-600">
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
              <Button type="submit" className="bg-green-600 hover:bg-green-700">Add Sale</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}