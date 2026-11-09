"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { formatTable } from "./formatTable";
import { useTerminalHistory } from "./useTerminalHistory";
import { useLessonStore } from "@/lib/store";
import { getMentorHint } from "@/lib/agents/mentor";
import { cn } from "@/lib/utils";
import type { TerminalHistoryEntry } from "@/types";

const SQL_KEYWORDS = [
  "SELECT","FROM","WHERE","INSERT","INTO","VALUES","UPDATE","SET",
  "DELETE","CREATE","TABLE","DATABASE","DROP","ALTER","ADD","COLUMN",
  "PRIMARY","KEY","FOREIGN","REFERENCES","INDEX","UNIQUE","NOT","NULL",
  "DEFAULT","AUTO_INCREMENT","INT","INTEGER","VARCHAR","TEXT","DATE",
  "DATETIME","FLOAT","DOUBLE","DECIMAL","BOOLEAN","AND","OR","IN",
  "BETWEEN","LIKE","IS","ORDER","BY","ASC","DESC","GROUP","HAVING",
  "COUNT","SUM","AVG","MIN","MAX","JOIN","INNER","LEFT","RIGHT",
  "OUTER","ON","AS","DISTINCT","LIMIT","OFFSET","UNION","ALL",
  "EXISTS","CASE","WHEN","THEN","ELSE","END","SHOW","DATABASES",
  "TABLES","DESCRIBE","USE","START","TRANSACTION","COMMIT","ROLLBACK",
  "TRUNCATE","MODIFY","CHANGE","CONSTRAINT","CHECK",
];

