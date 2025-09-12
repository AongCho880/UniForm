// uniform-frontend/src/components/student/ProfileInfo.tsx
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Edit, Camera, Save, X, User, Mail, Phone, Calendar, MapPin, BookOpen, Globe, LogOut } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import type { UserData } from '@/components/student/types';
import { updateUserProfile } from '@/api';
import type { ProfileData } from '@/api/profile';
interface ProfileInfoProps {
  userData: UserData;
  onLogout: () => void;
  onUpdate?: (updatedData: Partial<UserData>) => Promise<void>;
}
// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
export default function ProfileInfo({ userData, onLogout, onUpdate }: ProfileInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null); // preview
  const [profileFile, setProfileFile] = useState<File | null>(null); // actual file to upload
  const [formData, setFormData] = useState<UserData>({ ...userData });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const handleEditClick = () => {
    setIsEditing(true);
  };
  const handleCancelClick = () => {
    setIsEditing(false);
    setFormData({ ...userData });
    setProfileImage(null);
    setProfileFile(null);
    setErrors({});
  };
  const toDateInputValue = (v: string) => {
    if (!v) return ''
    // If already yyyy-MM-dd, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v
    const d = new Date(v)
    if (isNaN(d.getTime())) return ''
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nextVal = name === 'dob' ? toDateInputValue(value) : value
    setFormData(prev => ({
      ...prev,
      [name]: nextVal
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user selects an option
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Basic client-side validation to match backend expectations
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }
    // 1MB guard to match backend validation
    const maxSizeMB = 1
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Image must be smaller than ${maxSizeMB}MB`)
      return
    }
    setProfileFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setProfileImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  };
  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.userName.trim()) {
      newErrors.userName = 'Full name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    }
    if (!formData.examPath) {
      newErrors.examPath = 'Exam path is required';
    }
    if (!formData.medium) {
      newErrors.medium = 'Medium is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSaveClick = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    // Payload for backend update, includes profile image file
    const backendPayload: ProfileData = {
      profileImage: profileFile ?? undefined,
      fullName: formData.userName,
      phone: formData.phone,
      address: formData.address,
      dob: formData.dob,
      examPath: formData.examPath,
      medium: formData.medium,
      sscStream: formData.sscStream,
      hscStream: formData.hscStream,
    }
    try {
      if (onUpdate) {
        // Delegate update (without file) to parent handler to avoid duplicates
        const uiPayload: Partial<UserData> = {
          userName: formData.userName,
          phone: formData.phone,
          address: formData.address,
          dob: formData.dob,
          examPath: formData.examPath,
          medium: formData.medium,
          sscStream: formData.sscStream,
          hscStream: formData.hscStream,
        }
        await onUpdate(uiPayload)
        setIsEditing(false)
      } else {
        // Fallback: perform update locally and toast here
        const ok = await updateUserProfile(userData.userId, backendPayload)
        if (ok) {
          toast.success('Profile Updated', { description: 'Your profile has been updated successfully.' })
          Object.assign(userData, formData)
          try { localStorage.setItem('user', JSON.stringify(userData)) } catch (e) {
            void e
          }
          setIsEditing(false)
        } else {
          toast.error('Update Failed', { description: 'Failed to update your profile. Please try again.' })
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      if (!onUpdate) {
        toast.error('Update Failed', { description: 'Failed to update your profile. Please try again.' })
      }
    } finally {
      setIsLoading(false)
    }
  };
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-900">Profile Information</CardTitle>
        <p className="text-sm text-gray-500">Personal details and information</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-2 border-white">
              {(profileImage || formData.profile) ? (
                <img
                  src={profileImage || (formData as unknown as { profile?: string }).profile || ''}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                  <span className="text-xl font-semibold text-gray-600">
                    {userData.userName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
          <h3 className="text-base font-medium text-gray-900">{userData.userName}</h3>
        </div>
        {/* Profile Information */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="text-sm text-gray-900 font-medium">{userData.userName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Email Address</p>
              <p className="text-sm text-gray-900 font-medium">{userData.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="text-sm text-gray-900 font-medium">{userData.phone}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Date of Birth</p>
              <p className="text-sm text-gray-900 font-medium">{formatDate(userData.dob)}</p>
            </div>
          </div>
          <div className="sm:col-span-2 flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="text-sm text-gray-900 font-medium">{userData.address}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <BookOpen className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Exam Path</p>
              <p className="text-sm text-gray-900 font-medium">{userData.examPath}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Globe className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Medium</p>
              <p className="text-sm text-gray-900 font-medium">{userData.medium}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              onClick={handleEditClick}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-medium text-gray-900">Edit Profile</DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Make changes to your profile information below.
              </DialogDescription>
            </DialogHeader>
            {/* Profile Picture Section in Modal */}
            <div className="flex flex-col items-center space-y-4 py-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-md">
                  {(profileImage || formData.profile) ? (
                    <img
                      src={profileImage || (formData as unknown as { profile?: string }).profile || ''}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <span className="text-xl font-semibold text-gray-600">
                        {formData.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 bg-gray-900 rounded-full p-1.5 shadow-md hover:bg-gray-800 transition-colors"
                  onClick={triggerFileInput}
                >
                  <Camera className="h-4 w-4 text-white" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              <p className="text-sm text-gray-500 text-center">
                Click the camera icon to update your profile picture
              </p>
            </div>
            {/* Form Fields in Modal */}
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="userName" className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="userName"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={errors.userName ? "border-red-500" : ""}
                />
                {errors.userName && (
                  <p className="text-red-500 text-xs mt-1">{errors.userName}</p>
                )}
              </div>
              {/* Email field removed from edit form */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={errors.address ? "border-red-500" : ""}
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob" className="text-sm font-medium text-gray-700">
                  Date of Birth
                </Label>
                <Input
                  id="dob"
                  name="dob"
                  type="date"
                  value={toDateInputValue(formData.dob)}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={errors.dob ? "border-red-500" : ""}
                />
                {errors.dob && (
                  <p className="text-red-500 text-xs mt-1">{errors.dob}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="examPath" className="text-sm font-medium text-gray-700">
                  Exam Path
                </Label>
                <Select
                  value={formData.examPath}
                  onValueChange={(value) => handleSelectChange('examPath', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className={errors.examPath ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select exam path" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NATIONAL">National Curriculum (SSC/HSC)</SelectItem>
                    <SelectItem value="MADRASHA">Madrasha Curriculum (Dakhil/Alim)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.examPath && (
                  <p className="text-red-500 text-xs mt-1">{errors.examPath}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="medium" className="text-sm font-medium text-gray-700">
                  Medium
                </Label>
                <Select
                  value={formData.medium}
                  onValueChange={(value) => handleSelectChange('medium', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className={errors.medium ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select medium" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bangla">Bangla</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Arabic">Arabic</SelectItem>
                  </SelectContent>
                </Select>
                {errors.medium && (
                  <p className="text-red-500 text-xs mt-1">{errors.medium}</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">SSC Stream</Label>
                  <Select value={formData.sscStream || ''} onValueChange={(value) => handleSelectChange('sscStream', value)} disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select SSC Stream" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SCIENCE">Science</SelectItem>
                      <SelectItem value="ARTS">Arts</SelectItem>
                      <SelectItem value="COMMERCE">Commerce</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">HSC Stream</Label>
                  <Select value={formData.hscStream || ''} onValueChange={(value) => handleSelectChange('hscStream', value)} disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select HSC Stream" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SCIENCE">Science</SelectItem>
                      <SelectItem value="ARTS">Arts</SelectItem>
                      <SelectItem value="COMMERCE">Commerce</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCancelClick} disabled={isLoading}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveClick} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button
          onClick={onLogout}
          className="bg-black text-white hover:bg-black/90"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </CardFooter>
      <Toaster position="top-right" />
    </Card>
  );
}
