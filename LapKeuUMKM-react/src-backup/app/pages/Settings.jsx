import { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { User, Save } from 'lucide-react';
import { toast } from 'sonner';

export function Settings() {
  const { userSettings, updateUserSettings } = useFinance();
  const [formData, setFormData] = useState({
    userName: userSettings.userName,
    businessName: userSettings.businessName,
    email: userSettings.email,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserSettings(formData);
    toast.success('Settings updated successfully');
  };

  const handleReset = () => {
    setFormData({
      userName: userSettings.userName,
      businessName: userSettings.businessName,
      email: userSettings.email,
    });
  };

  return (
    <>
      {/* Top Bar */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8">
        <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-2xl">
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Profile Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    <User className="w-10 h-10" />
                  </div>
                  <div>
                    <Button type="button" variant="outline" size="sm">
                      Change Photo
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max 2MB</p>
                  </div>
                </div>

                {/* User Name */}
                <div className="space-y-2">
                  <Label htmlFor="userName">Full Name *</Label>
                  <Input
                    id="userName"
                    placeholder="Enter your full name"
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    required
                  />
                </div>

                {/* Business Name */}
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    placeholder="Enter your business name"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={handleReset}>
                    Reset
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Additional Settings Cards */}
          <div className="mt-6 space-y-6">
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-base font-semibold">System Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Version</span>
                    <span className="font-medium text-gray-900">1.0.0</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Total Transactions</span>
                    <span className="font-medium text-gray-900">
                      {/* This would come from context */}
                      8 transactions
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Total Categories</span>
                    <span className="font-medium text-gray-900">
                      10 categories
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="font-medium text-gray-900">Today</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-base font-semibold">About UMKM Finance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 leading-relaxed">
                  UMKM Finance is a professional financial management system designed specifically for 
                  small and medium enterprises. It helps you track income, expenses, and generate 
                  financial reports to better understand your business performance.
                </p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Inspired by MYOB, adapted for Indonesian UMKM businesses.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}