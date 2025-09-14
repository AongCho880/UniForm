// src/api/profile.ts
import api from "./axios";
import type { User } from "@/context/student/AuthContext";
import type { AcademicInfo } from "@/components/student/types";

// Get Student Profile
export const getUserProfile = async (): Promise<User | null> => {
  try {
    const response = await api.get("/profile");
    if (response.data.status === 200) {
      const backendProfile = response.data.profile;
      const API_URL = import.meta.env.VITE_API_URL || "/api";
      const API_ORIGIN = API_URL.startsWith("http")
        ? new URL(API_URL).origin
        : window.location.origin;
      const profileRaw = backendProfile.profile as string | undefined;
      const profileUrl = profileRaw
        ? (profileRaw.startsWith('data:') ? profileRaw : `${API_ORIGIN}/public/images/${profileRaw}`)
        : "";
      const frontendUser: User = {
        userId: backendProfile.studentId,
        userName: backendProfile.fullName,
        email: backendProfile.email,
        phone: backendProfile.phone || "",
        password: "", // Don't store password
        address: backendProfile.address || "",
        role: backendProfile.role,
        dob: backendProfile.dob || "",
        examPath: backendProfile.examPath || "",
        medium: backendProfile.medium || "",
        profile: profileUrl,
        // Academic details
        sscRoll: backendProfile.sscRoll,
        sscRegistration: backendProfile.sscRegistration,
        sscGpa: backendProfile.sscGpa?.toString(),
        sscYear: backendProfile.sscYear?.toString(),
        sscBoard: backendProfile.sscBoard,
        hscRoll: backendProfile.hscRoll,
        hscRegistration: backendProfile.hscRegistration,
        hscGpa: backendProfile.hscGpa?.toString(),
        hscYear: backendProfile.hscYear?.toString(),
        hscBoard: backendProfile.hscBoard,
        dakhilRoll: backendProfile.dakhilRoll,
        dakhilRegistration: backendProfile.dakhilRegistration,
        dakhilGpa: backendProfile.dakhilGpa?.toString(),
        dakhilYear: backendProfile.dakhilYear?.toString(),
        dakhilBoard: backendProfile.dakhilBoard,
        alimRoll: backendProfile.alimRoll,
        alimRegistration: backendProfile.alimRegistration,
        alimGpa: backendProfile.alimGpa?.toString(),
        alimYear: backendProfile.alimYear?.toString(),
        alimBoard: backendProfile.alimBoard,
        sscStream: backendProfile.sscStream,
        hscStream: backendProfile.hscStream,
      };
      return frontendUser;
    }
    return null;
  } catch (error) {
    console.error("Get User Profile Failed:", error);
    return null;
  }
};

// Get Academic Details
export const getAcademicDetails = async (): Promise<User | null> => {
  try {
    const response = await api.get("/academicInfo");
    if (response.data.status === 200) {
      const academicDetails = response.data.academicDetails;
      const API_URL = import.meta.env.VITE_API_URL || "/api";
      const API_ORIGIN = API_URL.startsWith("http")
        ? new URL(API_URL).origin
        : window.location.origin;
      const profileRaw = academicDetails.profile as string | undefined;
      const profileUrl = profileRaw
        ? (profileRaw.startsWith('data:') ? profileRaw : `${API_ORIGIN}/public/images/${profileRaw}`)
        : "";
      const frontendUser: User = {
        userId: academicDetails.studentId,
        userName: "",
        email: "",
        phone: "",
        password: "",
        address: "",
        role: "",
        dob: "",
        examPath: academicDetails.examPath || "",
        medium: academicDetails.medium || "",
        profile: profileUrl,
        // Academic details
        sscRoll: academicDetails.sscRoll,
        sscRegistration: academicDetails.sscRegistration,
        sscGpa: academicDetails.sscGpa?.toString(),
        sscYear: academicDetails.sscYear?.toString(),
        sscBoard: academicDetails.sscBoard,
        hscRoll: academicDetails.hscRoll,
        hscRegistration: academicDetails.hscRegistration,
        hscGpa: academicDetails.hscGpa?.toString(),
        hscYear: academicDetails.hscYear?.toString(),
        hscBoard: academicDetails.hscBoard,
        dakhilRoll: academicDetails.dakhilRoll,
        dakhilRegistration: academicDetails.dakhilRegistration,
        dakhilGpa: academicDetails.dakhilGpa?.toString(),
        dakhilYear: academicDetails.dakhilYear?.toString(),
        dakhilBoard: academicDetails.dakhilBoard,
        alimRoll: academicDetails.alimRoll,
        alimRegistration: academicDetails.alimRegistration,
        alimGpa: academicDetails.alimGpa?.toString(),
        alimYear: academicDetails.alimYear?.toString(),
        alimBoard: academicDetails.alimBoard,
        // Streams
        sscStream: academicDetails.sscStream,
        hscStream: academicDetails.hscStream,
      };
      return frontendUser;
    }
    return null;
  } catch (error) {
    console.error("Get Academic Details Failed:", error);
    return null;
  }
};

