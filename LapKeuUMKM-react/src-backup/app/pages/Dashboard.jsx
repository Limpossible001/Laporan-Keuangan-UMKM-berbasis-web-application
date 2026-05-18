import { useFinance } from '../contexts/FinanceContext';
import { ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { format, subDays, startOfMonth } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export function Dashboard() {
  const { sales, purchases, cashFlows, getTotalIncome, getTotalExpenses, getNetProfit, getCurrentBalance } = useFinance();

  const monthStart = startOfMonth(new Date());
  const totalIncome = getTotalIncome(monthStart);
  const totalExpenses = getTotalExpenses(monthStart);
  const netProfit = getNetProfit(monthStart);
  const currentBalance = getCurrentBalance();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Prepare cash flow chart data from Input Kas (last 7 days)
  const cashFlowData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayCashFlows = cashFlows.filter(
      c => format(c.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    
    const income = dayCashFlows
      .filter(c => c.type === 'in')
      .reduce((sum, c) => sum + c.amount, 0);
    
    const expense = dayCashFlows
      .filter(c => c.type === 'out')
      .reduce((sum, c) => sum + c.amount, 0);

    return {
      name: format(date, 'dd MMM'),
      income: income / 1000000,
      expense: expense / 1000000,
    };
  });

  // Prepare income vs expense data from Sales vs Purchases (last 7 days)
  const incomeExpenseData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    
    const salesTotal = sales
      .filter(s => format(s.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
      .reduce((sum, s) => sum + s.totalRevenue, 0);
    
    const purchasesTotal = purchases
      .filter(p => format(p.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
      .reduce((sum, p) => sum + p.totalAmount, 0);

    return {
      name: format(date, 'dd MMM'),
      income: salesTotal / 1000000,
      expense: purchasesTotal / 1000000,
    };
  });

  // Recent transactions - combine sales, purchases, and cash flows
  const recentTransactions = [
    ...sales.map(s => ({
      id: s.id,
      date: s.date,
      name: `Sale: ${s.productName}`,
      category: 'Sales',
      type: 'income' as const,
      amount: s.totalRevenue,
    })),
    ...purchases.map(p => ({
      id: p.id,
      date: p.date,
      name: `Purchase: ${p.itemName} from ${p.supplierName}`,
      category: 'Purchases',
      type: 'expense' as const,
      amount: p.totalAmount,
    })),
    ...cashFlows.map(c => ({
      id: c.id,
      date: c.date,
      name: c.description,
      category: c.category,
      type: c.type === 'in' ? 'income' as const : 'expense' as const,
      amount: c.amount,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10);

  // Calculate trend percentages (mock data for demo)
  const incomeTrend = 12.5;
  const expenseTrend = -8.3;
  const profitTrend = netProfit >= 0 ? 18.2 : -15.4;

  return (
    <>
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Total Income Card */}
          <Card className="border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Total Income
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-xl lg:text-2xl font-bold text-foreground">
                {formatCurrency(totalIncome)}
              </div>
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-green-600 font-medium">+{incomeTrend}%</span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Total Expenses Card */}
          <Card className="border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Total Expenses
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-xl lg:text-2xl font-bold text-foreground">
                {formatCurrency(totalExpenses)}
              </div>
              <div className="flex items-center gap-1 text-xs">
                <TrendingDown className="w-3 h-3 text-green-600" />
                <span className="text-green-600 font-medium">{expenseTrend}%</span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Net Profit/Loss Card */}
          <Card className="border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Net Profit / Loss
              </CardTitle>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <TrendingUp className={`w-5 h-5 ${
                  netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className={`text-xl lg:text-2xl font-bold ${
                netProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(netProfit)}
              </div>
              <div className="flex items-center gap-1 text-xs">
                {netProfit >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-600" />
                )}
                <span className={`font-medium ${
                  netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {netProfit >= 0 ? '+' : ''}{profitTrend}%
                </span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Current Balance Card */}
          <Card className="border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-primary to-secondary text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-white/80 uppercase tracking-wide">
                Current Balance
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-xl lg:text-2xl font-bold text-white">
                {formatCurrency(currentBalance)}
              </div>
              <p className="text-xs text-white/70">All time balance</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Cash Flow Trend */}
          <Card className="border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-foreground">
                Cash Flow Trend
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Last 7 days performance</p>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={cashFlowData}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                    stroke="#E5E7EB"
                    axisLine={true}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                    stroke="#E5E7EB"
                    axisLine={true}
                    tickLine={false}
                    label={{ value: 'Million IDR', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#6B7280' } }}
                  />
                  <Tooltip 
                    formatter={(value: number) => `${value.toFixed(2)}M`}
                    contentStyle={{ 
                      borderRadius: 12, 
                      border: '1px solid #F1F1F1',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: 12 }}
                    iconType="circle"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#22C55E" 
                    strokeWidth={3}
                    name="Income"
                    dot={{ fill: '#22C55E', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expense" 
                    stroke="#EF4444" 
                    strokeWidth={3}
                    name="Expense"
                    dot={{ fill: '#EF4444', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Income vs Expense */}
          <Card className="border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-foreground">
                Income vs Expense
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Last 7 days comparison</p>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={incomeExpenseData} barGap={8}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                    stroke="#E5E7EB"
                    axisLine={true}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                    stroke="#E5E7EB"
                    axisLine={true}
                    tickLine={false}
                    label={{ value: 'Million IDR', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#6B7280' } }}
                  />
                  <Tooltip 
                    formatter={(value: number) => `${value.toFixed(2)}M`}
                    contentStyle={{ 
                      borderRadius: 12, 
                      border: '1px solid #F1F1F1',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}
                    cursor={{ fill: 'rgba(91, 62, 255, 0.05)' }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: 12 }}
                    iconType="circle"
                  />
                  <Bar 
                    dataKey="income" 
                    fill="#22C55E" 
                    name="Income" 
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar 
                    dataKey="expense" 
                    fill="#EF4444" 
                    name="Expense" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-foreground">
              Recent Transactions
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Your latest financial activities</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Transaction</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                      <td className="py-3.5 px-4 text-sm text-muted-foreground">
                        {format(transaction.date, 'dd MMM yyyy')}
                      </td>
                      <td className="py-3.5 px-4 text-sm font-medium text-foreground">
                        {transaction.name}
                      </td>
                      <td className="py-3.5 px-4 text-sm text-muted-foreground">
                        {transaction.category}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                          transaction.type === 'income'
                            ? 'bg-green-50 text-green-700 border border-green-100'
                            : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                          {transaction.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 text-sm text-right font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}