"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked, onCheckedChange, disabled, id, ...props }, ref) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        id={id}
        ref={ref}
        onClick={() => {
          if (!disabled) {
            onCheckedChange(!checked);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!disabled) {
              onCheckedChange(!checked);
            }
          }
        }}
        className={cn(
          "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-emerald-600 dark:bg-emerald-500" : "bg-muted-foreground/30 dark:bg-muted",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-white dark:bg-zinc-100 shadow-md ring-0 transition-transform",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    );
  }
);
Switch.displayName = "Switch";
