import { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { FileDown, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export function Reports() {
  const { sales, purchases, cashFlows, categories, userSettings } = useFinance();
  const [dateFrom, setDateFrom] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Filter by date range
  const filteredSales = sales.filter((s) => {
    const saleDate = new Date(s.date);
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    return saleDate >= fromDate && saleDate <= toDate;
  });

  const filteredPurchases = purchases.filter((p) => {
    const purchaseDate = new Date(p.date);
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    return purchaseDate >= fromDate && purchaseDate <= toDate;
  });

  const filteredCashFlows = cashFlows.filter((c) => {
    const cashDate = new Date(c.date);
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    return cashDate >= fromDate && cashDate <= toDate;
  });

  // Calculate totals for Profit & Loss
  const salesRevenue = filteredSales.reduce((sum, s) => sum + s.totalRevenue, 0);
  const cashInflows = filteredCashFlows.filter(c => c.type === 'in').reduce((sum, c) => sum + c.amount, 0);
  const totalIncome = salesRevenue + cashInflows;

  const purchaseExpenses = filteredPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const cashOutflows = filteredCashFlows.filter(c => c.type === 'out').reduce((sum, c) => sum + c.amount, 0);
  const totalExpenses = purchaseExpenses + cashOutflows;

  const netProfit = totalIncome - totalExpenses;

  // Group income by category (from sales and cash in)
  const incomeByCategory: Record<string, number> = {};
  
  // Add sales to income
  filteredSales.forEach(s => {
    incomeByCategory['Sales'] = (incomeByCategory['Sales'] || 0) + s.totalRevenue;
  });
  
  // Add cash inflows to income
  filteredCashFlows.filter(c => c.type === 'in').forEach(c => {
    incomeByCategory[c.category] = (incomeByCategory[c.category] || 0) + c.amount;
  });

  // Group expenses by category (from purchases and cash out)
  const expenseByCategory: Record<string, number> = {};
  
  // Add purchases to expenses
  filteredPurchases.forEach(p => {
    expenseByCategory['Purchases'] = (expenseByCategory['Purchases'] || 0) + p.totalAmount;
  });
  
  // Add cash outflows to expenses
  filteredCashFlows.filter(c => c.type === 'out').forEach(c => {
    expenseByCategory[c.category] = (expenseByCategory[c.category] || 0) + c.amount;
  });

  const incomeCategoryData = Object.entries(incomeByCategory).map(([name, value]) => ({
    name,
    value: value / 1000000,
    fullValue: value,
  }));

  const expenseCategoryData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name,
    value: value / 1000000,
    fullValue: value,
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Profit & Loss Statement', 14, 20);
    doc.setFontSize(12);
    doc.text(`${format(new Date(dateFrom), 'dd MMMM yyyy')} - ${format(new Date(dateTo), 'dd MMMM yyyy')}`, 14, 30);

    // Income Section
    doc.setFontSize(14);
    doc.text('INCOME', 14, 50);
    doc.setFontSize(12);
    let y = 60;
    Object.entries(incomeByCategory).forEach(([category, amount]) => {
      doc.text(`${category}: ${formatCurrency(amount)}`, 14, y);
      y += 10;
    });
    doc.text(`Total Income: ${formatCurrency(totalIncome)}`, 14, y);
    y += 10;

    // Expenses Section
    doc.setFontSize(14);
    doc.text('EXPENSES', 14, y + 10);
    doc.setFontSize(12);
    y += 20;
    Object.entries(expenseByCategory).forEach(([category, amount]) => {
      doc.text(`${category}: ${formatCurrency(amount)}`, 14, y);
      y += 10;
    });
    doc.text(`Total Expenses: ${formatCurrency(totalExpenses)}`, 14, y);
    y += 10;

    // Net Profit
    doc.setFontSize(14);
    doc.text('NET PROFIT / LOSS', 14, y + 10);
    doc.setFontSize(12);
    y += 20;
    doc.text(`Net Profit: ${formatCurrency(netProfit)}`, 14, y);
    y += 10;
    doc.text(`Profit Margin: ${totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : 0}%`, 14, y);

    doc.save('profit_loss_statement.pdf');
  };

  const exportExcel = () => {
    const workbook = XLSX.utils.book_new();
    const worksheetData = [
      ['Profit & Loss Statement'],
      [`${format(new Date(dateFrom), 'dd MMMM yyyy')} - ${format(new Date(dateTo), 'dd MMMM yyyy')}`],
      [''],
      ['INCOME'],
      ...Object.entries(incomeByCategory).map(([category, amount]) => [category, formatCurrency(amount)]),
      ['Total Income', formatCurrency(totalIncome)],
      [''],
      ['EXPENSES'],
      ...Object.entries(expenseByCategory).map(([category, amount]) => [category, formatCurrency(amount)]),
      ['Total Expenses', formatCurrency(totalExpenses)],
      [''],
      ['NET PROFIT / LOSS'],
      ['Net Profit', formatCurrency(netProfit)],
      ['Profit Margin', `${totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : 0}%`],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Profit & Loss Statement');
    XLSX.writeFile(workbook, 'profit_loss_statement.xlsx');
  };

  return (
    <>
      {/* Top Bar */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8">
        <h2 className="text-xl font-semibold text-gray-900">Reports</h2>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        {/* Date Range Selector */}
        <Card className="border border-gray-200 mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-end gap-4">
              <div className="flex-1 w-full">
                <Label htmlFor="dateFrom">From Date</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex-1 w-full">
                <Label htmlFor="dateTo">To Date</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={exportPDF}>
                  <FileDown className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline" onClick={exportExcel}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Tabs */}
        <Tabs defaultValue="profit-loss" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
            <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
            <TabsTrigger value="category-analysis">Category Analysis</TabsTrigger>
          </TabsList>

          {/* Profit & Loss Report */}
          <TabsContent value="profit-loss" className="space-y-6">
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Profit & Loss Statement
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {format(new Date(dateFrom), 'dd MMMM yyyy')} - {format(new Date(dateTo), 'dd MMMM yyyy')}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Income Section */}
                  <div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">INCOME</h3>
                    </div>
                    {Object.entries(incomeByCategory).map(([category, amount]) => (
                      <div key={category} className="flex justify-between py-2 px-4 text-sm">
                        <span className="text-gray-700">{category}</span>
                        <span className="text-gray-900 font-medium">{formatCurrency(amount)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between py-2 px-4 border-t border-gray-200 font-semibold">
                      <span>Total Income</span>
                      <span className="text-green-600">{formatCurrency(totalIncome)}</span>
                    </div>
                  </div>

                  {/* Expenses Section */}
                  <div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">EXPENSES</h3>
                    </div>
                    {Object.entries(expenseByCategory).map(([category, amount]) => (
                      <div key={category} className="flex justify-between py-2 px-4 text-sm">
                        <span className="text-gray-700">{category}</span>
                        <span className="text-gray-900 font-medium">{formatCurrency(amount)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between py-2 px-4 border-t border-gray-200 font-semibold">
                      <span>Total Expenses</span>
                      <span className="text-red-600">{formatCurrency(totalExpenses)}</span>
                    </div>
                  </div>

                  {/* Net Profit */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">NET PROFIT / LOSS</span>
                      <span className={`text-xl font-bold ${
                        netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(netProfit)}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Profit Margin: {totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : 0}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cash Flow Report */}
          <TabsContent value="cash-flow" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Cash Inflow</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-green-600">
                    {formatCurrency(totalIncome)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {filteredCashFlows.filter(c => c.type === 'in').length} transactions
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Cash Outflow</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-red-600">
                    {formatCurrency(totalExpenses)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {filteredCashFlows.filter(c => c.type === 'out').length} transactions
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Net Cash Flow</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-semibold ${
                    netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(netProfit)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {filteredCashFlows.length} total transactions
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Cash Flow Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 uppercase">Date</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 uppercase">Description</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 uppercase">Category</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-gray-600 uppercase">Inflow</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-gray-600 uppercase">Outflow</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCashFlows.map((cashFlow) => (
                        <tr key={cashFlow.id} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {format(cashFlow.date, 'dd MMM yyyy')}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">{cashFlow.description}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{cashFlow.category}</td>
                          <td className="py-3 px-4 text-sm text-right text-green-600 font-medium">
                            {cashFlow.type === 'in' ? formatCurrency(cashFlow.amount) : '-'}
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-red-600 font-medium">
                            {cashFlow.type === 'out' ? formatCurrency(cashFlow.amount) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Category Analysis */}
          <TabsContent value="category-analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Income by Category */}
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Income by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  {incomeCategoryData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={incomeCategoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {incomeCategoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `${value.toFixed(2)}M IDR`} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-4 space-y-2">
                        {incomeCategoryData.map((item, index) => (
                          <div key={item.name} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="text-gray-700">{item.name}</span>
                            </div>
                            <span className="font-medium text-gray-900">{formatCurrency(item.fullValue)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-500 py-12">No income data</div>
                  )}
                </CardContent>
              </Card>

              {/* Expenses by Category */}
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Expenses by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  {expenseCategoryData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={expenseCategoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {expenseCategoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `${value.toFixed(2)}M IDR`} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-4 space-y-2">
                        {expenseCategoryData.map((item, index) => (
                          <div key={item.name} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="text-gray-700">{item.name}</span>
                            </div>
                            <span className="font-medium text-gray-900">{formatCurrency(item.fullValue)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-500 py-12">No expense data</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Category Comparison Bar Chart */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Category Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[...incomeCategoryData, ...expenseCategoryData]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} stroke="#d1d5db" />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      stroke="#d1d5db"
                      label={{ value: 'Million IDR', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6b7280' } }}
                    />
                    <Tooltip formatter={(value: number) => `${value.toFixed(2)}M IDR`} />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}