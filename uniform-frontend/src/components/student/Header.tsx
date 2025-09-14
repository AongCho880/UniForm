// uniform-frontend/src/components/student/Header.tsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useAuth } from '@/context/student/useAuth';
import {
  GraduationCap,
  User,
  Building,
  BookOpen,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Settings,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { UserData } from '@/components/student/types';

interface HeaderProps {
  userData: UserData;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export default function Header({ userData, activeSection, setActiveSection }: HeaderProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);

  const handleLogout = () => {
    logout();
    toast.success("Logged Out", {
      description: "You have been successfully logged out."
    });
    navigate({ to: "/student/studentLogin" });
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Mobile menu
      const menu = document.getElementById('mobile-menu');
      const menuButton = document.getElementById('mobile-menu-button');
      if (
        mobileMenuOpen &&
        menu &&
        !menu.contains(event.target as Node) &&
        menuButton &&
        !menuButton.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
      // User menu
      if (
        userMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen, userMenuOpen]);

  return (
    <header className="bg-white shadow relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="p-2 bg-gray-900 rounded-full">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="ml-3 text-xl sm:text-2xl font-bold text-gray-900">Student Dashboard</h1>
          </div>
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex space-x-4">
              <Button
                variant={"link"}
                onClick={() => setActiveSection('dashboard')}
                className={`px-3 py-2 text-base font-medium ${activeSection === 'dashboard' ? 'text-black' : 'text-gray-600'}`}
              >
                Dashboard
              </Button>
              <Button
                variant={"link"}
                onClick={() => setActiveSection('universities')}
                className={`px-3 py-2 text-base font-medium ${activeSection === 'universities' ? 'text-black' : 'text-gray-600'}`}
              >
                Institution
              </Button>
              <Button
                variant={"link"}
                onClick={() => setActiveSection('academic-info')}
                className={`px-3 py-2 text-base font-medium ${activeSection === 'academic-info' ? 'text-black' : 'text-gray-600'}`}
              >
                Academic Info
              </Button>
              <Button
                variant={"link"}
                onClick={() => setActiveSection('applications')}
                className={`px-3 py-2 text-base font-medium ${activeSection === 'applications' ? 'text-black' : 'text-gray-600'}`}
              >
                Applications
              </Button>
              {/* Settings link removed from desktop navbar */}
            </nav>
            {/* Notifications icon (desktop) */}
            <Button
              variant="ghost"
              className="relative"
              onClick={() => setActiveSection('notifications')}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </Button>
            {/* User menu */}
            <div className="relative">
              <Button
                ref={userButtonRef}
                variant="ghost"
                className="flex items-center text-base space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <span>{userData.userName}</span>
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="font-medium text-gray-700">{userData.userName.charAt(0)}</span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
              {/* User dropdown menu */}
              {userMenuOpen && (
                <div
                  ref={userMenuRef}
                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu"
                >
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{userData.userName}</p>
                      <p className="text-sm text-gray-500 truncate">{userData.email}</p>
                    </div>
                    <div className="space-y-1">
                      <Button
                        variant="link"
                        onClick={() => {
                          setActiveSection('dashboard');
                          setUserMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-start px-4 py-3 text-base font-medium ${activeSection === 'dashboard' ? 'text-black' : 'text-gray-600'}`}
                      >
                        <User className="mr-3 h-5 w-5" />
                        Dashboard
                      </Button>
                      <Button
                        variant="link"
                        onClick={() => {
                          setActiveSection('universities');
                          setUserMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-start px-4 py-3 text-base font-medium ${activeSection === 'universities' ? 'text-black' : 'text-gray-600'}`}
                      >
                        <Building className="mr-3 h-5 w-5" />
                        Universities
                      </Button>
                      <Button
                        variant="link"
                        onClick={() => {
                          setActiveSection('academic-info');
                          setUserMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-start px-4 py-3 text-base font-medium ${activeSection === 'academic-info' ? 'text-black' : 'text-gray-600'}`}
                      >
                        <BookOpen className="mr-3 h-5 w-5" />
                        Academic Info
                      </Button>
                      <Button
                        variant="link"
                        onClick={() => {
                          setActiveSection('notifications');
                          setUserMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-start px-4 py-3 text-base font-medium ${activeSection === 'notifications' ? 'text-black' : 'text-gray-600'}`}
                      >
                        <Bell className="mr-3 h-5 w-5" />
                        Notifications
                      </Button>
                      {/* Settings dropdown option */}
                      <Button
                        variant="link"
                        onClick={() => {
                          setActiveSection('settings');
                          setUserMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-start px-4 py-3 text-base font-medium ${activeSection === 'settings' ? 'text-black' : 'text-gray-600'}`}
                      >
                        <Settings className="mr-3 h-5 w-5" />
                        Settings
                      </Button>
                    </div>
                    <div className="border-t border-gray-100 my-1"></div>
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full justify-start text-gray-800 hover:bg-gray-100"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              id="mobile-menu-button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-900"
            >
              {mobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">Menu</h2>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-900"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="pt-5 pb-6 px-4 space-y-6">
          <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
            <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="font-medium text-gray-700">{userData.userName.charAt(0)}</span>
            </div>
            <div className="ml-4">
              <div className="text-base font-medium text-gray-800">{userData.userName}</div>
              <div className="text-sm font-medium text-gray-500">{userData.email}</div>
            </div>
          </div>
          <div className="space-y-1">
            <Button
              variant="link"
              onClick={() => {
                setActiveSection('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-start px-4 py-3 text-base font-medium ${activeSection === 'dashboard' ? 'text-black' : 'text-gray-600'}`}
            >
              <User className="mr-3 h-5 w-5" />
              Dashboard
            </Button>
            <Button
              variant="link"
              onClick={() => {
                setActiveSection('universities');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-start px-4 py-3 text-base font-medium ${activeSection === 'universities' ? 'text-black' : 'text-gray-600'}`}
            >
              <Building className="mr-3 h-5 w-5" />
              Institution
            </Button>
            <Button
              variant="link"
              onClick={() => {
                setActiveSection('academic-info');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-start px-4 py-3 text-base font-medium ${activeSection === 'academic-info' ? 'text-black' : 'text-gray-600'}`}
            >
              <BookOpen className="mr-3 h-5 w-5" />
              Academic Info
            </Button>
            <Button
              variant="link"
              onClick={() => {
                setActiveSection('notifications');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-start px-4 py-3 text-base font-medium ${activeSection === 'notifications' ? 'text-black' : 'text-gray-600'}`}
            >
              <Bell className="mr-3 h-5 w-5" />
              Notifications
            </Button>
            {/* Settings mobile menu option */}
            <Button
              variant="link"
              onClick={() => {
                setActiveSection('settings');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-start px-4 py-3 text-base font-medium ${activeSection === 'settings' ? 'text-black' : 'text-gray-600'}`}
            >
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </Button>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <Button
              onClick={handleLogout}
              className="w-full justify-start text-white bg-black hover:bg-black/90"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </div>
      {/* Overlay when mobile menu is open */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
    </header>
  );
}
