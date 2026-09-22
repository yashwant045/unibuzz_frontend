import API from "./api";

/* ---------------- REGISTER USER ---------------- */

export const registerUser = async (data) => {
  try {
    const response = await API.post("/auth/register", data);
    return response.data;
  } catch (error) {
    console.error("Register error:", error);
    throw error.response?.data || "Registration failed";
  }
};

/* ---------------- VERIFY OTP ---------------- */

export const verifyOtp = async (data) => {
  try {
    const response = await API.post("/auth/verify-otp", data);
    return response.data;
  } catch (error) {
    console.error("Verify OTP error:", error);
    throw error.response?.data || "OTP verification failed";
  }
};

/* ---------------- RESEND OTP ---------------- */

export const resendOtp = async (email) => {
  try {
    const response = await API.post("/auth/resend-otp", { email });
    return response.data;
  } catch (error) {
    console.error("Resend OTP error:", error);
    throw error.response?.data || "Failed to resend OTP";
  }
};

/* ---------------- FORGOT PASSWORD ---------------- */

export const forgotPassword = async (email) => {
  try {
    const response = await API.post("/auth/forgot-password", { email });
    return response.data;
  } catch (error) {
    console.error("Forgot password error:", error);
    throw error.response?.data || "Failed to request password reset";
  }
};

/* ---------------- RESET PASSWORD ---------------- */

export const resetPassword = async (data) => {
  try {
    const response = await API.post("/auth/reset-password", data);
    return response.data;
  } catch (error) {
    console.error("Reset password error:", error);
    throw error.response?.data || "Failed to reset password";
  }
};

/* ---------------- LOGIN USER ---------------- */

export const loginUser = async (data) => {
  try {
    const response = await API.post("/auth/login", data);
    const token = response.data;
    // save token
    localStorage.setItem("token", token);
    return token;
  } catch (error) {
    console.error("Login error:", error);
    throw error.response?.data || "Login failed";
  }
};

/* ---------------- LOGOUT ---------------- */

export const logoutUser = () => {
  localStorage.removeItem("token");
};