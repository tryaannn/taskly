"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CheckSquare, Zap, Shield, BarChart3 } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { useAuth } from "@/hooks/useAuth";

const features = [
  {
    icon: <CheckSquare className="h-4 w-4" />,
    text: "Task management multi-user yang terisolasi",
  },
  {
    icon: <Zap className="h-4 w-4" />,
    text: "Filter, sort & prioritas tugas secara instan",
  },
  {
    icon: <BarChart3 className="h-4 w-4" />,
    text: "Statistik produktivitas real-time",
  },
  {
    icon: <Shield className="h-4 w-4" />,
    text: "Data tersimpan aman dengan enkripsi penuh",
  },
];

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const { handleLogin, handleRegister, loading } = useAuth();
  const router = useRouter();

  const onLogin = async (email: string, password: string) => {
    const result = await handleLogin(email, password);
    if (result.success) router.push("/dashboard");
    return result;
  };

  const onRegister = async (name: string, email: string, password: string) => {
    const result = await handleRegister(name, email, password);
    if (result.success) router.push("/dashboard");
    return result;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex flex-col justify-between bg-brand-black text-white w-[440px] shrink-0 p-12 relative overflow-hidden"
      >
        {/* Decorative gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-brand-blue opacity-10 blur-3xl" />
          <div className="absolute bottom-20 right-0 w-80 h-80 rounded-full bg-violet-600 opacity-8 blur-3xl" />
          {/* Dot grid pattern */}
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.04]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="dots"
                x="0"
                y="0"
                width="24"
                height="24"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-blue to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-black text-sm tracking-tight">
                T
              </span>
            </div>
            <span className="text-2xl font-bold tracking-tight">Taskly</span>
          </div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Produktivitas tanpa batas,
              <br />
              <span className="bg-linear-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                mulai hari ini.
              </span>
            </h1>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Taskly membantu kamu fokus pada hal yang penting — bukan sibuk
              mengatur sistem.
            </p>
          </motion.div>

          {/* Feature list */}
          <motion.ul
            className="mt-10 space-y-3"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: { staggerChildren: 0.09, delayChildren: 0.4 },
              },
              hidden: {},
            }}
          >
            {features.map((f, i) => (
              <motion.li
                key={i}
                variants={{
                  hidden: { opacity: 0, x: -12 },
                  visible: { opacity: 1, x: 0 },
                }}
                className="flex items-center gap-3"
              >
                <span className="h-7 w-7 rounded-lg bg-white/10 flex items-center justify-center text-blue-400 shrink-0">
                  {f.icon}
                </span>
                <span className="text-sm text-white/65">{f.text}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        <p className="relative z-10 text-white/25 text-xs">
          © {new Date().getFullYear()} Taskly. All rights reserved.
        </p>
      </motion.div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-(--bg-page) p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-brand-blue to-violet-600 flex items-center justify-center">
              <span className="text-white font-black text-xs">T</span>
            </div>
            <span className="text-xl font-bold text-(--text-primary)">
              Taskly
            </span>
          </div>

          <AnimatePresence mode="wait">
            {mode === "login" ? (
              <LoginForm
                key="login"
                onSwitch={() => setMode("register")}
                onLogin={onLogin}
                loading={loading}
              />
            ) : (
              <RegisterForm
                key="register"
                onSwitch={() => setMode("login")}
                onRegister={onRegister}
                loading={loading}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
