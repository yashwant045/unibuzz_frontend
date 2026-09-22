import React, { useState } from "react";
import { MoveRight, KeyRound, Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import { loginUser, forgotPassword, resetPassword } from "@/services/authService";

export default function Login({ role, InputField, onLoginSuccess }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [mode, setMode] = useState("login"); // 'login' | 'forgot' | 'reset'
  const [loading, setLoading] = useState(false);

  // handle login form submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");
    setLoading(true);

    try {

      const token = await loginUser({
        email,
        password,
      });

      // send token back to Auth.jsx
      onLoginSuccess(token);

    } catch (error) {
      console.error("Caught login error:", error);
      let message = "Login failed. Please check your credentials.";
      
      if (typeof error === 'string') {
        message = error;
      } else if (error?.message) {
        message = error.message;
      } else if (error?.error) {
        message = error.error;
      }
      
      // Prevent HTML responses from bleeding into the UI
      if (typeof message === 'string' && message.includes('<!DOCTYPE html>')) {
        message = "Login failed. Invalid credentials or user not found.";
      }
      
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  // handle forgot password request
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");
    setLoading(true);

    try {
      const msg = await forgotPassword(email);
      setInfoMsg(msg || "A 6-digit code has been sent to your email.");
      setMode("reset");
    } catch (error) {
      setErrorMsg(typeof error === 'string' ? error : error?.message || "Failed to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  // handle password reset submit
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");
    setLoading(true);

    try {
      const msg = await resetPassword({ email, otp, newPassword });
      setInfoMsg(msg || "Password reset successfully!");
      setTimeout(() => {
        setMode("login");
        setPassword("");
        setOtp("");
        setNewPassword("");
      }, 1500);
    } catch (error) {
      setErrorMsg(typeof error === 'string' ? error : error?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "forgot") {
    return (
      <div className="animate-in fade-in slide-in-from-left-4 duration-500 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-full bg-rose-500/10 text-rose-400 mb-1 border border-rose-500/20">
            <Mail size={24} />
          </div>
          <h3 className="text-lg font-bold text-white tracking-wide">
            Forgot Password
          </h3>
          <p className="text-xs font-mono text-zinc-400">
            Enter your registered email to receive a 6-digit reset code.
          </p>
        </div>

        <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
          <InputField
            placeholder="EMAIL ADDRESS"
            type="email"
            name="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-mono text-center">
              {typeof errorMsg === 'string' ? errorMsg : "Request failed."}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
              role === "student" ? "bg-indigo-600 hover:brightness-110" : "bg-orange-600 hover:brightness-110"
            }`}
          >
            {loading ? "Sending..." : "Send Reset Code"}
            <MoveRight size={18} />
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg("");
              setInfoMsg("");
            }}
            className="w-full py-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeft size={13} />
            Back to Login
          </button>
        </form>
      </div>
    );
  }

  if (mode === "reset") {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-full bg-rose-500/10 text-rose-400 mb-1 border border-rose-500/20">
            <KeyRound size={24} />
          </div>
          <h3 className="text-lg font-bold text-white tracking-wide">
            Reset Your Password
          </h3>
          <p className="text-xs font-mono text-zinc-400">
            Enter the code sent to <span className="text-rose-400 font-bold">{email}</span>
          </p>
        </div>

        <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest ml-1 mb-2 block">
              6-Digit Reset Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-center text-2xl font-mono tracking-[0.5em] text-rose-400 focus:outline-none focus:border-rose-500 transition-colors"
              required
            />
          </div>

          <div>
            <InputField
              placeholder="NEW PASSWORD"
              type="password"
              name="newPassword"
              value={newPassword}
              required
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <p className="text-[10px] font-mono text-zinc-500 ml-1 mt-1">
              Min 6 chars with 1 uppercase, 1 lowercase & 1 special char (e.g. Pass@123)
            </p>
          </div>

          {infoMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs font-mono text-center flex items-center justify-center gap-2">
              <CheckCircle2 size={14} />
              <span>{infoMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-mono text-center">
              {typeof errorMsg === 'string' ? errorMsg : "Reset failed."}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
              loading || otp.length !== 6
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : role === "student" ? "bg-indigo-600 hover:brightness-110" : "bg-orange-600 hover:brightness-110"
            }`}
          >
            {loading ? "Resetting..." : "Update Password"}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg("");
              setInfoMsg("");
            }}
            className="w-full py-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeft size={13} />
            Back to Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">

      <form className="space-y-6" onSubmit={handleLoginSubmit}>

        <InputField
          placeholder="EMAIL ADDRESS"
          type="email"
          name="email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />

        <div>
          <InputField
            placeholder="PASSWORD"
            type="password"
            name="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={() => {
                setMode("forgot");
                setErrorMsg("");
                setInfoMsg("");
              }}
              className="text-xs font-mono text-zinc-400 hover:text-indigo-400 transition-colors"
            >
              Forgot password?
            </button>
          </div>
        </div>

        {infoMsg && (
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-300 text-sm font-mono text-center flex items-center justify-center gap-2">
            <CheckCircle2 size={14} />
            <span>{infoMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-mono text-center">
            {typeof errorMsg === 'string' ? errorMsg : "Login failed."}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all transform hover:brightness-110 active:scale-[0.98] group ${
            role === "student" ? "bg-indigo-600" : "bg-orange-600"
          }`}
        >
          {loading ? "Signing In..." : "Sign In"}

          <MoveRight
            size={18}
            className="group-hover:translate-x-1 transition-transform"
          />

        </button>

      </form>

    </div>
  );
}