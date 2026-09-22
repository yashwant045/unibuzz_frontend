import React, { useState } from "react";
import { MoveRight, Mail, KeyRound, CheckCircle2, RefreshCw } from "lucide-react";
import { registerUser, verifyOtp, resendOtp } from "@/services/authService";

export default function Register({
  role,
  interestOptions,
  interests,
  toggleInterest,
  InputField,
  onRegisterSuccess,
}) {

  const [formData, setFormData] = useState({});
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [step, setStep] = useState("register"); // 'register' | 'verify'
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");
    setLoading(true);

    try {

      const data = {
        ...formData,
        role,
        interests,
      };

      await registerUser(data);
      
      if (role === "student") {
        localStorage.setItem("studentInterests", JSON.stringify(interests));
      }

      setStep("verify");
      setInfoMsg(`A 6-digit verification code has been sent to ${formData.email}.`);

    } catch (error) {
      console.error("Caught registration error:", error);
      let message = "Registration failed. Please check your details.";
      
      if (typeof error === 'string') {
        message = error;
      } else if (typeof error?.message === 'string' && !error.message.includes('Validation failed')) {
        message = error.message;
      } else if (typeof error?.error === 'string' && error.error !== 'Bad Request') {
        message = error.error;
      }
      
      if (typeof message === 'string' && message.includes('<!DOCTYPE html>')) {
        message = "Registration failed.";
      }
      
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");
    setLoading(true);

    try {
      await verifyOtp({ email: formData.email, otp });
      setInfoMsg("Email verified successfully! Redirecting to login...");
      setTimeout(() => {
        if (onRegisterSuccess) {
          onRegisterSuccess();
        }
      }, 1500);
    } catch (error) {
      setErrorMsg(typeof error === 'string' ? error : error?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setErrorMsg("");
    setInfoMsg("");
    setLoading(true);
    try {
      const msg = await resendOtp(formData.email);
      setInfoMsg(msg || "A new 6-digit code has been sent to your email.");
    } catch (error) {
      setErrorMsg(typeof error === 'string' ? error : error?.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  if (step === "verify") {
    return (
      <form
        onSubmit={handleVerifyOtp}
        className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-full bg-indigo-500/10 text-indigo-400 mb-2 border border-indigo-500/20">
            <Mail size={28} />
          </div>
          <h3 className="text-xl font-bold text-white tracking-wide">
            Verify Your Email
          </h3>
          <p className="text-xs font-mono text-zinc-400">
            Enter the 6-digit code sent to{" "}
            <span className="text-indigo-400 font-bold">{formData.email}</span>
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest ml-1 mb-2 block">
              6-Digit Verification Code
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-center text-2xl font-mono tracking-[0.5em] text-indigo-400 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            </div>
          </div>
        </div>

        {infoMsg && (
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-300 text-xs font-mono text-center flex items-center justify-center gap-2">
            <CheckCircle2 size={14} />
            <span>{infoMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-mono text-center">
            {typeof errorMsg === 'string' ? errorMsg : "Verification failed."}
          </div>
        )}

        <div className="space-y-3">
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
              loading || otp.length !== 6
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : role === "student" ? "bg-indigo-600 hover:brightness-110" : "bg-orange-600 hover:brightness-110"
            }`}
          >
            {loading ? "Verifying..." : "Verify & Access"}
          </button>

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={loading}
            className="w-full py-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Resend Verification Code
          </button>
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-in fade-in slide-in-from-left-4 duration-500 space-y-6"
    >

      <div className="space-y-4">

        <InputField
          placeholder="FULL NAME"
          name="fullName"
          onChange={handleChange}
        />

        <InputField
          placeholder="EMAIL ADDRESS"
          type="email"
          name="email"
          onChange={handleChange}
        />

        <div>
          <InputField
            placeholder="PASSWORD"
            type="password"
            name="password"
            onChange={handleChange}
          />
          <p className="text-[10px] font-mono text-zinc-500 ml-1 mt-1">
            Min 6 chars with 1 uppercase, 1 lowercase & 1 special char (e.g. Pass@123)
          </p>
        </div>

        {role === "student" ? (

          <div className="grid grid-cols-2 gap-4 animate-in zoom-in-95 duration-300">

            <InputField
              placeholder="ENROLLMENT NUMBER"
              name="enrollmentNumber"
              onChange={handleChange}
            />

            <InputField
              placeholder="PHONE NUMBER"
              name="phoneNumber"
              onChange={handleChange}
            />

            <InputField
              placeholder="DEPARTMENT"
              name="department"
              onChange={handleChange}
            />

            <InputField
              placeholder="SECTION"
              name="section"
              onChange={handleChange}
            />

            <InputField
              placeholder="YEAR"
              name="year"
              onChange={handleChange}
            />

            <div className="col-span-2 mt-2">

              <label className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest ml-1 mb-3 block">
                Select Interests
              </label>

              <div className="grid grid-cols-3 gap-2">

                {interestOptions.map((opt) => (

                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleInterest(opt.id)}
                    className={`py-3 rounded-xl border text-center transition-all ${
                      interests.includes(opt.id)
                        ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                        : "border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:border-zinc-700"
                    }`}
                  >

                    <div className="text-lg mb-1">{opt.icon}</div>

                    <div className="text-[9px] font-black uppercase tracking-tighter">
                      {opt.label}
                    </div>

                  </button>

                ))}

              </div>

            </div>

          </div>

        ) : (

          <div className="space-y-4 animate-in zoom-in-95 duration-300">

            <InputField
              placeholder="DESIGNATION"
              name="designation"
              onChange={handleChange}
            />

            <InputField
              placeholder="DEPARTMENT"
              name="department"
              onChange={handleChange}
            />

            <InputField
              placeholder="AREA OF EXPERTISE"
              name="expertise"
              onChange={handleChange}
            />

            <InputField
              placeholder="CABIN / OFFICE LOCATION"
              name="officeLocation"
              onChange={handleChange}
            />

          </div>

        )}

      </div>

      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-mono text-center">
          {typeof errorMsg === 'string' ? errorMsg : "Registration failed."}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all transform hover:brightness-110 active:scale-[0.98] group ${
          role === "student" ? "bg-indigo-600" : "bg-orange-600"
        }`}
      >
        {loading ? "Creating Account..." : "Create Account"}

        <MoveRight
          size={18}
          className="group-hover:translate-x-1 transition-transform"
        />

      </button>

    </form>
  );
}