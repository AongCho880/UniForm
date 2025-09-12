// src/api/auth.ts
import api from "./axios";
import type { User } from "@/context/student/AuthContext";
import { getUserProfile } from "./profile";

// Register User
export const registerUser = async (userData: {
  userName: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  role: string;
  dob: string;
  examPath: string;
  medium: string;
  // Academic details
  sscStream?: 'SCIENCE' | 'ARTS' | 'COMMERCE';
  hscStream?: 'SCIENCE' | 'ARTS' | 'COMMERCE';
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
}): Promise<User | null> => {
  try {
    // Transform frontend data to match backend schema
    const backendData = {
      fullName: userData.userName,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      password_confirmation: userData.password,
      address: userData.address,
      role: userData.role,
      dob: new Date(userData.dob).toISOString(), // Convert to ISO string format
      examPath: userData.examPath,
      medium: userData.medium,
      // Include academic details based on examPath
      ...(userData.examPath === "NATIONAL" && {
        sscStream: userData.sscStream,
        hscStream: userData.hscStream,
        sscRoll: userData.sscRoll,
        sscRegistration: userData.sscRegistration,
        sscGpa: userData.sscGpa ? parseFloat(userData.sscGpa) : undefined,
        sscYear: userData.sscYear ? parseInt(userData.sscYear) : undefined,
        sscBoard: userData.sscBoard,
        hscRoll: userData.hscRoll,
        hscRegistration: userData.hscRegistration,
        hscGpa: userData.hscGpa ? parseFloat(userData.hscGpa) : undefined,
        hscYear: userData.hscYear ? parseInt(userData.hscYear) : undefined,
        hscBoard: userData.hscBoard,
      }),
      ...(userData.examPath === "MADRASHA" && {
        dakhilRoll: userData.dakhilRoll,
        dakhilRegistration: userData.dakhilRegistration,
        dakhilGpa: userData.dakhilGpa
          ? parseFloat(userData.dakhilGpa)
          : undefined,
        dakhilYear: userData.dakhilYear
          ? parseInt(userData.dakhilYear)
          : undefined,
        dakhilBoard: userData.dakhilBoard,
        alimRoll: userData.alimRoll,
        alimRegistration: userData.alimRegistration,
        alimGpa: userData.alimGpa ? parseFloat(userData.alimGpa) : undefined,
        alimYear: userData.alimYear ? parseInt(userData.alimYear) : undefined,
        alimBoard: userData.alimBoard,
      }),
    };
    const response = await api.post("/auth/register", backendData);
    if (response.data.status === 200) {
      // Transform backend response to frontend User format
      const backendUser = response.data.user;
      const frontendUser: User = {
        userId: backendUser.studentId,
        userName: backendUser.fullName,
        email: backendUser.email,
        phone: backendUser.phone || "",
        password: "", // Don't store password
        address: backendUser.address || "",
        role: backendUser.role,
        dob: backendUser.dob || "",
        examPath: backendUser.examPath || "",
        medium: backendUser.medium || "",
        sscStream: backendUser.sscStream,
        hscStream: backendUser.hscStream,
        // Academic details
        sscRoll: backendUser.sscRoll,
        sscRegistration: backendUser.sscRegistration,
        sscGpa: backendUser.sscGpa?.toString(),
        sscYear: backendUser.sscYear?.toString(),
        sscBoard: backendUser.sscBoard,
        hscRoll: backendUser.hscRoll,
        hscRegistration: backendUser.hscRegistration,
        hscGpa: backendUser.hscGpa?.toString(),
        hscYear: backendUser.hscYear?.toString(),
        hscBoard: backendUser.hscBoard,
        dakhilRoll: backendUser.dakhilRoll,
        dakhilRegistration: backendUser.dakhilRegistration,
        dakhilGpa: backendUser.dakhilGpa?.toString(),
        dakhilYear: backendUser.dakhilYear?.toString(),
        dakhilBoard: backendUser.dakhilBoard,
        alimRoll: backendUser.alimRoll,
        alimRegistration: backendUser.alimRegistration,
        alimGpa: backendUser.alimGpa?.toString(),
        alimYear: backendUser.alimYear?.toString(),
        alimBoard: backendUser.alimBoard,
      };
      return frontendUser;
    }
    return null;
  } catch (error) {
    console.error("Registration Failed:", error);
    throw error;
  }
};

// Student Login
export const userLogin = async (
  email: string,
  password: string
): Promise<User | null> => {
  try {
    const response = await api.post("/auth/login", { email, password });
    if (response.data.status === 200) {
      localStorage.setItem("accessToken", response.data.access_token);
      const userProfile = await getUserProfile();
      return userProfile;
    }
    return null;
  } catch (error) {
    console.error("Login Failed:", error);
    throw error;
  }
};

// Delete account with password confirmation
export const deleteAccount = async (password: string): Promise<boolean> => {
  try {
    const response = await api.delete("/auth/delete-account", {
      data: { password }
    });
    return response.data.status === 200;
  } catch (error) {
    console.error("Delete Account Failed:", error);
    return false;
  }
};

// Update user email address
export const updateEmail = async (userId: string, newEmail: string): Promise<boolean> => {
  try {
    const response = await api.put("/auth/update-email", {
      userId,
      newEmail
    });
    return response.data.status === 200;
  } catch (error) {
    console.error("Update Email Failed:", error);
    return false;
  }
};

// Change user password
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> => {
  try {
    const response = await api.post("/auth/change-password", {
      userId,
      currentPassword,
      newPassword,
      password_confirmation: newPassword
    });
    return response.data.status === 200;
  } catch (error) {
    console.error("Change Password Failed:", error);
    throw error;
  }
};
