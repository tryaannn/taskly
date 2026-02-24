"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type AuthResult = { success: boolean; error?: string };

interface LoginFormProps {
  onSwitch: () => void;
  onLogin: (email: string, password: string) => Promise<AuthResult>;
  loading?: boolean;
}

export function LoginForm({
  onSwitch,
  onLogin,
  loading = false,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = "Email wajib diisi.";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Format email tidak valid.";
    if (!password) e.password = "Kata sandi wajib diisi.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const result = await onLogin(email, password);
    setSubmitting(false);
    if (!result.success) {
      setErrors({ general: result.error });
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
    >
      <div>
        <h2 className="text-2xl font-bold text-(--text-primary)">
          Masuk ke Taskly
        </h2>
        <p className="text-sm text-(--text-secondary) mt-1">
          Lanjutkan produktivitas kamu hari ini.
        </p>
      </div>

      {errors.general && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-brand-danger">
          {errors.general}
        </div>
      )}

      <Input
        id="login-email"
        type="email"
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="kamu@email.com"
        error={errors.email}
        leftIcon={<Mail className="h-4 w-4" />}
        autoComplete="email"
      />

      <Input
        id="login-password"
        type={showPass ? "text" : "password"}
        label="Kata Sandi"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        error={errors.password}
        leftIcon={<Lock className="h-4 w-4" />}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            className="hover:text-brand-black"
          >
            {showPass ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        }
        autoComplete="current-password"
      />

      <Button
        type="submit"
        size="lg"
        loading={submitting || loading}
        className="mt-1 w-full"
      >
        Masuk
      </Button>

      <p className="text-sm text-center text-(--text-secondary)">
        Belum punya akun?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-brand-blue font-medium hover:underline"
        >
          Daftar sekarang
        </button>
      </p>
    </motion.form>
  );
}
