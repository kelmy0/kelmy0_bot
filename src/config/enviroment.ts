export function validateEnvironment() {
  const required = ["NODE_ENV", "TOKEN", "CLIENT_ID", "GUILD_TESTER_ID", "DATABASE_URL", "DB_PROVIDER"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing env vars: ${missing.join(", ")}`);
  }

  return {
    nodeEnv: process.env.NODE_ENV!,
    token: process.env.TOKEN!,
    clientId: process.env.CLIENT_ID,
    guildIdTester: process.env.GUILD_TESTER_ID,
    dataBaseUrl: process.env.DATABASE_URL,
    db: {
      server: process.env.DB_SERVER!,
      port: parseInt(process.env.DB_PORT || "1433"),
      database: process.env.DB_NAME!,
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      encrypt: process.env.DB_ENCRYPT === "true",
      trustCertificate: process.env.DB_TRUST_CERTIFICATE === "true",
    },
  };
}
