/** Possible top-level types */
export enum ValueType {
  object = "object",
  string = "string",
  number = "number",
  array = "array",
  boolean = "boolean",
  null = "null",
}

/** Current parser status; updated by all read functions */
export interface ParseStatus {
  input: Uint8Array;
  cursor: number;
  topLevel?: ValueType;
}
