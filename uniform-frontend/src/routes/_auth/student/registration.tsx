// uniform-frontend/src/routes/_auth/registration.tsx
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { GraduationCap, Eye, EyeOff, Calendar, AlertCircle, HomeIcon } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/context/student/useAuth'
import { toast } from 'sonner'
import { registerUser } from '@/api'
import axios from 'axios'

function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  // If the cleaned string starts with '880', then we add a '+' at the beginning
  if (cleaned.startsWith('880')) {
    return `+${cleaned}`;
  }
  // If it starts with '0', then we replace the leading '0' with '+880'
  if (cleaned.startsWith('0')) {
    return `+880${cleaned.substring(1)}`;
  }
  // If it starts with '1' (assuming it's a local number without country code and without leading 0)
  if (cleaned.startsWith('1')) {
    return `+880${cleaned}`;
  }
  // If none of the above, return the original phone (or throw an error, but we'll just return as is)
  return phone;
}

// Validation function for Bangladeshi phone number
function validateBangladeshiPhoneNumber(phone: string): boolean {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Check if the cleaned number starts with 880 and has 13 digits in total
  if (cleaned.startsWith('880') && cleaned.length === 13) {
    return true;
  }

  // Check if the cleaned number starts with 0 and has 11 digits in total
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return true;
  }

  // Check if the cleaned number starts with 1 and has 10 digits in total (assuming it's a local number without country code and without leading 0)
  if (cleaned.startsWith('1') && cleaned.length === 10) {
    return true;
  }

  return false;
}

// Validation function for GPA
function validateGPA(gpa: string): boolean {
  const gpaValue = parseFloat(gpa);
  return !isNaN(gpaValue) && gpaValue >= 0 && gpaValue <= 5;
}

// Validation function for year
function validateYear(year: string): boolean {
  const yearValue = parseInt(year);
  const currentYear = new Date().getFullYear();
  return !isNaN(yearValue) && yearValue >= 1990 && yearValue <= currentYear;
}

// Validation for exact digit roll/registration
function validateRoll(value: string): boolean {
  return /^\d{6}$/.test(value.trim());
}

function validateRegistrationNo(value: string): boolean {
  return /^\d{10}$/.test(value.trim());
}

