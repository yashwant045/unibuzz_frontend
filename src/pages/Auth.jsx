import React, { useState } from "react";
import { GraduationCap, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Login from "@/components/auth/Login";
import Register from "@/components/auth/Register";

export default function Auth() {

  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("student");
  const [interests, setInterests] = useState([]);

  const interestOptions = [
    { id: "ai", label: "AI & ML", icon: "🤖" },
    { id: "web", label: "Web Dev", icon: "🌐" },
    { id: "cyber", label: "Security", icon: "🔐" },
    { id: "ds", label: "Data Sci", icon: "📊" },
    { id: "cloud", label: "Cloud", icon: "☁️" },
    { id: "uiux", label: "UI/UX", icon: "🎨" },
  ];

  const toggleInterest = (id) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // 🔥 LOGIN SUCCESS HANDLER (FINAL FIX)
  const handleLoginSuccess = (token) => {

    localStorage.setItem("token", token);

    try {
      // decode JWT
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userRole = payload.role;

      console.log("Logged in as:", userRole);

      // 🔥 ROLE BASED NAVIGATION
      if (userRole === "STUDENT") {
        navigate("/dashboard/student");
      } 
      else if (userRole === "FACULTY") {
        navigate("/dashboard/faculty");
      } 
      else {
        navigate("/");
      }

    } catch (error) {
      console.error("Invalid token", error);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 md:p-8 font-sans">

      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative bg-zinc-950/50 border border-zinc-800 shadow-2xl rounded-[32px] w-full max-w-5xl flex flex-col md:flex-row overflow-hidden min-h-[700px]">

        {/* LEFT SIDE */}
        <div className="relative hidden md:flex md:w-2/5 p-12 flex-col justify-between text-white bg-orange-400">

          <img
            src={
              role === "student"
                ? "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800"
                : "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800"
            }
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
            alt="Campus"
          />

          <div className="relative z-10">
            <h1 className="text-4xl font-black tracking-tighter">
              UNIBUZZ
            </h1>
          </div>

          <div className="relative z-10 bg-black/20 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            <p className="text-xs font-mono tracking-widest uppercase opacity-70 mb-2">
              System Status
            </p>

            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-bold">
                Engine Operational
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 p-8 md:p-14 flex flex-col bg-zinc-950">

          <div className="w-full max-w-md mx-auto flex flex-col h-full">

            {/* HEADER */}
            <header className="mb-8">

              <h2 className="text-3xl font-bold text-white tracking-tight">
                {isLogin ? "Welcome back" : "Join Unibuzz"}
              </h2>

              {/* ROLE SELECT */}
              {!isLogin && (
                <div className="mt-8 flex p-1 bg-zinc-900 border border-zinc-800 rounded-2xl">

                  <RoleTab
                    active={role === "student"}
                    onClick={() => setRole("student")}
                    icon={<GraduationCap size={16} />}
                    label="Student"
                    color="indigo"
                  />

                  <RoleTab
                    active={role === "faculty"}
                    onClick={() => setRole("faculty")}
                    icon={<Briefcase size={16} />}
                    label="Faculty"
                    color="orange"
                  />

                </div>
              )}

            </header>

            {/* FORM */}
            <div className="flex-grow overflow-y-auto pr-2">

              {isLogin ? (
                <div className="flex flex-col justify-center min-h-[300px]">
                  <Login
                    role={role}
                    InputField={DarkInputField}
                    onLoginSuccess={handleLoginSuccess}
                  />
                </div>
              ) : (
                <Register
                  role={role}
                  interestOptions={interestOptions}
                  interests={interests}
                  toggleInterest={toggleInterest}
                  InputField={DarkInputField}
                  onRegisterSuccess={() => setIsLogin(true)}
                />
              )}

            </div>

            {/* FOOTER */}
            <footer className="mt-8 pt-6 border-t border-zinc-900 text-center">

              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-zinc-500 hover:text-white text-sm transition-colors underline underline-offset-8 decoration-zinc-700 hover:decoration-white"
              >
                {isLogin
                  ? "No account? Register here"
                  : "Already registered? Sign in"}
              </button>

            </footer>

          </div>

        </div>
      </div>
    </div>
  );
}

/* INPUT COMPONENT */
function DarkInputField({ ...props }) {
  return (
    <div className="relative group w-full">
      <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-[0.15em] ml-1 mb-2 block group-focus-within:text-zinc-300">
        {props.placeholder}
      </label>

      <input
        {...props}
        placeholder=""
        className="w-full bg-zinc-900/40 border border-zinc-800/80 rounded-xl py-3.5 px-4 outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-500 transition-all text-sm text-white font-mono"
      />
    </div>
  );
}

/* ROLE TAB */
function RoleTab({ active, onClick, icon, label, color }) {

  const activeStyles =
    color === "indigo"
      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
      : "bg-orange-500 text-white shadow-lg shadow-orange-500/20";

  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
        active
          ? activeStyles
          : "text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {icon} {label}
    </button>
  );
}