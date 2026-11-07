"use client";

import { useLessonStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  Table,
  KeyRound,
  Hash,
  Type,
  ChevronDown,
  ChevronRight,
  Database,
  Rows3,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { TableInfo, QueryResult } from "@/types";

export function SchemaViewer() {
  const tables = useLessonStore((s) => s.tables);

  if (tables.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center space-y-2">
          <Database className="h-8 w-8 mx-auto opacity-50" />
          <p className="text-sm">No tables yet</p>
          <p className="text-xs opacity-60">
            Create a table in the terminal to see it here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-3 space-y-2 terminal-scrollbar">
      <div className="flex items-center gap-2 mb-3">
        <Database className="h-4 w-4 text-emerald-500" />
        <h3 className="text-sm font-semibold">mysql_tutorial</h3>
        <span className="text-xs text-muted-foreground">
          ({tables.length} table{tables.length !== 1 ? "s" : ""})
        </span>
      </div>

      {tables.map((table) => (
        <TableCard key={table.name} table={table} />
      ))}
    </div>
  );
}

function TableCard({ table }: { table: TableInfo }) {
  const [expanded, setExpanded] = useState(true);
  const [showData, setShowData] = useState(false);
  const getTableRows = useLessonStore((s) => s.getTableRows);
  const [data, setData] = useState<QueryResult | null>(null);

  useEffect(() => {
    if (showData) {
      setData(getTableRows(table.name));
    }
  }, [showData, table.rowCount, table.name, getTableRows]);

  const toggleData = () => {
    if (!showData) {
      setData(getTableRows(table.name));
    }
    setShowData(!showData);
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent/50 transition-colors text-left"
      >
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        <Table className="h-3.5 w-3.5 text-sky-400" />
        <span className="text-sm font-medium font-mono">{table.name}</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {table.rowCount} row{table.rowCount !== 1 ? "s" : ""}
        </span>
      </button>

      {/* Columns */}
      {expanded && (
        <div className="border-t border-border">
          <div className="divide-y divide-border/50">
            {table.columns.map((col) => (
              <div
                key={col.cid}
                className="flex items-center gap-2 px-3 py-1.5 text-xs"
              >
                {col.pk ? (
                  <KeyRound className="h-3 w-3 text-amber-500 shrink-0" />
                ) : (
                  <Hash className="h-3 w-3 text-muted-foreground shrink-0" />
                )}
                <span className="font-mono font-medium">{col.name}</span>
                <span className="text-muted-foreground ml-auto font-mono">
                  {col.type || "TEXT"}
                </span>
                {col.notnull ? (
                  <span className="text-red-400 text-[10px]">NOT NULL</span>
                ) : null}
              </div>
            ))}
          </div>

          {/* Data preview toggle */}
          <button
            onClick={toggleData}
            className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs text-sky-400 hover:bg-sky-500/10 transition-colors border-t border-border"
          >
            <Rows3 className="h-3 w-3" />
            {showData ? "Hide data" : "Preview data"}
          </button>

          {/* Data preview */}
          {showData && data && (
            <div className="border-t border-border overflow-x-auto">
              {data.values.length === 0 ? (
                <p className="text-xs text-muted-foreground p-3">
                  No rows
                </p>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/30">
                      {data.columns.map((col) => (
                        <th
                          key={col}
                          className="px-2 py-1 text-left font-mono font-medium text-muted-foreground"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.values.slice(0, 10).map((row, ri) => (
                      <tr
                        key={ri}
                        className="border-t border-border/30 hover:bg-accent/30"
                      >
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            className={cn(
                              "px-2 py-1 font-mono",
                              cell === null && "text-zinc-500 italic"
                            )}
                          >
                            {cell === null ? "NULL" : String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {data.values.length > 10 && (
                <p className="text-[10px] text-muted-foreground px-2 py-1">
                  Showing first 10 of {data.values.length} rows
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
