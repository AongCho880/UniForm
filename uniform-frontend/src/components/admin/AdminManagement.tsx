// uniform-frontend/src/components/admin/AdminManagement.tsx

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { adminApi } from '@/api/admin/adminApi';
import type { Institution, Admin } from '@/types/admin';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Plus,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';

export function AdminManagement() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  // Create admin form state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    password: '',
    institutionId: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isDeleteAdminDialogOpen, setIsDeleteAdminDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);

  useEffect(() => {
    fetchInstitutions();
    void (async () => {
      try {
        setLoadingAdmins(true);
        const response = await adminApi.getAdmins();
        setAdmins((response as any).admins || []);
      } catch (error) {
        toast.error('Failed to load admins');
        console.error('Error fetching admins:', error);
      } finally {
        setLoadingAdmins(false);
      }
    })();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const response = await adminApi.getInstitutions(); // Get all institutions for the dropdown
      setInstitutions(response.institutions);
    } catch (error) {
      toast.error('Failed to load institutions');
      console.error('Error fetching institutions:', error);
    } finally {
      // no-op
    }
  };

  const handleCreateAdmin = async () => {
    if (!newAdmin.email.trim() || !newAdmin.password.trim()) {
      toast.error('Email and password are required');
      return;
    }
    if (newAdmin.password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    try {
      setIsSubmitting(true);
      await adminApi.createAdmin({
        email: newAdmin.email,
        password: newAdmin.password,
        password_confirmation: confirmPassword,
        institutionId: newAdmin.institutionId || undefined,
      });

      toast.success('Admin created successfully');
      setIsCreateDialogOpen(false);
      setNewAdmin({
        email: '',
        password: '',
        institutionId: ''
      });
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setPasswordError('');
      // Refresh admin list
      try {
        setLoadingAdmins(true);
        const response = await adminApi.getAdmins();
        setAdmins((response as any).admins || []);
      } catch (e) {
        console.error('Failed to refresh admins', e);
      } finally {
        setLoadingAdmins(false);
      }
    } catch (error) {
      toast.error('Failed to create admin');
      console.error('Error creating admin:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Admin Management</h1>
          <p className="text-gray-500">Manage institution administrators</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Institution Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>Create New Admin</DialogTitle>
              <DialogDescription>
                Add a new institution administrator to the system.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <div className="col-span-3 relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="confirmPassword" className="text-right">
                  Confirm Password
                </Label>
                <div className="col-span-3 relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      const v = e.target.value;
                      setConfirmPassword(v);
                      setPasswordError(v && newAdmin.password !== v ? 'Passwords do not match' : '');
                    }}
                    aria-invalid={passwordError ? true : false}
                    className={`pr-10 ${passwordError ? 'border-gray-500 focus:ring-gray-500 focus:border-gray-500' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  {passwordError && (
                    <p className="mt-1 text-sm text-gray-700">{passwordError}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="institution" className="text-right">
                  Institution
                </Label>
                <Select
                  value={newAdmin.institutionId}
                  onValueChange={(value) => setNewAdmin({ ...newAdmin, institutionId: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select an institution" />
                  </SelectTrigger>
                  <SelectContent>
                    {institutions.map((institution) => (
                      <SelectItem key={institution.institutionId} value={institution.institutionId}>
                        {institution.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAdmin} disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Institution Admins</CardTitle>
          <CardDescription>View and manage all institution administrators</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingAdmins ? (
            <div className="flex justify-center items-center h-24">Loading admins...</div>
          ) : admins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No admins found</h3>
              <p className="text-gray-500">Create the first institution admin to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((a) => (
                  <TableRow key={a.adminId}>
                    <TableCell>{a.email}</TableCell>
                    <TableCell>{a.institution?.name ?? '—'}</TableCell>
                    <TableCell>{format(new Date(a.createdAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {a.institutionId ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                await adminApi.unassignAdmin(a.adminId);
                                toast.success('Unassigned admin from institution');
                                setAdmins((prev) => prev.map((x) => x.adminId === a.adminId ? { ...x, institutionId: undefined, institution: undefined } : x));
                              } catch (e) {
                                toast.error('Failed to unassign admin');
                              }
                            }}
                          >
                            Unassign
                          </Button>
                        ) : null}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => { setAdminToDelete(a); setIsDeleteAdminDialogOpen(true); }}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Admin Confirmation Dialog */}
      <Dialog open={isDeleteAdminDialogOpen} onOpenChange={setIsDeleteAdminDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Institution Admin</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the admin account.
            </DialogDescription>
          </DialogHeader>
          {adminToDelete && (
            <div className="py-4">
              <div className="mb-2">
                <p className="text-sm"><span className="font-medium">Email:</span> {adminToDelete.email}</p>
                <p className="text-sm"><span className="font-medium">Institution:</span> {adminToDelete.institution?.name ?? '—'}</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDeleteAdminDialogOpen(false)}>Cancel</Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (!adminToDelete) return;
                    try {
                      await adminApi.deleteAdmin(adminToDelete.adminId);
                      toast.success('Admin deleted');
                      setAdmins((prev) => prev.filter((x) => x.adminId !== adminToDelete.adminId));
                      setIsDeleteAdminDialogOpen(false);
                      setAdminToDelete(null);
                    } catch (e) {
                      toast.error('Failed to delete admin');
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
