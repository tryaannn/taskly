"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type AuthResult = { success: boolean; error?: string };

interface RegisterFormProps {
  onSwitch: () => void;
  onRegister: (
    name: string,
    email: string,
    password: string
  ) => Promise<AuthResult>;
  loading?: boolean;
}

export function RegisterForm({
  onSwitch,
  onRegister,
  loading = false,
}: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Nama wajib diisi.";
    if (!email.trim()) e.email = "Email wajib diisi.";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Format email tidak valid.";
    if (!password) e.password = "Kata sandi wajib diisi.";
    else if (password.length < 6) e.password = "Minimal 6 karakter.";
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
    const result = await onRegister(name, email, password);
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
        <h2 className="text-2xl font-bold text-brand-black">Buat Akun Baru</h2>
        <p className="text-sm text-brand-muted mt-1">
          Gratis. Tidak perlu kartu kredit.
        </p>
      </div>

      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-brand-danger">
          {errors.general}
        </div>
      )}

      <Input
        id="reg-name"
        type="text"
        label="Nama Lengkap"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Budi Santoso"
        error={errors.name}
        leftIcon={<User className="h-4 w-4" />}
        autoComplete="name"
      />

      <Input
        id="reg-email"
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
        id="reg-password"
        type={showPass ? "text" : "password"}
        label="Kata Sandi"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Min. 6 karakter"
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
        autoComplete="new-password"
      />

      <Button
        type="submit"
        size="lg"
        loading={submitting || loading}
        className="mt-1 w-full"
      >
        Buat Akun
      </Button>

      <p className="text-sm text-center text-brand-muted">
        Sudah punya akun?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-brand-blue font-medium hover:underline"
        >
          Masuk di sini
        </button>
      </p>
    </motion.form>
  );
}
