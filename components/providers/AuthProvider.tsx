"use client";

import { useEffect, ReactNode } from "react";
import { useLessonStore } from "@/lib/store";

export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const cleanup = useLessonStore.getState().initAuth();
    return () => {
      if (typeof cleanup === "function") {
        cleanup();
      }
    };
  }, []);

  return <>{children}</>;
}
