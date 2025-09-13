import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getInstitutionAdminProfile, updateInstitutionAdminEmail, updateInstitutionAdminPassword } from '@/api/institutionAdmin'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/admin/useAuth'
// Layout and protection are provided by parent /institution route

export const Route = createFileRoute('/institution/settings')({
  component: () => <RouteComponent />,
})

function RouteComponent() {
  const [email, setEmail] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingEmail, setSavingEmail] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { user, login } = useAuth()

  useEffect(() => {
    (async () => {
      try {
        const p = await getInstitutionAdminProfile()
        setEmail(p.email)
        // Short name is managed by System Admin during institution create/update
      } catch (e) {
        void e;
      }
    })()
  }, [])

  return (
    <div className="max-w-3xl mx-auto py-0 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="grid gap-6">
        {/* Institution short name editing removed: managed by System Admin */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Account Email</h2>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input id="email" className="col-span-3" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={async () => {
                try {
                  setSavingEmail(true)
                  const updated = await updateInstitutionAdminEmail(email)
                  if (user) login({ ...user, email: updated.email })
                  toast.success('Email updated')
                } catch (e: unknown) {
                  const err = e as { response?: { data?: { message?: string } } }
                  const msg = err?.response?.data?.message || 'Failed to update email'
                  toast.error(msg)
                } finally { setSavingEmail(false) }
              }}
              disabled={savingEmail || !email.trim()}
            >{savingEmail ? 'Saving...' : 'Save Email'}</Button>
          </div>
        </section>
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Change Password</h2>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="oldPassword" className="text-right">Current Password</Label>
            <div className="col-span-3 relative">
              <Input
                id="oldPassword"
                type={showOldPassword ? 'text' : 'password'}
                className="pr-10"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                disabled={savingPassword}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                onClick={() => setShowOldPassword((v) => !v)}
                aria-label={showOldPassword ? 'Hide current password' : 'Show current password'}
                disabled={savingPassword}
              >
                {showOldPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="newPassword" className="text-right">New Password</Label>
            <div className="col-span-3 relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                className="pr-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={savingPassword}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                onClick={() => setShowNewPassword((v) => !v)}
                aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                disabled={savingPassword}
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="confirmPassword" className="text-right">Confirm New Password</Label>
            <div className="col-span-3 relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className="pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={savingPassword}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                disabled={savingPassword}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={async () => {
                if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
                  toast.error('Please fill all fields');
                  return;
                }
                if (newPassword !== confirmPassword) {
                  toast.error('Passwords do not match');
                  return;
                }
                try {
                  setSavingPassword(true)
                  const res = await updateInstitutionAdminPassword(oldPassword, newPassword)
                  if (res?.status === 200) {
                    setOldPassword(''); setNewPassword(''); setConfirmPassword('')
                    toast.success('Password updated')
                  } else {
                    toast.error(res?.message || 'Failed to update password')
                  }
                } catch (e: unknown) {
                  const err = e as { response?: { data?: { message?: string } } }
                  const msg = err?.response?.data?.message || 'Failed to update password'
                  toast.error(msg)
                } finally { setSavingPassword(false) }
              }}
              disabled={savingPassword}
            >{savingPassword ? (
              <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Updating...</span>
            ) : 'Update Password'}</Button>
          </div>
        </section>
      </div>
    </div>
  )
}