// Define the interface for profile data
export interface ProfileData {
  profileImage?: File;
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  dob?: string;
  examPath?: string;
  medium?: string;
  // Academic details for NATIONAL
  sscRoll?: string;
  sscRegistration?: string;
  sscGpa?: string;
  sscYear?: string;
  sscBoard?: string;
  hscRoll?: string;
  hscRegistration?: string;
  hscGpa?: string;
  hscYear?: string;
  hscBoard?: string;
  // Academic details for MADRASHA
  dakhilRoll?: string;
  dakhilRegistration?: string;
  dakhilGpa?: string;
  dakhilYear?: string;
  dakhilBoard?: string;
  alimRoll?: string;
  alimRegistration?: string;
  alimGpa?: string;
  alimYear?: string;
  alimBoard?: string;
  // Streams (optional)
  sscStream?: 'SCIENCE' | 'ARTS' | 'COMMERCE';
  hscStream?: 'SCIENCE' | 'ARTS' | 'COMMERCE';
}

// Update User Profile
export const updateUserProfile = async (
  userId: string,
  profileData: ProfileData
): Promise<boolean> => {
  try {
    const formData = new FormData();
    // Add profile image
    if (profileData.profileImage) {
      formData.append("profile", profileData.profileImage);
    }
    // Add other fields
    if (profileData.fullName) formData.append("fullName", profileData.fullName);
    if (profileData.email) formData.append("email", profileData.email);
    if (profileData.phone) formData.append("phone", profileData.phone);
    if (profileData.address) formData.append("address", profileData.address);
    if (profileData.dob) {
      const v = profileData.dob
      const toDateOnly = (s: string) => {
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
        const d = new Date(s)
        if (isNaN(d.getTime())) return s
        const pad = (n: number) => String(n).padStart(2, '0')
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
      }
      formData.append("dob", toDateOnly(v))
    }
    if (profileData.examPath) formData.append("examPath", profileData.examPath);
    if (profileData.medium) formData.append("medium", profileData.medium);
  // Add academic details based on examPath
  if (profileData.examPath === "NATIONAL") {
      if (profileData.sscRoll) formData.append("sscRoll", profileData.sscRoll);
      if (profileData.sscRegistration)
        formData.append("sscRegistration", profileData.sscRegistration);
      if (profileData.sscGpa) formData.append("sscGpa", profileData.sscGpa);
      if (profileData.sscYear) formData.append("sscYear", profileData.sscYear);
      if (profileData.sscBoard)
        formData.append("sscBoard", profileData.sscBoard);
      if (profileData.hscRoll) formData.append("hscRoll", profileData.hscRoll);
      if (profileData.hscRegistration)
        formData.append("hscRegistration", profileData.hscRegistration);
      if (profileData.hscGpa) formData.append("hscGpa", profileData.hscGpa);
      if (profileData.hscYear) formData.append("hscYear", profileData.hscYear);
      if (profileData.hscBoard)
        formData.append("hscBoard", profileData.hscBoard);
  }
    if (profileData.examPath === "MADRASHA") {
      if (profileData.dakhilRoll)
        formData.append("dakhilRoll", profileData.dakhilRoll);
      if (profileData.dakhilRegistration)
        formData.append("dakhilRegistration", profileData.dakhilRegistration);
      if (profileData.dakhilGpa)
        formData.append("dakhilGpa", profileData.dakhilGpa);
      if (profileData.dakhilYear)
        formData.append("dakhilYear", profileData.dakhilYear);
      if (profileData.dakhilBoard)
        formData.append("dakhilBoard", profileData.dakhilBoard);
      if (profileData.alimRoll)
        formData.append("alimRoll", profileData.alimRoll);
      if (profileData.alimRegistration)
        formData.append("alimRegistration", profileData.alimRegistration);
      if (profileData.alimGpa) formData.append("alimGpa", profileData.alimGpa);
      if (profileData.alimYear)
        formData.append("alimYear", profileData.alimYear);
      if (profileData.alimBoard)
        formData.append("alimBoard", profileData.alimBoard);
    }
    // Add streams if provided
    if (profileData.sscStream) formData.append('sscStream', profileData.sscStream)
    if (profileData.hscStream) formData.append('hscStream', profileData.hscStream)
    // Debug log
    console.log("FormData:\n");
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    const response = await api.put(`/profile/${userId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.status === 200;
  } catch (error) {
    console.error("Update User Profile Failed:", error);
    return false;
  }
};


// Get Academic Info by User ID - Deprecated in favor of getAcademicDetails
export const getAcademicInfo = async (
  userId: string
): Promise<AcademicInfo | null> => {
  try {
    const response = await api.get(`/academicInfo?userId=${userId}`);
    return response.data.academicDetails || null;
  } catch (error) {
    console.error("Get Academic Info Failed:", error);
    return null;
  }
};

// Create or Update Academic Info - Deprecated in favor of updateUserProfile
export const saveAcademicInfo = async (
  academicInfo: AcademicInfo
): Promise<AcademicInfo | null> => {
  try {
    const { id, ...data } = academicInfo;
    if (id) {
      const response = await api.put<AcademicInfo>(`/academicInfo/${id}`, data);
      return response.data;
    } else {
      const response = await api.post<AcademicInfo>("/academicInfo", data);
      return response.data;
    }
  } catch (error) {
    console.error("Save Academic Info Failed:", error);
    return null;
  }
};
