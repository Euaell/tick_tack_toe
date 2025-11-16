// Runtime environment configuration
// This allows environment variables to be set at runtime instead of build time

function getEnvVar(key: string, defaultValue: string): string {
  // Server-side: read from process.env
  if (typeof window === 'undefined') {
    return process.env[key] || defaultValue;
  }

  // Client-side: read from window.__ENV__ (injected at runtime)
  const windowEnv = (window as any).__ENV__;
  if (windowEnv && windowEnv[key]) {
    return windowEnv[key];
  }

  // Fallback to build-time env var
  return (process.env[key] || defaultValue);
}

export const ENV = {
  API_URL: getEnvVar('NEXT_PUBLIC_API_URL', 'http://localhost:8080'),
  AUTH_SECRET: getEnvVar('BETTER_AUTH_SECRET', ''),
  AUTH_URL: getEnvVar('BETTER_AUTH_URL', 'http://localhost:3000'),
} as const;

// Helper to determine if we should use the window location origin
export function getApiUrl(): string {
  // If in browser and API_URL is still localhost, try to use the current origin
  if (typeof window !== 'undefined' && ENV.API_URL.includes('localhost')) {
    return window.location.origin;
  }
  return ENV.API_URL;
}