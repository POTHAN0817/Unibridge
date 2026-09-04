export * from "./types/index";

// Backward compatibility legacy Page type if needed
export type Page =
  | "landing"
  | "role-select"
  | "citizen-dashboard"
  | "report-challenge"
  | "ai-analysis"
  | "gov-command"
  | "university-dashboard"
  | "project-workspace"
  | "impact";
