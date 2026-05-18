import { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { format } from 'date-fns';
import { Plus, Trash2, Package, Download, FileSpreadsheet } from 'lucide-react';
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export function InputInventory() {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, userSettings } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    unitPrice: '',
    quantity: '',
    notes: '',
  });
  const [updateData, setUpdateData] = useState({
    adjustment: '',
    notes: '',
  });

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Inventory Report', 14, 20);
    
    doc.setFontSize(10);
    doc.text(userSettings.businessName, 14, 30);
    doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, 14, 36);
    
    doc.setFontSize(12);
    doc.text('Summary:', 14, 46);
    doc.setFontSize(10);
    doc.text(`Total Products: ${getTotalItems()}`, 14, 52);
    doc.text(`Total Stock: ${getTotalQuantity()}`, 14, 58);
    doc.text(`Low Stock Items: ${getLowStockCount()}`, 14, 64);
    
    const tableData = inventory.map(i => [
      i.productName,
      i.quantity.toString(),
      format(i.lastUpdated, 'dd/MM/yyyy'),
      i.quantity === 0 ? 'Out of Stock' : i.quantity < 10 ? 'Low Stock' : 'In Stock',
      i.notes || '-',
    ]);
    
    autoTable(doc, {
      startY: 72,
      head: [['Product', 'Quantity', 'Last Updated', 'Status', 'Notes']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [91, 62, 255] },
    });
    
    doc.save(`inventory-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const handleDownloadExcel = () => {
    const worksheetData = [
      ['Inventory Report'],
      [userSettings.businessName],
      [`Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`],
      [],
      ['Summary:'],
      [`Total Products: ${getTotalItems()}`],
      [`Total Stock: ${getTotalQuantity()}`],
      [`Low Stock Items: ${getLowStockCount()}`],
      [],
      ['Product Name', 'Quantity', 'Last Updated', 'Status', 'Notes'],
      ...inventory.map(i => [
        i.productName,
        i.quantity,
        format(i.lastUpdated, 'dd/MM/yyyy'),
        i.quantity === 0 ? 'Out of Stock' : i.quantity < 10 ? 'Low Stock' : 'In Stock',
        i.notes || '-',
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
    XLSX.writeFile(workbook, `inventory-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addInventoryItem({
      productName: formData.productName,
      category: formData.category || undefined,
      unitPrice: parseFloat(formData.unitPrice) || 0,
      quantity: parseFloat(formData.quantity),
      lastUpdated: new Date(),
      notes: formData.notes || undefined,
    });

    setFormData({
      productName: '',
      category: '',
      unitPrice: '',
      quantity: '',
      notes: '',
    });
    setIsModalOpen(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedItem) {
      const adjustment = parseFloat(updateData.adjustment);
      const newQuantity = selectedItem.quantity + adjustment;
      
      updateInventoryItem(selectedItem.id, {
        quantity: newQuantity,
        lastUpdated: new Date(),
        notes: updateData.notes || selectedItem.notes,
      });

      setUpdateData({
        adjustment: '',
        notes: '',
      });
      setIsUpdateModalOpen(false);
      setSelectedItem(null);
    }
  };

  const openUpdateModal = (item: any) => {
    setSelectedItem(item);
    setUpdateData({
      adjustment: '',
      notes: item.notes || '',
    });
    setIsUpdateModalOpen(true);
  };

  const getTotalItems = () => {
    return inventory.length;
  };

  const getTotalQuantity = () => {
    return inventory.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getLowStockCount = () => {
    return inventory.filter(item => item.quantity < 10).length;
  };

  return (
    <>
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        {/* Header Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Total Products
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-2xl font-bold text-foreground">
                {getTotalItems()}
              </div>
              <p className="text-xs text-muted-foreground">Unique items</p>
            </CardContent>
          </Card>

          <Card className="border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Total Stock
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-2xl font-bold text-foreground">
                {getTotalQuantity()}
              </div>
              <p className="text-xs text-muted-foreground">Total units</p>
            </CardContent>
          </Card>

          <Card className="border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-primary to-secondary text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-white/80 uppercase tracking-wide">
                Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-2xl font-bold text-white">
                {getLowStockCount()}
              </div>
              <p className="text-xs text-white/70">Items below 10 units</p>
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
            Add Inventory Item
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

        {/* Inventory Table */}
        <Card className="border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-foreground">
              Inventory List
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Manage your product stock</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product Name</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quantity</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Updated</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground text-sm">
                        No inventory items yet. Click "Add Inventory Item" to create one.
                      </td>
                    </tr>
                  ) : (
                    inventory.map((item) => (
                      <tr key={item.id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                        <td className="py-3.5 px-4 text-sm font-medium text-foreground">
                          {item.productName}
                        </td>
                        <td className="py-3.5 px-4 text-sm text-right font-semibold text-foreground">
                          {item.quantity}
                        </td>
                        <td className="py-3.5 px-4 text-sm text-muted-foreground">
                          {format(item.lastUpdated, 'dd MMM yyyy')}
                        </td>
                        <td className="py-3.5 px-4 text-sm text-muted-foreground">
                          {item.notes || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                            item.quantity === 0
                              ? 'bg-red-50 text-red-700 border border-red-100'
                              : item.quantity < 10
                              ? 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                              : 'bg-green-50 text-green-700 border border-green-100'
                          }`}>
                            {item.quantity === 0 ? 'Out of Stock' : item.quantity < 10 ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openUpdateModal(item)}
                              className="text-primary hover:text-primary/80 transition-colors"
                            >
                              <Package className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteInventoryItem(item.id)}
                              className="text-red-600 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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

      {/* Add Inventory Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Enter category"
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
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">Initial Quantity</Label>
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
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any notes about this item"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Item</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Inventory Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Stock: {selectedItem?.productName}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="grid gap-4 py-4">
              <div className="p-3 bg-accent/50 rounded-xl">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-muted-foreground">Current Stock:</span>
                  <span className="text-lg font-bold text-foreground">{selectedItem?.quantity}</span>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="adjustment">Stock Adjustment</Label>
                <Input
                  id="adjustment"
                  type="number"
                  step="0.01"
                  value={updateData.adjustment}
                  onChange={(e) => setUpdateData({ ...updateData, adjustment: e.target.value })}
                  placeholder="Enter adjustment (use - for decrease)"
                  required
                />
                <p className="text-xs text-muted-foreground">Use positive numbers to add stock, negative to reduce</p>
              </div>
              {updateData.adjustment && (
                <div className="p-3 bg-primary/10 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-primary">New Stock:</span>
                    <span className="text-lg font-bold text-primary">
                      {selectedItem ? selectedItem.quantity + parseFloat(updateData.adjustment) : 0}
                    </span>
                  </div>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="updateNotes">Notes (Optional)</Label>
                <Textarea
                  id="updateNotes"
                  value={updateData.notes}
                  onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                  placeholder="Add any notes about this update"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsUpdateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Stock</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}