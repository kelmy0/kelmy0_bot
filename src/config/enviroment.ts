export function validateEnvironment() {
  const required = ["NODE_ENV", "TOKEN", "CLIENT_ID", "GUILD_TESTER_ID", "DATABASE_URL", "DB_PROVIDER"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing env vars: ${missing.join(", ")}`);
  }
}