export const Route = createFileRoute('/_auth/student/registration')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    dob: '',
    medium: '',
    examPath: '',
    // SSC Details
    sscStream: '',
    sscRoll: '',
    sscRegistration: '',
    sscGpa: '',
    sscYear: '',
    sscBoard: '',
    // HSC Details
    hscStream: '',
    hscRoll: '',
    hscRegistration: '',
    hscGpa: '',
    hscYear: '',
    hscBoard: '',
    // Dakhil Details
    dakhilRoll: '',
    dakhilRegistration: '',
    dakhilGpa: '',
    dakhilYear: '',
    dakhilBoard: '',
    // Alim Details
    alimRoll: '',
    alimRegistration: '',
    alimGpa: '',
    alimYear: '',
    alimBoard: '',
  })

  // Year options
  const currentYear = new Date().getFullYear()
  const allYears: string[] = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => String(1990 + i))
  const hscEligibleYears: string[] = allYears.filter(y => (
    !formData.sscYear || (parseInt(y) >= parseInt(formData.sscYear) + 2)
  ))
  const alimEligibleYears: string[] = allYears.filter(y => (
    !formData.dakhilYear || (parseInt(y) >= parseInt(formData.dakhilYear) + 2)
  ))

  // Validate a single field
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'userName':
        return value.trim() ? '' : 'Full name is required';
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Please enter a valid email address';
      case 'phone':
        return validateBangladeshiPhoneNumber(value) ? '' : 'Please enter a valid Bangladeshi phone number (e.g., +8801712345678 or 01712345678)';
      case 'password':
        return value.length >= 6 ? '' : 'Password must be at least 6 characters';
      case 'confirmPassword':
        return value === formData.password ? '' : 'Passwords do not match';
      case 'address':
        return value.trim() ? '' : 'Address is required';
      case 'dob':
        return value ? '' : 'Date of birth is required';
      case 'medium':
        return value ? '' : 'Please select a medium';
      case 'examPath':
        return value ? '' : 'Please select an exam path';
      case 'sscStream':
        return formData.examPath === 'NATIONAL' && !value ? 'Please select SSC stream' : '';
      case 'hscStream':
        return formData.examPath === 'NATIONAL' && !value ? 'Please select HSC stream' : '';
      case 'sscRoll': {
        if (formData.examPath === 'NATIONAL') {
          if (!value.trim()) return 'SSC roll number is required';
          if (!validateRoll(value)) return 'Roll must be exactly 6 digits';
        }
        return '';
      }
      case 'sscRegistration': {
        if (formData.examPath === 'NATIONAL') {
          if (!value.trim()) return 'SSC registration number is required';
          if (!validateRegistrationNo(value)) return 'Registration must be exactly 10 digits';
        }
        return '';
      }
      case 'sscGpa':
        return formData.examPath === 'NATIONAL' && !validateGPA(value) ? 'Please enter a valid SSC GPA (0-5)' : '';
      case 'sscYear':
        return formData.examPath === 'NATIONAL' && !validateYear(value) ? 'Please enter a valid SSC year' : '';
      case 'sscBoard':
        return formData.examPath === 'NATIONAL' && !value ? 'Please select SSC board' : '';
      case 'hscRoll': {
        if (formData.examPath === 'NATIONAL') {
          if (!value.trim()) return 'HSC roll number is required';
          if (!validateRoll(value)) return 'Roll must be exactly 6 digits';
        }
        return '';
      }
      case 'hscRegistration': {
        if (formData.examPath === 'NATIONAL') {
          if (!value.trim()) return 'HSC registration number is required';
          if (!validateRegistrationNo(value)) return 'Registration must be exactly 10 digits';
        }
        return '';
      }
      case 'hscGpa':
        return formData.examPath === 'NATIONAL' && !validateGPA(value) ? 'Please enter a valid HSC GPA (0-5)' : '';
      case 'hscYear': {
        if (formData.examPath === 'NATIONAL') {
          // Basic year validity
          if (!validateYear(value)) {
            return 'Please enter a valid HSC year';
          }
          // Enforce minimum 2-year gap between SSC and HSC passing years
          const sscYearVal = parseInt(formData.sscYear);
          const hscYearVal = parseInt(value);
          if (!isNaN(sscYearVal) && !isNaN(hscYearVal)) {
            if (hscYearVal < sscYearVal + 2) {
              return 'HSC passing year must be at least 2 years after SSC passing year';
            }
          }
        }
        return '';
      }
      case 'hscBoard':
        return formData.examPath === 'NATIONAL' && !value ? 'Please select HSC board' : '';
      case 'dakhilRoll': {
        if (formData.examPath === 'MADRASHA') {
          if (!value.trim()) return 'Dakhil roll number is required';
          if (!validateRoll(value)) return 'Roll must be exactly 6 digits';
        }
        return '';
      }
      case 'dakhilRegistration': {
        if (formData.examPath === 'MADRASHA') {
          if (!value.trim()) return 'Dakhil registration number is required';
          if (!validateRegistrationNo(value)) return 'Registration must be exactly 10 digits';
        }
        return '';
      }
      case 'dakhilGpa':
        return formData.examPath === 'MADRASHA' && !validateGPA(value) ? 'Please enter a valid Dakhil GPA (0-5)' : '';
      case 'dakhilYear':
        return formData.examPath === 'MADRASHA' && !validateYear(value) ? 'Please enter a valid Dakhil year' : '';
      case 'dakhilBoard':
        return formData.examPath === 'MADRASHA' && !value ? 'Please select Dakhil board' : '';
      case 'alimRoll': {
        if (formData.examPath === 'MADRASHA') {
          if (!value.trim()) return 'Alim roll number is required';
          if (!validateRoll(value)) return 'Roll must be exactly 6 digits';
        }
        return '';
      }
      case 'alimRegistration': {
        if (formData.examPath === 'MADRASHA') {
          if (!value.trim()) return 'Alim registration number is required';
          if (!validateRegistrationNo(value)) return 'Registration must be exactly 10 digits';
        }
        return '';
      }
      case 'alimGpa':
        return formData.examPath === 'MADRASHA' && !validateGPA(value) ? 'Please enter a valid Alim GPA (0-5)' : '';
      case 'alimYear': {
        if (formData.examPath === 'MADRASHA') {
          if (!validateYear(value)) {
            return 'Please enter a valid Alim year';
          }
          const dakhilYearVal = parseInt(formData.dakhilYear);
          const alimYearVal = parseInt(value);
          if (!isNaN(dakhilYearVal) && !isNaN(alimYearVal)) {
            if (alimYearVal < dakhilYearVal + 2) {
              return 'Alim passing year must be at least 2 years after Dakhil passing year';
            }
          }
        }
        return '';
      }
      case 'alimBoard':
        return formData.examPath === 'MADRASHA' && !value ? 'Please select Alim board' : '';
      default:
        return '';
    }
  }

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Validate all form fields
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target
    let { value } = e.target

    // Sanitize numeric-only inputs for roll and registration
    const rollFields = new Set(['sscRoll', 'hscRoll', 'dakhilRoll', 'alimRoll'])
    const regFields = new Set(['sscRegistration', 'hscRegistration', 'dakhilRegistration', 'alimRegistration'])
    if (rollFields.has(name)) {
      value = value.replace(/\D/g, '').slice(0, 6)
    } else if (regFields.has(name)) {
      value = value.replace(/\D/g, '').slice(0, 10)
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Field-level error handling on change
    if (name === 'hscYear' || name === 'alimYear') {
      // Proactively validate year including 2-year gap rule for respective path
      const error = validateField(name, value)
      setErrors(prev => ({
        ...prev,
        [name]: error
      }))
    } else {
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }))
      }

      // If SSC year changes, re-evaluate HSC gap rule
      if (name === 'sscYear' && formData.hscYear) {
        const sscYearVal = parseInt(value)
        const hscYearVal = parseInt(formData.hscYear)
        let hscError = ''
        if (
          formData.examPath === 'NATIONAL' &&
          !isNaN(sscYearVal) &&
          !isNaN(hscYearVal) &&
          validateYear(value) &&
          validateYear(formData.hscYear) &&
          hscYearVal < sscYearVal + 2
        ) {
          hscError = 'HSC passing year must be at least 2 years after SSC passing year'
        }
        setErrors(prev => ({
          ...prev,
          hscYear: hscError
        }))
      }

      // If Dakhil year changes, re-evaluate Alim gap rule
      if (name === 'dakhilYear' && formData.alimYear) {
        const dakhilYearVal = parseInt(value)
        const alimYearVal = parseInt(formData.alimYear)
        let alimError = ''
        if (
          formData.examPath === 'MADRASHA' &&
          !isNaN(dakhilYearVal) &&
          !isNaN(alimYearVal) &&
          validateYear(value) &&
          validateYear(formData.alimYear) &&
          alimYearVal < dakhilYearVal + 2
        ) {
          alimError = 'Alim passing year must be at least 2 years after Dakhil passing year'
        }
        setErrors(prev => ({
          ...prev,
          alimYear: alimError
        }))
      }
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTouched(prev => ({
      ...prev,
      [name]: true
    }))

    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear own error
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }

    // Proactively validate/select-dependent rules
    if (name === 'hscYear' || name === 'alimYear') {
      const err = validateField(name, value)
      setErrors(prev => ({ ...prev, [name]: err }))
    }

    if (name === 'sscYear' && formData.hscYear) {
      const sscYearVal = parseInt(value)
      const hscYearVal = parseInt(formData.hscYear)
      let hscError = ''
      if (
        formData.examPath === 'NATIONAL' &&
        !isNaN(sscYearVal) &&
        !isNaN(hscYearVal) &&
        validateYear(value) &&
        validateYear(formData.hscYear) &&
        hscYearVal < sscYearVal + 2
      ) {
        hscError = 'HSC passing year must be at least 2 years after SSC passing year'
      }
      setErrors(prev => ({ ...prev, hscYear: hscError }))
    }

    if (name === 'dakhilYear' && formData.alimYear) {
      const dakhilYearVal = parseInt(value)
      const alimYearVal = parseInt(formData.alimYear)
      let alimError = ''
      if (
        formData.examPath === 'MADRASHA' &&
        !isNaN(dakhilYearVal) &&
        !isNaN(alimYearVal) &&
        validateYear(value) &&
        validateYear(formData.alimYear) &&
        alimYearVal < dakhilYearVal + 2
      ) {
        alimError = 'Alim passing year must be at least 2 years after Dakhil passing year'
      }
      setErrors(prev => ({ ...prev, alimYear: alimError }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate form
    if (!validateForm()) {
      toast.error("Validation Error", {
        description: "Please fix the errors in the form."
      });
      return;
    }

    setIsLoading(true);

    try {
      // Format the phone number
      const formattedPhone = formatPhoneNumber(formData.phone);

      // Prepare user data for API
      type Stream = 'SCIENCE' | 'ARTS' | 'COMMERCE'
      const isStream = (v: string): v is Stream => (
        v === 'SCIENCE' || v === 'ARTS' || v === 'COMMERCE'
      )
      const normalizeStream = (v: string | undefined): Stream | undefined => {
        const up = (v || '').toUpperCase().trim()
        return isStream(up) ? up : undefined
      }
      const userData = {
        userName: formData.userName,
        email: formData.email,
        phone: formattedPhone, // Use formatted phone number
        password: formData.password,
        address: formData.address,
        role: "STUDENT",
        dob: formData.dob,
        examPath: formData.examPath,
        medium: formData.medium,
        // Include academic details based on examPath
        ...(formData.examPath === 'NATIONAL' && {
          // Streams
          sscStream: normalizeStream(formData.sscStream),
          hscStream: normalizeStream(formData.hscStream),
          sscRoll: formData.sscRoll,
          sscRegistration: formData.sscRegistration,
          sscGpa: formData.sscGpa,
          sscYear: formData.sscYear,
          sscBoard: formData.sscBoard,
          hscRoll: formData.hscRoll,
          hscRegistration: formData.hscRegistration,
          hscGpa: formData.hscGpa,
          hscYear: formData.hscYear,
          hscBoard: formData.hscBoard,
        }),
        ...(formData.examPath === 'MADRASHA' && {
          dakhilRoll: formData.dakhilRoll,
          dakhilRegistration: formData.dakhilRegistration,
          dakhilGpa: formData.dakhilGpa,
          dakhilYear: formData.dakhilYear,
          dakhilBoard: formData.dakhilBoard,
          alimRoll: formData.alimRoll,
          alimRegistration: formData.alimRegistration,
          alimGpa: formData.alimGpa,
          alimYear: formData.alimYear,
          alimBoard: formData.alimBoard,
        }),
      };

      // Call the register API
      const newUser = await registerUser(userData);

      if (newUser) {
        // Log the user in
        login(newUser);
        toast.success("Registration Successful", {
          description: "Your account has been created successfully."
        });
        // Navigate to dashboard
        navigate({ to: '/student/dashboard' });
      } else {
        toast.error("Registration Failed", {
          description: "There was a problem creating your account. Please try again."
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = "There was a problem creating your account. Please try again.";

      // Check if error is an Axios error
      if (axios.isAxiosError(error)) {
        // Handle axios specific errors
        if (error.response) {
          // Server responded with error status
          const status = error.response.status;
          const responseData = error.response.data;

          if (status === 400) {
            // Handle validation errors
            if (responseData.errors) {
              // Extract the first validation error message
              const firstError = responseData.errors[0];
              errorMessage = firstError.message || "Invalid registration data. Please check your inputs.";

              // Show more specific error for phone number
              if (firstError.field === 'phone') {
                errorMessage = "Invalid phone number format. Please use a valid Bangladeshi phone number (e.g., +8801XXXXXXXXX).";
              }
            } else if (responseData.message) {
              errorMessage = responseData.message;
            }
          } else if (status === 409) {
            errorMessage = "An account with this email already exists.";
          }
        } else if (error.request) {
          // Request was made but no response received
          errorMessage = "Network error. Please check your internet connection.";
        }
      } else if (error instanceof Error) {
        // Handle generic JavaScript errors
        errorMessage = error.message;
      }

      toast.error("Registration Failed", {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg">
        {/* Logo and Title Section */}
        <Link to="/" >
          <div className="text-center pt-8 pb-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gray-900 rounded-full">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Join UniForm</h2>
            <p className="mt-2 text-gray-600">Centralized University Admission System</p>
          </div>
        </Link>

        {/* Registration Form */}
        <div className="px-8 pb-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Join thousands of students applying through UniForm</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userName" className="text-gray-700 font-medium">
                Full Name
              </Label>
              <Input
                type="text"
                id="userName"
                name="userName"
                placeholder="Enter your full name"
                className={`w-full px-4 py-3 border ${errors.userName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition`}
                value={formData.userName}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                disabled={isLoading}
              />
              {errors.userName && touched.userName && (
                <p className="text-red-500 text-sm flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.userName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="username@domain.com"
                className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition`}
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                disabled={isLoading}
              />
              {errors.email && touched.email && (
                <p className="text-red-500 text-sm flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700 font-medium">
                Phone Number
              </Label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                placeholder="+8801712345678"
                className={`w-full px-4 py-3 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition`}
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                disabled={isLoading}
              />
              {errors.phone && touched.phone && (
                <p className="text-red-500 text-sm flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.phone}
                </p>
              )}
              <p className="text-sm text-gray-500">Enter a valid Bangladeshi phone number (e.g., +8801712345678)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-gray-700 font-medium">
                Address
              </Label>
              <Input
                type="text"
                id="address"
                name="address"
                placeholder="Enter your address"
                className={`w-full px-4 py-3 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition`}
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                disabled={isLoading}
              />
              {errors.address && touched.address && (
                <p className="text-red-500 text-sm flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.address}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob" className="text-gray-700 font-medium">
                Date of Birth
              </Label>
              <div className="relative">
                <Input
                  type="date"
                  id="dob"
                  name="dob"
                  className={`w-full px-4 py-3 border ${errors.dob ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition`}
                  value={formData.dob}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  disabled={isLoading}
                />
                <Calendar className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.dob && touched.dob && (
                <p className="text-red-500 text-sm flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.dob}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="examPath" className="text-gray-700 font-medium">
                Exam Path
              </Label>
              <Select
                value={formData.examPath}
                onValueChange={(value) => handleSelectChange('examPath', value)}
                disabled={isLoading}
              >
                <SelectTrigger className={`w-full ${errors.examPath ? 'border-red-500' : 'border-gray-300'}`}>
                  <SelectValue placeholder="Select exam path" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NATIONAL">National Curriculum (SSC/HSC)</SelectItem>
                  <SelectItem value="MADRASHA">Madrasha Curriculum (Dakhil/Alim)</SelectItem>
                </SelectContent>
              </Select>
              {errors.examPath && touched.examPath && (
                <p className="text-red-500 text-sm flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.examPath}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="medium" className="text-gray-700 font-medium">
                Medium
              </Label>
              <Select
                value={formData.medium}
                onValueChange={(value) => handleSelectChange('medium', value)}
                disabled={isLoading}
              >
                <SelectTrigger className={`w-full ${errors.medium ? 'border-red-500' : 'border-gray-300'}`}>
                  <SelectValue placeholder="Select medium" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bangla">Bangla</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Arabic">Arabic</SelectItem>
                </SelectContent>
              </Select>
              {errors.medium && touched.medium && (
                <p className="text-red-500 text-sm flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.medium}
                </p>
              )}
            </div>

            {/* Conditional Academic Details Section */}
            {formData.examPath === 'NATIONAL' && (
              <>
                {/* SSC Details */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">SSC Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">SSC Stream</Label>
                    <Select value={formData.sscStream} onValueChange={(v) => handleSelectChange("sscStream", v)} disabled={isLoading}>
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
                      <Label htmlFor="sscRoll" className="text-gray-700 font-medium">
                        Roll Number
                      </Label>
                      <Input
                        type="text"
                        id="sscRoll"
                        name="sscRoll"
                        placeholder="SSC Roll Number"
                        className={`w-full px-4 py-3 border ${errors.sscRoll ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition`}
                        value={formData.sscRoll}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        title="Enter exactly 6 digits"
                        maxLength={6}
                        required
                        disabled={isLoading}
                      />
                      {errors.sscRoll && touched.sscRoll && (
                        <p className="text-red-500 text-sm flex items-center mt-1">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.sscRoll}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sscRegistration" className="text-gray-700 font-medium">
                        Registration Number
                      </Label>
                      <Input
                        type="text"
                        id="sscRegistration"
                        name="sscRegistration"
                        placeholder="SSC Registration Number"
                        className={`w-full px-4 py-3 border ${errors.sscRegistration ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition`}
                        value={formData.sscRegistration}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        title="Enter exactly 10 digits"
                        maxLength={10}
                        required
                        disabled={isLoading}
                      />
                      {errors.sscRegistration && touched.sscRegistration && (
                        <p className="text-red-500 text-sm flex items-center mt-1">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.sscRegistration}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sscGpa" className="text-gray-700 font-medium">
                        GPA
                      </Label>
                      <Input
                        type="number"
                        id="sscGpa"
                        name="sscGpa"
                        placeholder="SSC GPA"
                        step="0.01"
                        min="0"
                        max="5"
                        className={`w-full px-4 py-3 border ${errors.sscGpa ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition`}
                        value={formData.sscGpa}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        disabled={isLoading}
                      />
                      {errors.sscGpa && touched.sscGpa && (
                        <p className="text-red-500 text-sm flex items-center mt-1">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.sscGpa}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sscYear" className="text-gray-700 font-medium">
                        Passing Year
                      </Label>
                      <Select
                        value={formData.sscYear}
                        onValueChange={(value) => handleSelectChange('sscYear', value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className={`w-full ${errors.sscYear ? 'border-red-500' : 'border-gray-300'}`}>
                          <SelectValue placeholder="Select SSC Passing Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {allYears.map((y) => (
                            <SelectItem key={`ssc-${y}`} value={y}>{y}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.sscYear && touched.sscYear && (
                        <p className="text-red-500 text-sm flex items-center mt-1">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.sscYear}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="sscBoard" className="text-gray-700 font-medium">
                        Board
                      </Label>
                      <Select
                        value={formData.sscBoard}
                        onValueChange={(value) => handleSelectChange('sscBoard', value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className={`w-full ${errors.sscBoard ? 'border-red-500' : 'border-gray-300'}`}>
                          <SelectValue placeholder="Select SSC Board" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dhaka">Dhaka</SelectItem>
                          <SelectItem value="Rajshahi">Rajshahi</SelectItem>
                          <SelectItem value="Chittagong">Chittagong</SelectItem>
                          <SelectItem value="Jessore">Jessore</SelectItem>
                          <SelectItem value="Comilla">Comilla</SelectItem>
                          <SelectItem value="Sylhet">Sylhet</SelectItem>
                          <SelectItem value="Barisal">Barisal</SelectItem>
                          <SelectItem value="Dinajpur">Dinajpur</SelectItem>
                          <SelectItem value="Madrasha">Madrasha</SelectItem>
                          <SelectItem value="Technical">Technical</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.sscBoard && touched.sscBoard && (
                        <p className="text-red-500 text-sm flex items-center mt-1">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.sscBoard}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* HSC Details */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">HSC Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">HSC Stream</Label>
                    <Select value={formData.hscStream} onValueChange={(v) => handleSelectChange("hscStream", v)} disabled={isLoading}>
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
                    <div className="space-y-2">
                      <Label htmlFor="hscRoll" className="text-gray-700 font-medium">
                        Roll Number
                      </Label>
                      <Input
                        type="text"
                        id="hscRoll"
                        name="hscRoll"
                        placeholder="HSC Roll Number"
                        className={`w-full px-4 py-3 border ${errors.hscRoll ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition`}
                        value={formData.hscRoll}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        title="Enter exactly 6 digits"
                        maxLength={6}
                        required
                        disabled={isLoading}
                      />
                      {errors.hscRoll && touched.hscRoll && (
                        <p className="text-red-500 text-sm flex items-center mt-1">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.hscRoll}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hscRegistration" className="text-gray-700 font-medium">
                        Registration Number
                      </Label>
                      <Input
                        type="text"
                        id="hscRegistration"
                        name="hscRegistration"
                        placeholder="HSC Registration Number"
                        className={`w-full px-4 py-3 border ${errors.hscRegistration ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition`}
                        value={formData.hscRegistration}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        title="Enter exactly 10 digits"
                        maxLength={10}
                        required
                        disabled={isLoading}
                      />
                      {errors.hscRegistration && touched.hscRegistration && (
                        <p className="text-red-500 text-sm flex items-center mt-1">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.hscRegistration}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hscGpa" className="text-gray-700 font-medium">
                        GPA
                      </Label>
                      <Input
                        type="number"
                        id="hscGpa"
                        name="hscGpa"
                        placeholder="HSC GPA"
                        step="0.01"
                        min="0"
                        max="5"
                        className={`w-full px-4 py-3 border ${errors.hscGpa ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition`}
                        value={formData.hscGpa}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        disabled={isLoading}
                      />
                      {errors.hscGpa && touched.hscGpa && (
                        <p className="text-red-500 text-sm flex items-center mt-1">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.hscGpa}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hscYear" className="text-gray-700 font-medium">
                        Passing Year
                      </Label>
                      <Select
                        value={formData.hscYear}
                        onValueChange={(value) => handleSelectChange('hscYear', value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className={`w-full ${errors.hscYear ? 'border-red-500' : 'border-gray-300'}`}>
                          <SelectValue placeholder="Select HSC Passing Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {(hscEligibleYears.length ? hscEligibleYears : allYears).map((y) => (
                            <SelectItem key={`hsc-${y}`} value={y}>{y}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.hscYear && touched.hscYear && (
                        <p className="text-red-500 text-sm flex items-center mt-1">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.hscYear}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="hscBoard" className="text-gray-700 font-medium">
                        Board
                      </Label>
                      <Select
                        value={formData.hscBoard}
                        onValueChange={(value) => handleSelectChange('hscBoard', value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className={`w-full ${errors.hscBoard ? 'border-red-500' : 'border-gray-300'}`}>
                          <SelectValue placeholder="Select HSC Board" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dhaka">Dhaka</SelectItem>
                          <SelectItem value="Rajshahi">Rajshahi</SelectItem>
                          <SelectItem value="Chittagong">Chittagong</SelectItem>
                          <SelectItem value="Jessore">Jessore</SelectItem>
                          <SelectItem value="Comilla">Comilla</SelectItem>
                          <SelectItem value="Sylhet">Sylhet</SelectItem>
                          <SelectItem value="Barisal">Barisal</SelectItem>
                          <SelectItem value="Dinajpur">Dinajpur</SelectItem>
                          <SelectItem value="Madrasha">Madrasha</SelectItem>
                          <SelectItem value="Technical">Technical</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.hscBoard && touched.hscBoard && (
                        <p className="text-red-500 text-sm flex items-center mt-1">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.hscBoard}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {formData.examPath === 'MADRASHA' && (
              <>
                {/* Dakhil Details */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Dakhil Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dakhilRoll" className="text-gray-700 font-medium">
                        Roll Number
                      </Label>
                      <Input
                        type="text"
                        id="dakhilRoll"
                        name="dakhilRoll"
                        placeholder="Dakhil Roll Number"
                        className={`w-full px-4 py-3 border ${errors.dakhilRoll ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition`}
                        value={formData.dakhilRoll}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        title="Enter exactly 6 digits"
                        maxLength={6}
                        required
                        disabled={isLoading}
                      />
                      {errors.dakhilRoll && touched.dakhilRoll && (
                        <p className="text-red-500 text-sm flex items-center mt-1">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.dakhilRoll}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dakhilRegistration" className="text-gray-700 font-medium">
                        Registration Number
                      </Label>
                      <Input
                        type="text"
                        id="dakhilRegistration"
                        name="dakhilRegistration"
                        placeholder="Dakhil Registration Number"
                        className={`w-full px-4 py-3 border ${errors.dakhilRegistration ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition`}
                        value={formData.dakhilRegistration}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        title="Enter exactly 10 digits"
                        maxLength={10}
                        required
                        disabled={isLoading}
                      />
                      {errors.dakhilRegistration && touched.dakhilRegistration && (
                        <p className="text-red-500 text-sm flex items-center mt-1">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.dakhilRegistration}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dakhilGpa" className="text-gray-700 font-medium">
                        GPA
                      </Label>
                      <Input
                        type="number"
                        id="dakhilGpa"
                        name="dakhilGpa"
                        placeholder="Dakhil GPA"
                        step="0.01"
                        min="0"
                        max="5"
                        className={`w-full px-4 py-3 border ${errors.dakhilGpa ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition`}
                        value={formData.dakhilGpa}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        disabled={isLoading}
                      />
                      {errors.dakhilGpa && touched.dakhilGpa && (
                        <p className="text-red-500 text-sm flex items-center mt-1">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.dakhilGpa}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dakhilYear" className="text-gray-700 font-medium">
                        Passing Year
                      </Label>
                      <Select
                        value={formData.dakhilYear}
                        onValueChange={(value) => handleSelectChange('dakhilYear', value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className={`w-full ${errors.dakhilYear ? 'border-red-500' : 'border-gray-300'}`}>
                          <SelectValue placeholder="Select Dakhil Passing Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {allYears.map((y) => (
                            <SelectItem key={`dakhil-${y}`} value={y}>{y}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.dakhilYear && touched.dakhilYear && (
                        <p className="text-red-500 text-sm flex items-center mt-1">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.dakhilYear}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="dakhilBoard" className="text-gray-700 font-medium">
                        Board
                      </Label>
                      <Select
                        value={formData.dakhilBoard}
                        onValueChange={(value) => handleSelectChange('dakhilBoard', value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className={`w-full ${errors.dakhilBoard ? 'border-red-500' : 'border-gray-300'}`}>
                          <SelectValue placeholder="Select Dakhil Board" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dhaka">Dhaka</SelectItem>
                          <SelectItem value="Rajshahi">Rajshahi</SelectItem>
                          <SelectItem value="Chittagong">Chittagong</SelectItem>
                          <SelectItem value="Jessore">Jessore</SelectItem>
                          <SelectItem value="Comilla">Comilla</SelectItem>
                          <SelectItem value="Sylhet">Sylhet</SelectItem>
                          <SelectItem value="Barisal">Barisal</SelectItem>
                          <SelectItem value="Dinajpur">Dinajpur</SelectItem>
                          <SelectItem value="Madrasha">Madrasha</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.dakhilBoard && touched.dakhilBoard && (
                        <p className="text-red-500 text-sm flex items-center mt-1">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.dakhilBoard}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Alim Details */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Alim Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="alimRoll" className="text-gray-700 font-medium">
                        Roll Number
                      </Label>
                      <Input
                        type="text"
                        id="alimRoll"
                        name="alimRoll"
                        placeholder="Alim Roll Number"
                        className={`w-full px-4 py-3 border ${errors.alimRoll ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition`}
                        value={formData.alimRoll}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        title="Enter exactly 6 digits"
                        maxLength={6}
                        required
                        disabled={isLoading}
                      />
                      {errors.alimRoll && touched.alimRoll && (
                        <p className="text-red-500 text-sm flex items-center mt-1">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.alimRoll}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="alimRegistration" className="text-gray-700 font-medium">
                        Registration Number
                      </Label>
                      <Input
                        type="text"
                        id="alimRegistration"
                        name="alimRegistration"
                        placeholder="Alim Registration Number"
                        className={`w-full px-4 py-3 border ${errors.alimRegistration ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition`}
                        value={formData.alimRegistration}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        title="Enter exactly 10 digits"
                        maxLength={10}
                        required
                        disabled={isLoading}
                      />
                      {errors.alimRegistration && touched.alimRegistration && (
                        <p className="text-red-500 text-sm flex items-center mt-1">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.alimRegistration}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="alimGpa" className="text-gray-700 font-medium">
                        GPA
                      </Label>
                      <Input
                        type="number"
                        id="alimGpa"
                        name="alimGpa"
                        placeholder="Alim GPA"
                        step="0.01"
                        min="0"
                        max="5"
                        className={`w-full px-4 py-3 border ${errors.alimGpa ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition`}
                        value={formData.alimGpa}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        disabled={isLoading}
                      />
                      {errors.alimGpa && touched.alimGpa && (
                        <p className="text-red-500 text-sm flex items-center mt-1">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.alimGpa}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="alimYear" className="text-gray-700 font-medium">
                        Passing Year
                      </Label>
                      <Select
                        value={formData.alimYear}
                        onValueChange={(value) => handleSelectChange('alimYear', value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className={`w-full ${errors.alimYear ? 'border-red-500' : 'border-gray-300'}`}>
                          <SelectValue placeholder="Select Alim Passing Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {(alimEligibleYears.length ? alimEligibleYears : allYears).map((y) => (
                            <SelectItem key={`alim-${y}`} value={y}>{y}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.alimYear && touched.alimYear && (
                        <p className="text-red-500 text-sm flex items-center mt-1">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.alimYear}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="alimBoard" className="text-gray-700 font-medium">
                        Board
                      </Label>
                      <Select
                        value={formData.alimBoard}
                        onValueChange={(value) => handleSelectChange('alimBoard', value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className={`w-full ${errors.alimBoard ? 'border-red-500' : 'border-gray-300'}`}>
                          <SelectValue placeholder="Select Alim Board" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dhaka">Dhaka</SelectItem>
                          <SelectItem value="Rajshahi">Rajshahi</SelectItem>
                          <SelectItem value="Chittagong">Chittagong</SelectItem>
                          <SelectItem value="Jessore">Jessore</SelectItem>
                          <SelectItem value="Comilla">Comilla</SelectItem>
                          <SelectItem value="Sylhet">Sylhet</SelectItem>
                          <SelectItem value="Barisal">Barisal</SelectItem>
                          <SelectItem value="Dinajpur">Dinajpur</SelectItem>
                          <SelectItem value="Madrasha">Madrasha</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.alimBoard && touched.alimBoard && (
                        <p className="text-red-500 text-sm flex items-center mt-1">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.alimBoard}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Create a password"
                  className={`w-full px-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition`}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
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
              {errors.password && touched.password && (
                <p className="text-red-500 text-sm flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  className={`w-full px-4 py-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && touched.confirmPassword && (
                <p className="text-red-500 text-sm flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="mt-1 h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                required
                disabled={isLoading}
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the <a href="#" className="text-gray-900 hover:text-gray-700 transition">Terms of Service</a> and <a href="#" className="text-gray-900 hover:text-gray-700 transition">Privacy Policy</a>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition duration-300 flex items-center justify-center gap-2 mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <GraduationCap className="h-5 w-5" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/student/studentLogin" className="font-medium text-gray-900 hover:text-gray-700 transition">
              Login
            </Link>
          </p>


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
  )
}
