import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/context/admin/useAuth'
import { useEffect, useState } from 'react'
import { getInstitutionAdminProfile } from '@/api/institutionAdmin'
import { getMyInstitution } from '@/api/institutionAdmin'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Menu, User, Settings, LogOut, Mail, Clock, Building, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function InstitutionNavbar() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [lastLogin, setLastLogin] = useState<string | null>(null)
  const [openLogout, setOpenLogout] = useState(false)
  const [openSheet, setOpenSheet] = useState(false)
  const [institution, setInstitution] = useState<{ institutionId: string; name: string; shortName?: string | null; logoUrl?: string | null } | null>(null)

  const cleanupRadixArtifacts = () => {
    try {
      document.querySelectorAll('[aria-hidden="true"]').forEach((el) => el.removeAttribute('aria-hidden'))
      // Some environments may use inert
      document.querySelectorAll('[inert]').forEach((el) => el.removeAttribute('inert'))
      // Ensure body has pointer events enabled
      if (document.body && document.body.style.pointerEvents === 'none') {
        document.body.style.pointerEvents = ''
      }
    } catch { void 0 }
  }

  useEffect(() => {
    (async () => {
      try {
        const p = await getInstitutionAdminProfile()
        setLastLogin(p.lastLogin ?? null)
        try {
          const inst = await getMyInstitution()
          setInstitution(inst)
        } catch { void 0 }
      } catch { void 0 }
    })()
  }, [])

  const shortName = (() => {
    const s = institution?.shortName?.trim()
    if (s) return s
    const name = institution?.name?.trim()
    if (!name) return 'Institution'
    const paren = name.match(/\(([^)]+)\)/)
    if (paren?.[1]) return paren[1]
    const words = name.split(/\s+/).filter(Boolean)
    const initials = words.slice(0, 3).map(w => w[0]).join('').toUpperCase()
    return initials.length >= 2 ? initials : name
  })()

  return (
    <>
      <style>{`
        .inst-nav-link { position: relative; color: #4b5563; transition: color 0.2s ease; }
        .inst-nav-link:hover, .inst-nav-link.active { color: #000; }
        .inst-nav-link::after { content: ''; position: absolute; width: 0; height: 2px; bottom: -2px; left: 50%; background-color: #000; transition: width 0.2s ease, left 0.2s ease; }
        .inst-nav-link:hover::after, .inst-nav-link.active::after { width: 100%; left: 0; }
      `}</style>
      <header className="bg-white w-full shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 grid grid-cols-2 md:grid-cols-3 items-center">
          <div className="flex items-center w-full md:w-auto">
            {/* Brand: logo (left) + short name (center-left) on mobile */}
            <Link to="/institution/dashboard" className="flex items-center gap-2">
              <div className='w-12 h-12 flex items-center justify-center rounded-full p-1 shadow-sm'>
                <img
                  src={institution?.logoUrl || '/logo.svg'}
                  alt="Institution Logo"
                  className="h-8 w-8 object-cover"
                />
              </div>
              <span className="text-2xl font-bold text-gray-900 truncate max-w-[50vw]">
                {shortName}
              </span>
            </Link>
            {/* Mobile menu moved to right edge */}


            {/* Desktop nav moved to center */}
          </div>

          {/* Center: Desktop/Tablet nav */}
          <nav className="hidden md:flex justify-center items-center gap-4 text-sm">
            <Link to="/institution/dashboard" className={`inst-nav-link inline-flex items-center gap-1 ${location.pathname === '/institution/dashboard' ? 'active' : ''}`}>
              Dashboard
            </Link>
            <Link to="/institution/units" className={`inst-nav-link inline-flex items-center gap-1 ${location.pathname === '/institution/units' || location.pathname.startsWith('/institution/units/') ? 'active' : ''}`}>
              Units
            </Link>
            <Link to="/institution/applications" className={`inst-nav-link inline-flex items-center gap-1 ${location.pathname === '/institution/applications' || location.pathname.startsWith('/institution/applications/') ? 'active' : ''}`}>
              Applications
            </Link>
            <Link to="/institution/notices" className={`inst-nav-link inline-flex items-center gap-1 ${location.pathname === '/institution/notices' ? 'active' : ''}`}>
              Notices
            </Link>
          </nav>

          {/* User menu + Mobile trigger (right) */}
          <div className="flex items-center gap-3 justify-end justify-self-end">
            {/* Mobile menu trigger on the far right */}
            <Sheet open={openSheet} onOpenChange={setOpenSheet}>
              <SheetTrigger asChild>
                <button className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open navigation</span>
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[70%] p-0">
                <div className="h-14 px-4 border-b border-gray-200 flex items-center gap-2">
                  <img src={institution?.logoUrl || '/logo.svg'} alt="Logo" className="h-6 w-6 rounded-sm object-cover" />
                  <span className="text-xl font-bold text-gray-900">{shortName}</span>
                </div>
                <nav className="px-2 py-3 text-sm">
                  <button onClick={() => navigate({ to: '/institution/dashboard' })} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${location.pathname === '/institution/dashboard' ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
                    Dashboard
                  </button>
                  <button onClick={() => navigate({ to: '/institution/profile' })} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${location.pathname === '/institution/profile' ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <User className="h-4 w-4" />
                    Profile
                  </button>
                  <button onClick={() => navigate({ to: '/institution/units' })} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${(location.pathname === '/institution/units' || location.pathname.startsWith('/institution/units/')) ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
                    Units
                  </button>
                  <button onClick={() => navigate({ to: '/institution/applications' })} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${(location.pathname === '/institution/applications' || location.pathname.startsWith('/institution/applications/')) ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
                    Applications
                  </button>
                  <button onClick={() => navigate({ to: '/institution/notices' })} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${location.pathname === '/institution/notices' ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
                    Notices
                  </button>
                  <button onClick={() => navigate({ to: '/institution/notifications' })} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${location.pathname === '/institution/notifications' ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
                    Notifications
                  </button>
                  <button onClick={() => navigate({ to: '/institution/settings' })} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md ${location.pathname === '/institution/settings' ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                  <hr className="my-2 border-gray-200" />
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-800 hover:bg-gray-100"
                    onClick={() => { setOpenSheet(false); setTimeout(() => setOpenLogout(true), 100) }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
            {/* Notifications icon (desktop) */}
            <Link to="/institution/notifications" className="hidden md:inline-flex">
              <Button variant="ghost" className="h-9 w-9 p-0" aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden md:inline-flex items-center gap-2 rounded-full focus:outline-none">
                  <Avatar className="h-12 w-12 border-1 border-gray-300 shadow-sm p-1">
                    <AvatarImage src={institution?.logoUrl || '/logo.svg'} alt="Institution" />
                    <AvatarFallback className="bg-gray-200 text-gray-700 text-sm">
                      <Building className="h-5 w-5 text-gray-700" />
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 border border-gray-200">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-gray-900 text-xs truncate">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="truncate">{user?.email ?? 'Institution Admin'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Last login: {lastLogin ? new Date(lastLogin).toLocaleString() : '—'}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                {/* Stats moved to dashboard */}
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => navigate({ to: '/institution/settings' })} className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setTimeout(() => setOpenLogout(true), 0)
                  }}
                  className="flex items-center gap-2 text-red-600 focus:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Logout dialog */}
      <Dialog open={openLogout} onOpenChange={setOpenLogout}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log out?</DialogTitle>
            <DialogDescription>Are you sure you want to log out of your institution admin account?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="text-gray-800 border-gray-300 hover:bg-gray-100"
              onClick={() => setOpenLogout(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-black text-white hover:bg-black/90"
              onClick={() => {
                setOpenLogout(false)
                // Allow the dialog to close and Radix to cleanup focus/aria state before navigation
                setTimeout(() => {
                  cleanupRadixArtifacts()
                  logout()
                  navigate({ to: '/institution/institutionLogin', replace: true })
                  // Run cleanup again on next tick post-navigation
                  setTimeout(() => cleanupRadixArtifacts(), 0)
                }, 50)
              }}
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
