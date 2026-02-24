"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-(--text-primary) mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary)">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              "w-full h-10 rounded-lg border border-(--border-default) bg-(--bg-card) px-3 text-sm text-(--text-primary) placeholder:text-(--text-secondary)",
              "focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all duration-150",
              "disabled:bg-(--bg-surface) disabled:cursor-not-allowed",
              error && "border-brand-danger focus:ring-brand-danger",
              !!leftIcon && "pl-9",
              !!rightIcon && "pr-9",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-secondary)">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs text-brand-danger">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
