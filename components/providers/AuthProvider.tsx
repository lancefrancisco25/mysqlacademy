"use client";

import { useEffect, ReactNode } from "react";
import { useLessonStore } from "@/lib/store";

export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Rehydrate local progress after React hydration has completed cleanly
    useLessonStore.getState().rehydrateProgress();
    const cleanup = useLessonStore.getState().initAuth();
    return () => {
      if (typeof cleanup === "function") {
        cleanup();
      }
    };
  }, []);

  return <>{children}</>;
}
