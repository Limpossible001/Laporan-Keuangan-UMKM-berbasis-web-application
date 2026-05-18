import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { BarChart3, TrendingUp, FolderOpen, Zap, ArrowRight, CheckCircle2, Star } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">UMKM Finance</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              How It Works
            </a>
            <Link to="/login">
              <Button variant="ghost" className="text-sm font-medium">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-blue-600 hover:bg-blue-700 text-sm font-medium">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div>
              <h1 className="text-5xl font-bold text-white leading-tight mb-6">
                Smart Financial Management for UMKM
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Manage transactions, track profit, and grow your business with confidence. 
                Built specifically for Indonesian small and medium enterprises.
              </p>
              <div className="flex gap-4">
                <Link to="/register">
                  <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100 text-base font-semibold px-8">
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-base font-semibold px-8">
                    View Demo
                  </Button>
                </Link>
              </div>
              
              {/* Stats */}
              <div className="flex gap-8 mt-12 pt-8 border-t border-white/20">
                <div>
                  <div className="text-3xl font-bold text-white">1000+</div>
                  <div className="text-sm text-blue-200 mt-1">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">50K+</div>
                  <div className="text-sm text-blue-200 mt-1">Transactions</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">99%</div>
                  <div className="text-sm text-blue-200 mt-1">Satisfaction</div>
                </div>
              </div>
            </div>

            {/* Right: Illustration */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="bg-white rounded-xl shadow-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-semibold text-gray-900">Dashboard Overview</h3>
                    <div className="flex gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                  </div>
                  
                  {/* Mock dashboard preview */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-xs text-green-700 mb-1">Total Income</div>
                      <div className="text-lg font-bold text-green-900">Rp 45.5M</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="text-xs text-blue-700 mb-1">Net Profit</div>
                      <div className="text-lg font-bold text-blue-900">Rp 12.3M</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gray-200"></div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                        <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                      </div>
                      <div className="h-4 bg-green-100 rounded w-16"></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gray-200"></div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded w-2/3 mb-1"></div>
                        <div className="h-2 bg-gray-100 rounded w-1/3"></div>
                      </div>
                      <div className="h-4 bg-red-100 rounded w-16"></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gray-200"></div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded w-3/5 mb-1"></div>
                        <div className="h-2 bg-gray-100 rounded w-2/5"></div>
                      </div>
                      <div className="h-4 bg-green-100 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your Business
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional financial tools designed for UMKM owners who want to grow their business
            </p>
          </div>

          <div className="grid grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Track Income & Expenses
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Record every transaction easily. Know exactly where your money comes from and goes to.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Real-time Financial Reports
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Generate profit & loss statements, cash flow reports instantly. Make data-driven decisions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <FolderOpen className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Smart Categorization
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Organize transactions with categories. Get insights on spending patterns automatically.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Simple & Easy to Use
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                No accounting background needed. Clean interface designed for non-accountants.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-3 gap-12 items-start relative">
            {/* Connector lines */}
            <div className="absolute top-12 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200"></div>

            {/* Step 1 */}
            <div className="text-center relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Add Transactions
              </h3>
              <p className="text-gray-600">
                Record your income and expenses with just a few clicks. Quick and simple.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Categorize Automatically
              </h3>
              <p className="text-gray-600">
                Organize transactions by category for better insights into your spending.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                View Reports
              </h3>
              <p className="text-gray-600">
                Access comprehensive financial reports and understand your business performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl p-12 shadow-sm">
            <div className="flex gap-1 mb-6 justify-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <blockquote className="text-center">
              <p className="text-2xl text-gray-900 mb-6 leading-relaxed">
                "This app helps me manage my business easily. I can track all my expenses and income in one place. 
                The reports are clear and easy to understand."
              </p>
              <footer className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Siti Nurhaliza</div>
                  <div className="text-sm text-gray-600">Owner, Warung Siti UMKM</div>
                </div>
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Start Managing Your Business Today
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of UMKM owners who trust us with their financial management
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100 text-lg font-semibold px-12 py-6">
              Get Started for Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-6 h-6 text-blue-500" />
                <span className="text-lg font-bold text-white">UMKM Finance</span>
              </div>
              <p className="text-sm">
                Professional financial management for Indonesian small and medium enterprises.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white">How It Works</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center text-sm">
            <p>&copy; 2026 UMKM Finance. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