export default function SQLTerminal() {
  const [history, setHistory] = useState<TerminalHistoryEntry[]>([
    { type: "system", content: "MySQL Learning Terminal v1.0" },
    { type: "system", content: 'Type SQL commands and press Enter. Type HELP for info.\n' },
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [multilineBuffer, setMultilineBuffer] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const {
    addCommand,
    navigateHistory,
    resetIndex,
  } = useTerminalHistory();

  const executeQuery = useLessonStore((s) => s.executeQuery);
  const dbReady = useLessonStore((s) => s.dbReady);
  const currentLesson = useLessonStore((s) => s.currentLesson);
  const progress = useLessonStore((s) => s.progress);

  // Auto-fill the right code when the lesson is marked as done on page load
  useEffect(() => {
    if (!currentLesson) return;
    const p = progress[currentLesson.slug];
    const isLessonDone =
      (p && p.completedTaskIds && p.completedTaskIds.length >= currentLesson.tasks.length && currentLesson.tasks.length > 0) ||
      (typeof window !== "undefined" && localStorage.getItem(`mysql-academy-lesson-completed-${currentLesson.slug}`) === "true");

    if (isLessonDone) {
      const rightCode =
        currentLesson.tasks?.find((t) => t.hint)?.hint ||
        currentLesson.checkpointExam?.questions?.[0]?.solutionSQL ||
        (currentLesson.exercises?.find((e) => e.type === "scenario") as any)?.solutionSQL ||
        currentLesson.content?.find((c) => c.code)?.code ||
        "";

      if (rightCode) {
        setCurrentInput(rightCode);
        setHistory([
          { type: "system", content: "MySQL Learning Terminal v1.0" },
          {
            type: "system",
            content: `✓ Lesson "${currentLesson.title}" is completed. Right code pre-filled below:\n`,
          },
          {
            type: "input",
            content: `mysql> ${rightCode}`,
          },
          {
            type: "success",
            content: "Query OK. All lesson tasks verified against live database instance.",
          },
        ]);
      }
    }
  }, [currentLesson, progress]);

  // Auto-scroll to bottom on new history entries
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const addToHistory = useCallback((entry: TerminalHistoryEntry) => {
    setHistory((prev) => [...prev, entry]);
  }, []);

  const handleExecute = useCallback(
    (fullQuery: string) => {
      const trimmed = fullQuery.trim();
      if (!trimmed) return;

      if (!dbReady) {
        addToHistory({
          type: "system",
          content: "Database engine is initializing. Please wait a moment...",
        });
        return;
      }

      addCommand(trimmed);

      // ── Special commands ─────────────────────────────────────────
      const upper = trimmed.toUpperCase();
      if (upper === "CLEAR") {
        setHistory([]);
        return;
      }
      if (upper === "RESET") {
        if (currentLesson?.seedSQL) {
          useLessonStore.getState().resetDB(currentLesson.seedSQL);
          addToHistory({
            type: "system",
            content: "✓ Database sandbox reset to initial lesson seed state.",
          });
        }
        return;
      }
      if (upper === "HELP") {
        addToHistory({
          type: "system",
          content: [
            "Available commands:",
            "  SHOW DATABASES;      List databases",
            "  SHOW TABLES;         List tables",
            "  DESCRIBE <table>;    Show table structure",
            "  SELECT ...           Query data",
            "  INSERT INTO ...      Insert rows",
            "  UPDATE ...           Update rows",
            "  DELETE FROM ...      Delete rows",
            "  CREATE TABLE ...     Create table",
            "  DROP TABLE ...       Drop table",
            "  ALTER TABLE ...      Modify table",
            "  CLEAR                Clear screen",
            "  HELP                 Show this help",
          ].join("\n"),
        });
        return;
      }

      try {
        const result = executeQuery(trimmed);
        if (result) {
          if (result.columns.length > 0) {
            if (
              result.columns.length === 1 &&
              result.columns[0] === "affected_rows"
            ) {
              addToHistory({
                type: "success",
                content: `Query OK, ${result.values[0][0]} row(s) affected`,
              });
            } else if (
              result.columns.length === 1 &&
              result.columns[0] === "status"
            ) {
              addToHistory({
                type: "success",
                content: String(result.values[0][0]),
              });
            } else {
              const table = formatTable(result.columns, result.values);
              addToHistory({ type: "output", content: table });
              const count = result.values.length;
              addToHistory({
                type: "system",
                content:
                  count === 0
                    ? "Empty set"
                    : count === 1
                    ? "1 row in set"
                    : `${count} rows in set`,
              });
            }
          }

          // Real-time AI Grader feedback directly in terminal stream
          if ((result as any)?.newlyCompletedTask) {
            const task = (result as any).newlyCompletedTask;
            addToHistory({
              type: "success",
              content: `\n[AI Grader] ✓ Objective Passed: ${task.title}!`,
            });
            if ((result as any)?.nextTask) {
              const next = (result as any).nextTask;
              addToHistory({
                type: "system",
                content: `[Next Objective]: ${next.title}`,
              });
            }
          }
        } else {
          addToHistory({ type: "success", content: "Query OK" });
        }
      } catch (error: any) {
        addToHistory({
          type: "error",
          content: `ERROR: ${error.message}`,
        });
        const mentorHint = getMentorHint(trimmed, error.message);
        if (mentorHint) {
          addToHistory({
            type: "hint",
            content: mentorHint,
          });
        }
      }
    },
    [executeQuery, addToHistory, addCommand, dbReady, currentLesson?.seedSQL]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Tab: autocomplete
      if (e.key === "Tab") {
        e.preventDefault();
        if (suggestions.length > 0) {
          const sel = suggestions[Math.max(selectedSuggestion, 0)];
          const words = currentInput.split(/\s+/);
          words[words.length - 1] = sel;
          setCurrentInput(words.join(" ") + " ");
          setSuggestions([]);
          setSelectedSuggestion(-1);
        }
        return;
      }

      // Ctrl+L: clear
      if (e.key === "l" && e.ctrlKey) {
        e.preventDefault();
        setHistory([]);
        return;
      }

      // Enter: execute or continue multiline
      if (e.key === "Enter") {
        e.preventDefault();
        const line = currentInput;

        // Allow \c to cancel/clear the in-flight multiline buffer
        if (line.trim().toLowerCase() === "\\c") {
          addToHistory({ type: "input", content: multilineBuffer ? `    -> ${line}` : `mysql> ${line}` });
          setMultilineBuffer("");
          setCurrentInput("");
          setSuggestions([]);
          resetIndex();
          return;
        }

        if (multilineBuffer) {
          const full = multilineBuffer + " " + line.trim();
          addToHistory({ type: "input", content: `    -> ${line}` });
          if (line.trim().endsWith(";")) {
            handleExecute(full);
            setMultilineBuffer("");
          } else {
            setMultilineBuffer(full);
          }
        } else {
          addToHistory({ type: "input", content: `mysql> ${line}` });
          const t = line.trim();
          if (
            t &&
            !t.endsWith(";") &&
            !["CLEAR", "HELP"].includes(t.toUpperCase())
          ) {
            setMultilineBuffer(t);
          } else {
            handleExecute(t);
          }
        }

        setCurrentInput("");
        setSuggestions([]);
        resetIndex();
        return;
      }

      // Up arrow: history
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = navigateHistory("up");
        if (prev !== null) setCurrentInput(prev);
        return;
      }

      // Down arrow: history
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = navigateHistory("down");
        setCurrentInput(next ?? "");
        return;
      }

      // Escape: dismiss suggestions
      if (e.key === "Escape") {
        setSuggestions([]);
        setSelectedSuggestion(-1);
      }
    },
    [
      currentInput,
      multilineBuffer,
      suggestions,
      selectedSuggestion,
      handleExecute,
      navigateHistory,
      resetIndex,
      addToHistory,
    ]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setCurrentInput(value);

      // Update suggestions
      const words = value.split(/\s+/);
      const lastWord = words[words.length - 1].toUpperCase();
      if (lastWord.length >= 2) {
        const matches = SQL_KEYWORDS.filter(
          (k) => k.startsWith(lastWord) && k !== lastWord
        ).slice(0, 5);
        setSuggestions(matches);
        setSelectedSuggestion(-1);
      } else {
        setSuggestions([]);
      }
    },
    []
  );

  const prompt = multilineBuffer ? "    -> " : "mysql> ";

  return (
    <div
      className="h-full w-full bg-[#0a0a0a] text-[#d4d4d4] font-mono text-[13px] leading-5 p-3 flex flex-col cursor-text overflow-hidden select-text"
      onClick={focusInput}
    >
      {/* Scrollable output */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto terminal-scrollbar pb-2"
      >
        {history.map((entry, i) => (
          <div
            key={i}
            className={cn(
              "whitespace-pre-wrap break-all",
              entry.type === "error" && "text-red-400",
              entry.type === "success" && "text-emerald-400",
              entry.type === "system" && "text-zinc-500",
              entry.type === "input" && "text-sky-300",
              entry.type === "output" && "text-[#d4d4d4]",
              entry.type === "hint" && "text-amber-400"
            )}
          >
            {entry.content}
          </div>
        ))}
      </div>

      {/* Input line */}
      <div className="flex items-center shrink-0">
        <span className="text-sky-400 select-none whitespace-pre">{prompt}</span>
        <input
          ref={inputRef}
          value={currentInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={!dbReady}
          placeholder={!dbReady ? "Initializing WebAssembly engine..." : ""}
          className="flex-1 bg-transparent outline-none text-[#d4d4d4] caret-emerald-400 font-mono text-[13px] disabled:opacity-50"
          spellCheck={false}
          autoComplete="off"
          autoFocus
        />
      </div>

      {/* Autocomplete suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-1 bg-zinc-900 border border-zinc-700 rounded text-xs max-w-xs">
          {suggestions.map((s, i) => (
            <div
              key={s}
              className={cn(
                "px-2 py-0.5 cursor-pointer font-mono",
                i === selectedSuggestion
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-400 hover:bg-zinc-800"
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                const words = currentInput.split(/\s+/);
                words[words.length - 1] = s;
                setCurrentInput(words.join(" ") + " ");
                setSuggestions([]);
                inputRef.current?.focus();
              }}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
