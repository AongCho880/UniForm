// uniform-frontend/src/components/student/StudentSettings.tsx
import { useNavigate } from '@tanstack/react-router';
import { Toaster } from 'sonner';
import { useAuth } from '@/context/student/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Shield,
  Bell,
  AlertTriangle
} from 'lucide-react';
import type { UserData } from '@/components/student/types';
import AccountSettingsTab from './tabs/AccountSettingsTab';
import SecuritySettingsTab from './tabs/SecuritySettingsTab';
import NotificationsSettingsTab from './tabs/NotificationsSettingsTab';
import DangerZoneTab from './tabs/DangerZoneTab';

interface StudentSettingsProps {
  userData: UserData;
}

export default function StudentSettings({ userData }: StudentSettingsProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full h-fit grid-cols-2 sm:grid-cols-4 mb-2 gap-2">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Account</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="danger" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Danger Zone</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <AccountSettingsTab userData={userData} />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettingsTab userData={userData} />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsSettingsTab />
        </TabsContent>

        <TabsContent value="danger">
          <DangerZoneTab
            userData={userData}
            onLogout={logout}
            navigate={navigate}
          />
        </TabsContent>
      </Tabs>

      <Toaster />
    </div>
  );
}
