import { institutionAdminLogin } from '@/api/institutionAdmin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/admin/useAuth'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Building, Eye, EyeOff, Loader2, Check, HomeIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/_auth/institution/institutionLogin')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Basic validation
    if (!email || !password) {
      toast.error("Validation Error", {
        description: "Please enter both email and password."
      });
      return;
    }
    setIsLoading(true);
    try {
      const user = await institutionAdminLogin(email, password);
      if (user) {
        authLogin(user);
        toast.success("Login Successful", {
          description: "You have been successfully logged in. Redirecting to dashboard..."
        });
        navigate({ to: '/institution/dashboard' });
      } else {
        toast.error("Login Failed", {
          description: "Invalid credentials. Please check your Institution ID and password."
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login Failed", {
        description: "An error occurred during login. Please try again later."
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="flex min-h-screen w-full bg-gray-100">
        <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto bg-white shadow-lg">
          {/* Left side - Image and Info */}
          <div className="hidden md:flex md:w-1/2 lg:w-2/3 items-center justify-center p-8 bg-gray-50">
            <div className="max-w-md">
              <div className="mb-4 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gray-900 rounded-full">
                    <Link to='/'>
                      <img src='/logo-light.svg' alt='Logo' className="h-10 w-10 text-white" />
                    </Link>
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Welcome to UniForm</h2>
                <p className="mt-2 text-gray-600">Institution Portal</p>
              </div>
              <div className="mt-8 text-center">
                <p className="text-gray-600">Manage admission applications, review candidates, and streamline your admission process.</p>
              </div>
            </div>
          </div>
          {/* Right side - Login Form */}
          <div className="w-full md:w-1/2 lg:w-2/5 p-8 md:p-12 flex flex-col justify-center">
            {/* Mobile header with icon - only visible on small screens */}
            <div className="flex md:hidden flex-col items-center mb-8">
              <div className="p-3 bg-gray-900 rounded-full mb-4">
                <Link to='/'>
                  <img src='/logo-light.svg' alt='Logo' className="h-10 w-10 text-white" />
                </Link>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 text-center">Welcome to UniForm</h2>
              <p className="text-gray-600 text-center">Institution Portal</p>
            </div>
            <div className="mb-10">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Institution Login</h1>
              <p className="text-gray-600">Access your institution admission portal</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email
                </Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="username@domain.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    Password
                  </Label>
                  <a href="#" className="text-sm text-gray-700 hover:text-gray-900 transition">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center">
                <div className="relative flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="sr-only"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                  />
                  <div
                    className={`w-5 h-5 flex items-center justify-center border rounded cursor-pointer transition-colors ${rememberMe
                      ? 'bg-gray-900 border-gray-900'
                      : 'border-gray-300 hover:border-gray-400'
                      }`}
                    onClick={() => !isLoading && setRememberMe(!rememberMe)}
                  >
                    {rememberMe && <Check className="h-4 w-4 text-white" />}
                  </div>
                </div>
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer" onClick={() => !isLoading && setRememberMe(!rememberMe)}>
                  Remember me
                </label>
              </div>
              <Button
                type="submit"
                className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition duration-300 flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <Building className="h-5 w-5" />
                    Institution Login
                  </>
                )}
              </Button>
            </form>
            <Link
              to='/'
              className="flex items-center justify-center gap-1 mt-4 font-medium text-sm text-center text-gray-900 hover:text-gray-600 transition"
            >
              <HomeIcon className='size-4' />
              Go Home
            </Link>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-center text-gray-500">
                UniForm - A Web Engineering Lab Project for Bangladesh University Admissions
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
