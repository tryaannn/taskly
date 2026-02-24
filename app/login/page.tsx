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
    icon: <CheckSquare className="h-5 w-5" />,
    text: "Task management multi-user yang terisolasi",
  },
  {
    icon: <Zap className="h-5 w-5" />,
    text: "Filter, sort & prioritas tugas secara instan",
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    text: "Statistik produktivitas real-time",
  },
  {
    icon: <Shield className="h-5 w-5" />,
    text: "Data tersimpan aman di browsermu",
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
        className="hidden lg:flex flex-col justify-between bg-brand-black text-white w-120 shrink-0 p-12"
      >
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2 mb-16">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-blue" />
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
              <span className="text-brand-blue">mulai hari ini.</span>
            </h1>
            <p className="text-white/60 text-base leading-relaxed">
              Taskly membantu kamu fokus pada hal yang penting — bukan sibuk
              mengatur sistem.
            </p>
          </motion.div>

          {/* Features */}
          <motion.ul
            className="mt-10 space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: { staggerChildren: 0.1, delayChildren: 0.4 },
              },
              hidden: {},
            }}
          >
            {features.map((f, i) => (
              <motion.li
                key={i}
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  visible: { opacity: 1, x: 0 },
                }}
                className="flex items-center gap-3 text-sm text-white/70"
              >
                <span className="text-brand-blue shrink-0">{f.icon}</span>
                {f.text}
              </motion.li>
            ))}
          </motion.ul>
        </div>

        <p className="text-white/30 text-xs">
          © {new Date().getFullYear()} Taskly. All rights reserved.
        </p>
      </motion.div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="h-2 w-2 rounded-full bg-brand-blue" />
            <span className="text-xl font-bold text-brand-black">Taskly</span>
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
