import { useState } from "react";
import { LogIn, Lock, User, Eye, EyeOff, Globe } from "lucide-react";

export function Login() {
  const [showPw, setShowPw] = useState(false);
  const [lang, setLang] = useState("EN");

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg, #0d6efd 0%, #0a58ca 50%, #084298 100%)" }}
    >
      {/* Language Selector */}
      <div className="flex gap-2 mb-8">
        {["EN", "FR", "PT"].map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
              lang === l
                ? "bg-white text-blue-700 border-white"
                : "bg-transparent text-white border-white/40 hover:border-white/80"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-2xl"
          style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}
        >
          <LogIn size={36} color="white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Welcome Back</h1>
        <p className="text-sm text-white/75">Sign in to PIU Management</p>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-2xl shadow-2xl p-7"
        style={{ background: "rgba(255,255,255,0.98)" }}
      >
        {/* Username */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-700 mb-2">Username</label>
          <div className="flex items-center border-2 border-gray-100 rounded-xl px-3 bg-gray-50 focus-within:border-blue-500 transition-colors">
            <User size={16} className="text-gray-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Enter your username"
              className="flex-1 h-12 bg-transparent text-sm text-gray-800 outline-none"
              defaultValue="admin"
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-700 mb-2">Password</label>
          <div className="flex items-center border-2 border-gray-100 rounded-xl px-3 bg-gray-50 focus-within:border-blue-500 transition-colors">
            <Lock size={16} className="text-gray-400 mr-2 flex-shrink-0" />
            <input
              type={showPw ? "text" : "password"}
              placeholder="Enter your password"
              className="flex-1 h-12 bg-transparent text-sm text-gray-800 outline-none"
              defaultValue="••••••••"
            />
            <button onClick={() => setShowPw(!showPw)} className="text-gray-400 hover:text-gray-600 transition-colors">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Button */}
        <button
          className="w-full h-13 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-opacity"
          style={{
            background: "linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)",
            height: "52px",
            boxShadow: "0 4px 15px rgba(13,110,253,0.4)",
          }}
        >
          <LogIn size={18} />
          Sign In
        </button>
      </div>

      <p className="text-white/60 text-xs mt-8">ROMEOT Digital M&E System</p>
    </div>
  );
}
