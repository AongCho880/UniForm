// uniform-frontend/src/components/admin/Header.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Menu,
  LogOut,
  Settings,
  User,
  Bell,
  ShieldUser
} from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/api/admin/adminApi';
import type { SystemAdmin } from '@/types/admin';
import { useAuth } from '@/context/admin/useAuth';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminProfile, setAdminProfile] = useState<SystemAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminProfile();
  }, []);
  const fetchAdminProfile = async () => {
    try {
      const profile = await adminApi.getProfile();
      setAdminProfile(profile);
    } catch (error) {
      toast.error('Failed to load admin profile');
      console.error('Error fetching admin profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged Out", {
      description: "You have been successfully logged out."
    });
    window.location.href = "/admin/adminLogin";
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'institutions', label: 'Institutions' },
    { id: 'admins', label: 'Admins' },
    { id: 'notices', label: 'Notices' },
    { id: 'visualization', label: 'Data Visualization' },
  ];
  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    // Also navigate to the corresponding route
    switch (tab) {
      case 'notifications':
        navigate({ to: '/admin/notifications' });
        break;
      case 'dashboard':
        navigate({ to: '/admin/dashboard' });
        break;
      case 'institutions':
        navigate({ to: '/admin/institutions' });
        break;
      case 'admins':
        navigate({ to: '/admin/admins' });
        break;
      case 'notices':
        navigate({ to: '/admin/notices' });
        break;
      case 'visualization':
        navigate({ to: '/admin/visualization' });
        break;
      case 'profile':
        navigate({ to: '/admin/profile' });
        break;
      case 'settings':
        navigate({ to: '/admin/settings' });
        break;
    }
    setIsMobileMenuOpen(false);
  };

  const formatLastLogin = () => {
    if (!adminProfile || !adminProfile.lastLogin) return ''
    try {
      const d = new Date(adminProfile.lastLogin)
      return d.toLocaleString()
    } catch {
      return ''
    }
  };

  const getInitials = (email: string) => {
    if (!email) return '';
    return email.charAt(0).toUpperCase();
  };

  return (
    <>
      <header className="bg-white shadow-sm mb-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="h-9 w-9 rounded-md flex items-center justify-center">
                  <ShieldUser className="h-8 w-8 text-black" />
                </div>
                <span className="text-xl font-bold text-gray-900">Uniform Admin</span>
              </div>
              {/* Desktop Navigation */}
              <nav className="ml-6 space-x-6 hidden md:flex">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${activeTab === item.id
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
            <div className="flex items-center">
              {/* Desktop User Account Menu */}
              <div className="hidden md:flex items-center">
                <Button variant="ghost" size="sm" className="mr-2" onClick={() => handleTabChange('notifications')}>
                  <Bell className="h-5 w-5" />
                  <Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">3</Badge>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="relative h-10 w-10 rounded-full">
                      <div className="h-9 w-9 rounded-full bg-gray-300 flex items-center justify-center">
                        {loading ? (
                          <span className="text-xs">...</span>
                        ) : (
                          <span className="h-9 w-9 flex items-center justify-center rounded-full text-gray-600 font-medium text-sm">
                            {adminProfile ? getInitials(adminProfile.email) : 'A'}
                          </span>
                        )}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {loading ? 'Loading...' : adminProfile?.email || 'System Admin'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {formatLastLogin()}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleTabChange('profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTabChange('settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsLogoutDialogOpen(true)}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {/* Mobile menu button */}
              <div className="md:hidden">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                    <div className="flex flex-col h-full p-4">
                      {/* Mobile User Account Section */}
                      <div className="pt-4 border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              {loading ? (
                                <span className="text-xs">...</span>
                              ) : (
                                <span className="text-gray-600 font-medium text-sm">
                                  {adminProfile ? getInitials(adminProfile.email) : 'A'}
                                </span>
                              )}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {loading ? 'Loading...' : adminProfile?.email || 'System Admin'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatLastLogin()}
                              </p>
                            </div>
                          </div>
                        </div>
                        {/* Mobile Navigation */}
                        <nav className="flex-1 mb-4 border-b-1">
                          <div className="space-y-1">
                            {navigationItems.map((item) => (
                              <button
                                key={item.id}
                                onClick={() => handleTabChange(item.id)}
                                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === item.id
                                  ? 'bg-gray-100 text-gray-900'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                  }`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </nav>
                        <div className="flex items-center justify-between mb-4">
                          <Button variant="ghost" size="sm" className="justify-start" onClick={() => handleTabChange('notifications')}>
                            <Bell className="mr-2 h-4 w-4" />
                            Notifications
                            <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">3</Badge>
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md" onClick={() => handleTabChange('profile')}>
                            <User className="mr-3 h-5 w-5" />
                            Profile
                          </button>
                          <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md" onClick={() => handleTabChange('settings')}>
                            <Settings className="mr-3 h-5 w-5" />
                            Settings
                          </button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-800 hover:bg-gray-100"
                      onClick={() => setIsLogoutDialogOpen(true)}
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      Log out
                    </Button>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out? You will need to sign in again to access the admin dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="text-gray-800 border-gray-300 hover:bg-gray-100" onClick={() => setIsLogoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-black text-white hover:bg-black/90" onClick={handleLogout}>
              Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
