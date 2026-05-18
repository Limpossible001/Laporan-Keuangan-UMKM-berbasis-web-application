import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { FileText, ShoppingCart, DollarSign, Package, Download, BookOpen } from 'lucide-react';

export function Panduan() {
  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">User Guide - UMKM Financial Management System</h1>
        <p className="text-muted-foreground">
          This guide will help you understand how to use the financial reporting system based on Excel workflow structure.
        </p>
      </div>

      {/* Guide Sections */}
      <div className="space-y-6">
        {/* Overview */}
        <Card className="border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-base font-semibold text-foreground">
                System Overview
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <p className="text-sm text-foreground">
              This UMKM Financial Management System is designed to help small businesses manage their finances following the same structure as Excel-based financial reporting templates. The system provides dedicated input forms for different types of financial activities and generates comprehensive reports based on your data.
            </p>
            <p className="text-sm text-foreground">
              The system tracks purchases, sales, cash flow, and inventory - all critical components of UMKM financial management.
            </p>
          </CardContent>
        </Card>

        {/* Input Pembelian Guide */}
        <Card className="border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle className="text-base font-semibold text-foreground">
                Input Pembelian (Purchase Input)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <p className="text-sm text-foreground font-medium">How to record purchases:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-foreground ml-2">
              <li>Navigate to "Input Pembelian" from the sidebar menu</li>
              <li>Click the "Add Purchase" button</li>
              <li>Fill in the following details:
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-muted-foreground">
                  <li>Transaction Date: When the purchase was made</li>
                  <li>Supplier Name: Name of the supplier/vendor</li>
                  <li>Item Name: What you purchased</li>
                  <li>Quantity: Amount purchased</li>
                  <li>Unit Price: Price per unit</li>
                </ul>
              </li>
              <li>The system will automatically calculate the total amount</li>
              <li>Click "Add Purchase" to save the record</li>
            </ol>
            <p className="text-sm text-muted-foreground italic">
              Tip: All purchase records will be reflected in your financial reports and affect your expense calculations.
            </p>
          </CardContent>
        </Card>

        {/* Input Penjualan Guide */}
        <Card className="border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <CardTitle className="text-base font-semibold text-foreground">
                Input Penjualan (Sales Input)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <p className="text-sm text-foreground font-medium">How to record sales:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-foreground ml-2">
              <li>Navigate to "Input Penjualan" from the sidebar menu</li>
              <li>Click the "Add Sale" button</li>
              <li>Fill in the following details:
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-muted-foreground">
                  <li>Sale Date: When the sale occurred</li>
                  <li>Product Name: Name of the product sold</li>
                  <li>Quantity Sold: Amount sold</li>
                  <li>Unit Price: Price per unit</li>
                  <li>Customer Notes: Optional notes about the customer or sale</li>
                </ul>
              </li>
              <li>The system will automatically calculate the total revenue</li>
              <li>Click "Add Sale" to save the record</li>
            </ol>
            <p className="text-sm text-muted-foreground italic">
              Tip: Sales records directly contribute to your income and revenue reports.
            </p>
          </CardContent>
        </Card>

        {/* Input Kas Guide */}
        <Card className="border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <CardTitle className="text-base font-semibold text-foreground">
                Input Penerimaan / Pengeluaran Kas (Cash In / Cash Out)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <p className="text-sm text-foreground font-medium">How to record cash flow:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-foreground ml-2">
              <li>Navigate to "Input Kas" from the sidebar menu</li>
              <li>Click either "Add Cash In" for money received or "Add Cash Out" for money paid</li>
              <li>Fill in the following details:
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-muted-foreground">
                  <li>Transaction Date: When the cash flow occurred</li>
                  <li>Transaction Type: Cash In (received) or Cash Out (paid)</li>
                  <li>Description: Details about the transaction</li>
                  <li>Category: Select appropriate category (income or expense)</li>
                  <li>Amount: The amount of cash involved</li>
                </ul>
              </li>
              <li>Click the appropriate button to save the record</li>
            </ol>
            <p className="text-sm text-muted-foreground italic">
              Tip: Use this feature for non-sales income (like loans, investments) and operational expenses (like rent, utilities, salaries).
            </p>
          </CardContent>
        </Card>

        {/* Input Inventory Guide */}
        <Card className="border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
              <CardTitle className="text-base font-semibold text-foreground">
                Input Inventory (Inventory Management)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <p className="text-sm text-foreground font-medium">How to manage inventory:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-foreground ml-2">
              <li>Navigate to "Input Inventory" from the sidebar menu</li>
              <li>To add a new product, click "Add Inventory Item" and fill in:
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-muted-foreground">
                  <li>Product Name: Name of the item</li>
                  <li>Initial Quantity: Starting stock amount</li>
                  <li>Notes: Optional notes about the product</li>
                </ul>
              </li>
              <li>To update stock levels, click the package icon next to an item and enter:
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-muted-foreground">
                  <li>Stock Adjustment: Positive number to add, negative to reduce</li>
                  <li>Notes: Reason for the adjustment</li>
                </ul>
              </li>
              <li>Monitor stock status: The system alerts you when items are low or out of stock</li>
            </ol>
            <p className="text-sm text-muted-foreground italic">
              Tip: Keep your inventory updated to track stock levels and prevent shortages. Items below 10 units are marked as "Low Stock".
            </p>
          </CardContent>
        </Card>

        {/* Download PDF Guide */}
        <Card className="border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <Download className="w-5 h-5 text-red-600" />
              </div>
              <CardTitle className="text-base font-semibold text-foreground">
                Download PDF (Export Reports)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <p className="text-sm text-foreground font-medium">How to export your financial data:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-foreground ml-2">
              <li>Navigate to any data page (Purchases, Sales, Cash Flow, or Inventory)</li>
              <li>Look for the "Download PDF" button in the top section</li>
              <li>Click the button to generate a PDF report</li>
              <li>The PDF will include:
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-muted-foreground">
                  <li>Summary statistics</li>
                  <li>Detailed transaction records</li>
                  <li>Date of report generation</li>
                  <li>Your business information</li>
                </ul>
              </li>
              <li>Save or print the PDF for documentation or submission</li>
            </ol>
            <p className="text-sm text-muted-foreground italic">
              Tip: Export reports regularly for backup and financial review purposes.
            </p>
          </CardContent>
        </Card>

        {/* Best Practices */}
        <Card className="border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-primary to-secondary text-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-white">
              Best Practices for UMKM Financial Management
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <ul className="list-disc list-inside space-y-2 text-sm text-white/90">
              <li>Record all transactions as soon as they occur to maintain accuracy</li>
              <li>Categorize transactions correctly to generate meaningful reports</li>
              <li>Review your cash flow regularly to ensure healthy business operations</li>
              <li>Monitor inventory levels to prevent stockouts and overstocking</li>
              <li>Export reports monthly for record-keeping and financial analysis</li>
              <li>Use the dashboard to get a quick overview of your financial health</li>
              <li>Keep notes on unusual transactions for future reference</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}