import { Link, useLocation, Outlet } from 'react-router';
import { LayoutDashboard, Receipt, FileText, Settings, User, LogOut, ShoppingCart, DollarSign, Package, BookOpen, Menu, X } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import binusLogo from '../../assets/8173a8b35e04c160c3cfab52b933df6cc8f70415.png';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userSettings } = useFinance();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/input-pembelian', label: 'Input Pembelian', icon: ShoppingCart },
    { path: '/input-penjualan', label: 'Input Penjualan', icon: DollarSign },
    { path: '/input-kas', label: 'Input Kas', icon: Receipt },
    { path: '/input-inventory', label: 'Input Inventory', icon: Package },
    { path: '/reports', label: 'Reports', icon: FileText },
    { path: '/panduan', label: 'Panduan', icon: BookOpen },
  ];

  const getPageTitle = () => {
    const currentPath = location.pathname;
    const menuItem = menuItems.find(item => item.path === currentPath);
    if (menuItem) return menuItem.label;
    
    // Handle Settings page (not in menuItems but still accessible)
    if (currentPath === '/settings') return 'Settings';
    
    return 'Dashboard';
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative lg:translate-x-0
        w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col z-50
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo/Brand */}
        <div className="h-16 flex items-center justify-between pl-4 pr-3 border-b border-sidebar-border">
          <img 
            src={binusLogo}
            alt="BINUS University"
            className="h-14 w-auto object-contain"
          />
          {/* Close button for mobile */}
          <button
            onClick={closeMobileMenu}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-sidebar-accent/50 transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all duration-200 ${
                  active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            {/* Hamburger Menu Button for Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
            >
              <Menu className="w-6 h-6 text-foreground" />
            </button>
            <h2 className="text-lg lg:text-xl font-semibold text-foreground">{getPageTitle()}</h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Profile Avatar with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-md hover:shadow-lg transition-shadow">
                  <User className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  );
}