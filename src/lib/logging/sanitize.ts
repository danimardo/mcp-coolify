/**
 * Automatic secret redaction for logs
 * Prevents accidental exposure of tokens, passwords, keys
 */

const SENSITIVE_KEYS = [
  // Credentials
  "token",
  "api_key",
  "apiKey",
  "API_KEY",
  "password",
  "secret",
  "SECRET",
  "private_key",
  "privateKey",
  "PRIVATE_KEY",
  "access_token",
  "accessToken",
  "ACCESS_TOKEN",
  "refresh_token",
  "refreshToken",
  "REFRESH_TOKEN",

  // Auth
  "authorization",
  "Authorization",
  "Bearer",
  "bearer",
  "credentials",

  // Keys
  "github_token",
  "githubToken",
  "GITHUB_TOKEN",
  "coolify_token",
  "coolifyToken",
  "COOLIFY_TOKEN",
  "ssh_key",
  "sshKey",
  "SSH_KEY",
  "certificate",
  "cert",

  // Database
  "connection_string",
  "connectionString",
  "CONNECTION_STRING",
  "db_password",
  "dbPassword",
  "DB_PASSWORD",
];

/**
 * Recursively redact sensitive values from an object
 */
export function sanitizeContext(context: unknown): unknown {
  if (context === null || context === undefined) {
    return context;
  }

  if (typeof context !== "object") {
    return context;
  }

  if (Array.isArray(context)) {
    return context.map(sanitizeContext);
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    if (isSensitiveKey(key)) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeContext(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Check if a key appears to contain sensitive data
 */
function isSensitiveKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_KEYS.some((sensitive) =>
    lowerKey.includes(sensitive.toLowerCase())
  );
}

/**
 * Sanitize an error object
 */
export function sanitizeError(error: Error): {
  message: string;
  code?: string;
  stack?: string;
} {
  const result: {
    message: string;
    code?: string;
    stack?: string;
  } = {
    message: error.message,
  };

  if ("code" in error) {
    result.code = String(error.code);
  }

  if ("stack" in error && error.stack) {
    result.stack = error.stack;
  }

  return result;
}
