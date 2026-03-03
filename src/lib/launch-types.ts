export type LaunchLogLevel = "info" | "warning" | "error";

export interface LaunchLogEntry {
  at: string;
  level: LaunchLogLevel;
  step: string;
  message: string;
}

export type DatabaseMode =
  | "vercel_supabase_integration"
  | "supabase_direct"
  | "external_postgres";

export interface SupabaseLaunchInput {
  organizationId?: string;
  region?: string;
  databasePassword?: string;
  existingResourceId?: string;
}

export interface LaunchRequestBody {
  brandName: string;
  projectName?: string;
  gitRepo: string;
  gitBranch: string;
  vercelTeamId?: string;
  databaseMode: DatabaseMode;
  tokens?: {
    vercel?: string;
    supabase?: string;
  };
  supabase?: SupabaseLaunchInput;
  env: Record<string, string>;
}

export interface SupabaseProvisionResult {
  projectRef: string;
  projectName: string;
  projectStatus: string;
  dashboardUrl: string;
  postgresUrl: string;
  supabaseUrl: string;
  serviceRoleKey: string;
}

export interface VercelProvisionResult {
  projectId: string;
  projectName: string;
  projectUrl?: string;
  dashboardUrl: string;
  deploymentId?: string;
  reusedExisting?: boolean;
}

export interface LaunchResponseBody {
  ok: boolean;
  logs: LaunchLogEntry[];
  databaseMode?: DatabaseMode;
  projectId?: string;
  projectName?: string;
  resolvedTeamId?: string;
  projectUrl?: string;
  vercelDashboardUrl?: string;
  supabaseDashboardUrl?: string;
  durationMs: number;
  error?: string;
}

export interface VercelDomainVerificationRecord {
  type?: string;
  domain?: string;
  value?: string;
  reason?: string;
}

export interface VercelDomainResponse {
  name: string;
  verified: boolean;
  verification: VercelDomainVerificationRecord[];
  nameservers?: string[];
  configuredBy?: string;
}

export interface OAuthProviderState {
  connected: boolean;
  email?: string;
  login?: string;
  name?: string;
}

export interface OAuthStatusResponse {
  vercel: OAuthProviderState;
  supabase: OAuthProviderState;
}
