import { useCallback, useRef, useState } from "react";

/**
 * Hook for managing terminal command history with Up/Down navigation.
 */
export function useTerminalHistory() {
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const indexRef = useRef<number>(-1);

  const addCommand = useCallback((cmd: string) => {
    setCommandHistory((prev) => {
      // Avoid duplicates at the end
      if (prev.length > 0 && prev[prev.length - 1] === cmd) return prev;
      return [...prev, cmd];
    });
    indexRef.current = -1; // reset index
  }, []);

  const navigateHistory = useCallback(
    (direction: "up" | "down"): string | null => {
      const history = commandHistory;
      if (history.length === 0) return null;

      if (direction === "up") {
        if (indexRef.current === -1) {
          indexRef.current = history.length - 1;
        } else if (indexRef.current > 0) {
          indexRef.current -= 1;
        }
        return history[indexRef.current] ?? null;
      } else {
        if (indexRef.current === -1) return null;
        if (indexRef.current < history.length - 1) {
          indexRef.current += 1;
          return history[indexRef.current];
        } else {
          indexRef.current = -1;
          return null;
        }
      }
    },
    [commandHistory]
  );

  const resetIndex = useCallback(() => {
    indexRef.current = -1;
  }, []);

  return { commandHistory, addCommand, navigateHistory, resetIndex };
}
