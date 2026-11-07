declare module "sql.js" {
  export interface QueryExecResult {
    columns: string[];
    values: (string | number | null)[][];
  }

  export interface Database {
    run(sql: string, params?: unknown[]): Database;
    exec(sql: string, params?: unknown[]): QueryExecResult[];
    getRowsModified(): number;
    close(): void;
    export(): Uint8Array;
  }

  export interface SqlJsConfig {
    locateFile?: (url: string, scriptDirectory?: string) => string;
    wasmBinary?: ArrayBuffer;
  }

  export interface SqlJsStatic {
    Database: new (data?: ArrayLike<number> | Buffer | null) => Database;
  }

  export default function initSqlJs(config?: SqlJsConfig): Promise<SqlJsStatic>;
}
